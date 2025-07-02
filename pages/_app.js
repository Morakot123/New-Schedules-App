// pages/_app.js
import '../styles/globals.css'; // Your global CSS
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes'; // Import ThemeProvider
import Navbar from '../components/Navbar/Navbar'; // Correct path to your Navbar component

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {/* ThemeProvider should wrap the entire application to provide theme context */}
      <ThemeProvider attribute="class">
        <Navbar /> {/* Navbar is rendered globally here */}
        <Component {...pageProps} /> {/* This is where your page content (potentially wrapped by Layout) will be rendered */}
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
