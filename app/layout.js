import "./globals.css";

// const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: "Sepet - Все на расстоянии клика",
    description: "Сервис доставки еды, цветов и продуктов по Югу Молдовы. Более 35 заведений уже работают с нами.",
};

function RootLayout({ children }) {
    return (
        <html>
            <head>
                {" "}
                <link
                    rel="apple-touch-icon"
                    sizes="192x192"
                    href="/images/png/bird.png"
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
                    href="/images/png/bird.png"
                />{" "}
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
                <meta httpEquiv="Content-Language" content="ro,ru" />
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-973112552"></script>
                <script type="text/javascript" dangerouslySetInnerHTML={{ __html: "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'AW-973112552');" }}></script>
            </head>
            <body className="bg-cyan-50 h-full">{children}</body>
        </html>
    );
}

export default RootLayout