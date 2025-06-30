import Navbar from './navbar/Navbar'
import Footer from './Footer'
import { useEffect, useState } from 'react'

export default function Layout({ children, user }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 1. Check local storage for a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 2. If no saved preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []); // Run only once on mount

  useEffect(() => {
    // 3. Apply the theme class to the <html> element and save to local storage
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]); // Run whenever the theme state changes

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="layout-wrapper flex min-h-screen flex-col bg-white text-gray-800 transition-colors duration-500 dark:bg-gray-900 dark:text-gray-100">
      {/* Pass the theme state and toggle function to the Navbar */}
      <Navbar user={user} toggleTheme={toggleTheme} theme={theme} />
      <main className="container mx-auto flex-grow px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}