import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react'; // NEW: Import SessionProvider
import Layout from '../components/Layout'; // NEW: Import Layout

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    // Wrap with SessionProvider to access session data across the app
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

export default MyApp;