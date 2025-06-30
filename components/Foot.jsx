export default function Footer() {
    return (
        <footer className="w-full bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-6 text-center transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} LAB MANAGER. All rights reserved.
                </p>
                <p className="text-xs mt-1">
                    Developed with ❤️ by Morakot Panpichit / Organization.
                </p>
            </div>
        </footer>
    );
}