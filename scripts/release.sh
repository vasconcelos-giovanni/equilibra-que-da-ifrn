#!/usr/bin/env bash
# =============================================================================
# Script de Release — Equilibra Que Dá!
# =============================================================================
#
# Uso:
#   ./scripts/release.sh [tipo] [--pre <label>] [--dry-run] [--push]
#
# Tipos (semver):
#   patch   - Correções de bugs            (1.0.0 → 1.0.1)
#   minor   - Novas funcionalidades        (1.0.0 → 1.1.0)
#   major   - Breaking changes             (1.0.0 → 2.0.0)
#
# Opções:
#   --pre <label>   Cria tag de pré-release  (ex: --pre beta → v1.1.0-beta.1)
#   --dry-run       Exibe o que seria feito sem executar nada
#   --push          Faz push da tag e do commit para o remote após o release
#
# Exemplos:
#   ./scripts/release.sh minor                    # 1.0.0 → 1.1.0
#   ./scripts/release.sh patch --push             # 1.0.0 → 1.0.1 + git push
#   ./scripts/release.sh minor --pre beta         # 1.0.0 → 1.1.0-beta.1
#   ./scripts/release.sh major --pre rc --push    # 1.0.0 → 2.0.0-rc.1 + push
#   ./scripts/release.sh patch --dry-run          # Simula sem executar
#   ./scripts/release.sh                          # Modo interativo
#
# Padrão de commits esperado: Conventional Commits
#   feat, fix, perf → incluídos no CHANGELOG
#   refactor, style, test, docs, chore, ci → omitidos do CHANGELOG público
#   feat! / BREAKING CHANGE → seção de breaking changes
#
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Cores e helpers de output
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}ℹ${NC}  $1"; }
success() { echo -e "${GREEN}✓${NC}  $1"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $1"; }
error()   { echo -e "${RED}✗${NC}  $1" >&2; exit 1; }
dry()     { echo -e "${CYAN}[dry-run]${NC} $1"; }
step()    { echo -e "\n${MAGENTA}▸${NC} ${BOLD}$1${NC}"; }

header() {
    echo ""
    echo -e "${BOLD}════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}   $1${NC}"
    echo -e "${BOLD}════════════════════════════════════════════════${NC}"
    echo ""
}

# -----------------------------------------------------------------------------
# Variáveis globais
# -----------------------------------------------------------------------------
DRY_RUN=false
DO_PUSH=false
PRE_LABEL=""
BUMP_TYPE=""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGE_JSON="$PROJECT_DIR/package.json"
CHANGELOG="$PROJECT_DIR/CHANGELOG.md"

# -----------------------------------------------------------------------------
# Parse de argumentos
# -----------------------------------------------------------------------------
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            patch|minor|major)
                BUMP_TYPE="$1"
                shift
                ;;
            --pre)
                shift
                [[ $# -gt 0 ]] || error "Flag --pre requer um label (ex: --pre beta)."
                PRE_LABEL="$1"
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --push)
                DO_PUSH=true
                shift
                ;;
            -h|--help)
                sed -n '3,30p' "$0"
                exit 0
                ;;
            *)
                error "Argumento desconhecido: '$1'. Use --help para ver o uso."
                ;;
        esac
    done
}

# -----------------------------------------------------------------------------
# Modo interativo
# -----------------------------------------------------------------------------
prompt_bump_type() {
    echo ""
    echo -e "${BOLD}Selecione o tipo de release:${NC}"
    echo "  1) patch  — Correções de bugs        (x.x.X)"
    echo "  2) minor  — Novas funcionalidades     (x.X.0)"
    echo "  3) major  — Breaking changes          (X.0.0)"
    echo ""
    read -rp "Tipo [1/2/3]: " choice
    case "$choice" in
        1|patch) BUMP_TYPE="patch" ;;
        2|minor) BUMP_TYPE="minor" ;;
        3|major) BUMP_TYPE="major" ;;
        *) error "Opção inválida: '$choice'." ;;
    esac
}

# -----------------------------------------------------------------------------
# Verificações de pré-condição
# -----------------------------------------------------------------------------
check_dependencies() {
    local missing=()
    for cmd in git node jq; do
        command -v "$cmd" &>/dev/null || missing+=("$cmd")
    done
    [[ ${#missing[@]} -eq 0 ]] || error "Dependências ausentes: ${missing[*]}. Instale-as antes de continuar."
}

check_git_state() {
    step "Verificando estado do repositório Git"

    # Verifica se é um repositório Git
    git -C "$PROJECT_DIR" rev-parse --git-dir &>/dev/null \
        || error "O diretório '$PROJECT_DIR' não é um repositório Git."

    # Verifica working tree limpa
    if ! git -C "$PROJECT_DIR" diff --quiet || ! git -C "$PROJECT_DIR" diff --cached --quiet; then
        warn "Working tree com alterações não commitadas."
        if [[ "$DRY_RUN" == "false" ]]; then
            read -rp "  Continuar mesmo assim? [s/N] " confirm
            [[ "$confirm" =~ ^[sS]$ ]] || error "Release cancelado. Faça commit ou stash das alterações."
        fi
    else
        success "Working tree limpa."
    fi

    # Branch atual
    local branch
    branch="$(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD)"
    info "Branch atual: ${BOLD}$branch${NC}"

    if [[ "$branch" != "main" && "$branch" != "master" && -z "$PRE_LABEL" ]]; then
        warn "Releases estáveis geralmente são feitas a partir de 'main'."
        if [[ "$DRY_RUN" == "false" ]]; then
            read -rp "  Continuar em '$branch'? [s/N] " confirm
            [[ "$confirm" =~ ^[sS]$ ]] || error "Release cancelado."
        fi
    fi
}

# -----------------------------------------------------------------------------
# Leitura de versão atual
# -----------------------------------------------------------------------------
get_current_version() {
    [[ -f "$PACKAGE_JSON" ]] || error "Arquivo package.json não encontrado em '$PROJECT_DIR'."
    jq -r '.version' "$PACKAGE_JSON"
}

# -----------------------------------------------------------------------------
# Cálculo de próxima versão
# -----------------------------------------------------------------------------
bump_version() {
    local current="$1"
    local type="$2"

    # Remove prefixo 'v' se presente
    current="${current#v}"

    # Separa major.minor.patch (ignora sufixo pré-release anterior)
    local base
    base="$(echo "$current" | grep -oE '^[0-9]+\.[0-9]+\.[0-9]+')"
    [[ -n "$base" ]] || error "Versão atual inválida: '$current'."

    local major minor patch
    IFS='.' read -r major minor patch <<< "$base"

    case "$type" in
        major) major=$((major + 1)); minor=0; patch=0 ;;
        minor) minor=$((minor + 1)); patch=0 ;;
        patch) patch=$((patch + 1)) ;;
    esac

    echo "${major}.${minor}.${patch}"
}

# Calcula sufixo de pré-release (ex: -beta.1, -rc.2)
get_pre_suffix() {
    local base_version="$1"   # ex: 1.2.0
    local label="$2"           # ex: beta

    # Conta quantas tags de pré-release já existem para essa versão+label
    local count
    count="$(git -C "$PROJECT_DIR" tag --list "v${base_version}-${label}.*" | wc -l | tr -d ' ')"
    echo "${label}.$((count + 1))"
}

# -----------------------------------------------------------------------------
# Geração de CHANGELOG
# -----------------------------------------------------------------------------

# Obtém a tag mais recente (ou o primeiro commit se não houver tag)
get_last_tag() {
    git -C "$PROJECT_DIR" describe --tags --abbrev=0 2>/dev/null \
        || git -C "$PROJECT_DIR" rev-list --max-parents=0 HEAD
}

# Classifica commits por tipo e gera as seções do CHANGELOG
generate_changelog_section() {
    local from="$1"
    local new_version="$2"
    local date
    date="$(date +%Y-%m-%d)"

    # Lê commits no formato: <hash> <mensagem completa>
    local log
    log="$(git -C "$PROJECT_DIR" log "${from}..HEAD" --pretty=format:"%H %s" --no-merges 2>/dev/null || true)"

    if [[ -z "$log" ]]; then
        echo ""
        return
    fi

    local breaking="" feats="" fixes="" perfs="" others=""

    while IFS= read -r line; do
        local hash subject
        hash="$(echo "$line" | awk '{print $1}')"
        subject="$(echo "$line" | cut -d' ' -f2-)"
        local short_hash="${hash:0:7}"
        local entry="- ${subject} (\`${short_hash}\`)"

        # Breaking change: tipo! ou BREAKING CHANGE no body/footer
        local body
        body="$(git -C "$PROJECT_DIR" log -1 --format="%b" "$hash" 2>/dev/null || true)"
        if echo "$subject" | grep -qE '^\w+(\(.+\))?!:' || echo "$body" | grep -q "BREAKING CHANGE"; then
            breaking+="$entry"$'\n'
        fi

        # Classifica por prefixo convencional
        if echo "$subject" | grep -qE '^feat(\(.+\))?(!)?:'; then
            feats+="$entry"$'\n'
        elif echo "$subject" | grep -qE '^fix(\(.+\))?(!)?:'; then
            fixes+="$entry"$'\n'
        elif echo "$subject" | grep -qE '^perf(\(.+\))?(!)?:'; then
            perfs+="$entry"$'\n'
        fi
    done <<< "$log"

    local section="## [${new_version}] — ${date}"$'\n'$'\n'

    if [[ -n "$breaking" ]]; then
        section+="### ⚠️ Breaking Changes"$'\n'$'\n'"${breaking}"$'\n'
    fi
    if [[ -n "$feats" ]]; then
        section+="### ✨ Novas Funcionalidades"$'\n'$'\n'"${feats}"$'\n'
    fi
    if [[ -n "$fixes" ]]; then
        section+="### 🐛 Correções"$'\n'$'\n'"${fixes}"$'\n'
    fi
    if [[ -n "$perfs" ]]; then
        section+="### ⚡ Performance"$'\n'$'\n'"${perfs}"$'\n'
    fi

    echo "$section"
}

update_changelog() {
    local new_version="$1"
    local last_tag="$2"

    step "Gerando entradas do CHANGELOG"

    local new_section
    new_section="$(generate_changelog_section "$last_tag" "$new_version")"

    if [[ -z "$(echo "$new_section" | tr -d '[:space:]')" ]]; then
        warn "Nenhum commit classificável (feat/fix/perf) encontrado desde $last_tag."
        warn "O CHANGELOG não será atualizado com novas entradas."
        return
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        dry "Adicionaria ao CHANGELOG:"
        echo ""
        echo "$new_section"
        return
    fi

    local header_line="# Changelog"$'\n'$'\n'"*Gerado automaticamente. Não edite manualmente as seções de versão.*"$'\n'$'\n'

    if [[ -f "$CHANGELOG" ]]; then
        # Preserva o cabeçalho existente e insere a nova seção logo abaixo
        local existing
        existing="$(cat "$CHANGELOG")"
        # Remove o cabeçalho padrão para reescrever uniformemente
        existing="$(echo "$existing" | sed '/^# Changelog/,/^\*Gerado automaticamente/d' | sed '/^$/{ /./!d }' | sed '1{/^$/d}')"
        printf '%s%s\n%s' "$header_line" "$new_section" "$existing" > "$CHANGELOG"
    else
        printf '%s%s' "$header_line" "$new_section" > "$CHANGELOG"
    fi

    success "CHANGELOG.md atualizado."
}

# -----------------------------------------------------------------------------
# Atualização de versão no package.json
# -----------------------------------------------------------------------------
update_package_version() {
    local new_version="$1"

    if [[ "$DRY_RUN" == "true" ]]; then
        dry "Atualizaria package.json: version → \"$new_version\""
        return
    fi

    local tmp
    tmp="$(mktemp)"
    jq --arg v "$new_version" '.version = $v' "$PACKAGE_JSON" > "$tmp"
    mv "$tmp" "$PACKAGE_JSON"

    success "package.json atualizado para $new_version."
}

# -----------------------------------------------------------------------------
# Commit e tag Git
# -----------------------------------------------------------------------------
create_git_tag() {
    local new_version="$1"
    local tag="v${new_version}"

    step "Criando commit e tag Git"

    if [[ "$DRY_RUN" == "true" ]]; then
        dry "git add package.json CHANGELOG.md"
        dry "git commit -m \"chore(release): ${tag}\""
        dry "git tag -a ${tag} -m \"Release ${tag}\""
        [[ "$DO_PUSH" == "true" ]] && dry "git push origin HEAD --tags"
        return
    fi

    # Verifica se a tag já existe
    if git -C "$PROJECT_DIR" tag --list "$tag" | grep -q "$tag"; then
        error "Tag '$tag' já existe. Escolha outro tipo de bump ou remova a tag existente."
    fi

    git -C "$PROJECT_DIR" add "$PACKAGE_JSON"
    [[ -f "$CHANGELOG" ]] && git -C "$PROJECT_DIR" add "$CHANGELOG"

    git -C "$PROJECT_DIR" commit -m "chore(release): ${tag}" \
        -m "Bump de versão gerado automaticamente pelo script de release."

    git -C "$PROJECT_DIR" tag -a "$tag" -m "Release ${tag}"

    success "Commit criado: chore(release): ${tag}"
    success "Tag criada: ${tag}"

    if [[ "$DO_PUSH" == "true" ]]; then
        step "Enviando para o repositório remoto"
        git -C "$PROJECT_DIR" push origin HEAD
        git -C "$PROJECT_DIR" push origin "$tag"
        success "Tag e commit publicados no remote."
    else
        info "Para publicar: git push origin HEAD && git push origin ${tag}"
    fi
}

# -----------------------------------------------------------------------------
# Ponto de entrada principal
# -----------------------------------------------------------------------------
main() {
    header "Equilibra Que Dá! — Script de Release"

    parse_args "$@"
    check_dependencies
    check_git_state

    # Modo interativo se o tipo não foi passado
    [[ -z "$BUMP_TYPE" ]] && prompt_bump_type

    # Lê versão atual
    local current_version
    current_version="$(get_current_version)"
    info "Versão atual: ${BOLD}${current_version}${NC}"

    # Calcula próxima versão
    local next_base
    next_base="$(bump_version "$current_version" "$BUMP_TYPE")"

    local next_version
    if [[ -n "$PRE_LABEL" ]]; then
        local pre_suffix
        pre_suffix="$(get_pre_suffix "$next_base" "$PRE_LABEL")"
        next_version="${next_base}-${pre_suffix}"
    else
        next_version="$next_base"
    fi

    info "Próxima versão: ${BOLD}${next_version}${NC}"
    info "Tipo de bump: ${BOLD}${BUMP_TYPE}${NC}"
    [[ "$DRY_RUN" == "true" ]] && warn "Modo dry-run ativo — nenhuma alteração será feita."
    echo ""

    # Obtém última tag para o CHANGELOG
    local last_tag
    last_tag="$(get_last_tag)"
    info "Commits desde: ${BOLD}${last_tag}${NC}"

    # Confirmação final (apenas em modo real)
    if [[ "$DRY_RUN" == "false" ]]; then
        echo ""
        read -rp "Confirma o release ${BOLD}v${next_version}${NC}? [s/N] " confirm
        [[ "$confirm" =~ ^[sS]$ ]] || error "Release cancelado pelo usuário."
    fi

    # Execução
    update_changelog "$next_version" "$last_tag"
    update_package_version "$next_version"
    create_git_tag "$next_version"

    echo ""
    header "Release v${next_version} concluído com sucesso!"
}

main "$@"
