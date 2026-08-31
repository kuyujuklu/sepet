import "./globals.css";
import Script from "next/script";

// const inter = Inter({ subsets: ['latin'] })

const TITLE = "Sepet - Все на расстоянии клика";
const DESCRIPTION = "Сервис доставки еды, цветов и продуктов по Югу Молдовы. Более 35 заведений уже работают с нами.";

export const metadata = {
  // Lets every relative URL in metadata (og:image from opengraph-image.js,
  // per-pub images below) resolve to a real, publicly-fetchable address -
  // link-preview bots (WhatsApp/Instagram/Facebook) fetch server-side and
  // silently give up on a relative or unresolvable one.
  metadataBase: new URL("https://sepet.md"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sepet.md",
    siteName: "Sepet",
    locale: "ru_MD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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

        {/* Yandex.Metrika counter - ecommerce:"dataLayer" below reads the
            same add_to_cart/begin_checkout/purchase events already pushed
            for GTM (see utils/analytics.js), so it picks up real order
            values with no separate wiring. */}
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `(function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108776463', 'ym');

          ym(108776463, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});` }}>
        </script>
        <noscript><div><img src="https://mc.yandex.ru/watch/108776463" style={{ position: 'absolute', left: '-9999px' }} alt="" /></div></noscript>

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
