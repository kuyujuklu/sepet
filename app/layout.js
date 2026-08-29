import "./globals.css";
import Script from "next/script";

// const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Sepet - Все на расстоянии клика",
  description: "Сервис доставки еды, цветов и продуктов по Югу Молдовы. Более 35 заведений уже работают с нами.",
};

function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-WGQVXPGB');` }}>

        </script>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WGQVXPGB"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/images/png/bird.png"
        />
        <link
          rel="icon"
          sizes="32x32"
          href="/favicon.ico"
        />


        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/png/bird.png"
        />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="Content-Language" content="ro,ru" />
      </head>
      <body className="bg-slate-50 h-full">
        {children}
        <Script
          id="jivo-head"
          type="text/javascript"
          strategy="afterInteractive"
          src="https://code.jivo.ru/widget/cFI9nv5DI4"
        >
        </Script>
      </body>
    </html >
  );
}

export default RootLayout
