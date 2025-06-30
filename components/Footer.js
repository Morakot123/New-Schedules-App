export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="home-footer mt-12 py-8 px-6 text-center text-sm">
            <div className="max-w-4xl mx-auto opacity-85 transition-opacity hover:opacity-100">
                <p className="text-gray-600 dark:text-gray-400">
                    © {currentYear} ระบบจัดตารางห้องปฏิบัติการ
                </p>
                <p className="mt-1 text-gray-500 dark:text-gray-500">
                    จัดทำโดย <a href="https://github.com/your-profile" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:underline transition-colors">มรกต พรรณพิจิตร</a>
                </p>
            </div>
        </footer>
    );
}