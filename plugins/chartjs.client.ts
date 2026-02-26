import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    LineElement,
    PointElement,
    Filler,
} from 'chart.js'

export default defineNuxtPlugin(() => {
    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale,
        ArcElement,
        LineElement,
        PointElement,
        Filler,
    )
})
