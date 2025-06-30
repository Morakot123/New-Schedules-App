import Navbar from './Navbar';
import Footer from './Footer'; // NEW: Import the Footer component

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer /> {/* NEW: Add the Footer component */}
        </div>
    );
}