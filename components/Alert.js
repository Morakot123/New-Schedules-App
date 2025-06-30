import { useEffect, useState } from 'react';

// Icon components for each alert type
const Icons = {
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
};

export default function Alert({ type = 'info', message, dismissible = false, onDismiss }) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return null;
    }

    const baseClasses = 'flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 transform';

    // Define color and icon based on the type
    const typeClasses = {
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    }[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

    const icon = Icons[type] || Icons.info;

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    return (
        <div
            role="alert"
            className={`${baseClasses} ${typeClasses} shadow-md animate-fade-in-down`}
        >
            <div className="flex-shrink-0">{icon}</div>
            <p className="flex-grow">{message}</p>
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="ml-auto p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="Dismiss alert"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}