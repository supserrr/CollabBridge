import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#121212" />
        <meta name="description" content="CollabBridge - Connect Event Planners with Creative Professionals" />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CollabBridge - Connect Event Planners with Creative Professionals" />
        <meta property="og:description" content="The premier marketplace for event planning collaborations" />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body className="antialiased dark-theme">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
