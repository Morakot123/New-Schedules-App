export default function DashboardCard({ icon, title, value }) {
    return (
        <div className="stat-card group relative overflow-hidden transition-all duration-300 ease-in-out">
            {/* Background overlay for hover effect */}
            <div className="absolute inset-0 z-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:bg-black"></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Icon */}
                <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:text-emerald-500">
                    {icon}
                </div>

                {/* Title */}
                <h3 className="text-center text-lg font-semibold text-gray-800 transition-colors duration-300 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    {title}
                </h3>

                {/* Value */}
                <p className="mt-2 text-4xl font-bold tracking-tight transition-colors duration-300 dark:text-emerald-400 group-hover:text-emerald-600">
                    {value}
                </p>
            </div>
        </div>
    );
}