export default function SummaryItem({ icon, text, value }) {
    return (
        <li className="group flex items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            {/* Icon Container with hover effect */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-3xl transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-900 dark:text-emerald-300">
                {icon}
            </div>

            {/* Text and Value */}
            <div className="flex flex-col">
                <p className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {text}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value}
                </p>
            </div>
        </li>
    );
}