import "./globals.css";

// const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: "Qr-меню Молдова",
    description: "Sandex md Qr code Молдова. Меню для вашего заведения. Удобно, быстро, красиво, дешево.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
              <head>
                  {" "}
                  <link
                      rel="apple-touch-icon"
                      sizes="192x192"
                      href="/images/png/qr-logo-192x192.png"
                  />{" "}
                  <link
                      rel="icon"
                      sizes="32x32"
                      href="/favicon.ico"
                  />{" "}
                  <link
                      rel="icon"
                      type="image/png"
                      sizes="16x16"
                      href="/images/png/qr-logo-16x16.png"
                  />{" "}
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
                <meta httpEquiv="Content-Language" content="ro,ru" />
              </head>
            <body>{children}</body>
        </html>
    );
}
