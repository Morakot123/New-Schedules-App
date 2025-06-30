import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="th">
      <Head>
        {/* Preconnect to Google Fonts domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Load the Prompt font with specific weights and the 'swap' display strategy */}
        {/* Using 'display=swap' ensures text remains visible during font loading */}
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Add a favicon link here if you want a global favicon for all pages */}
        {/* <link rel="icon" href="/favicon.ico" /> */}

      </Head>
      <body className="font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}