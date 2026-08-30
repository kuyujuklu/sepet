/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

console.log("apiServ", process.env.API_SERV);

module.exports = (phase) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;

    //DEV CONFIG
    console.log("isDev ", isDev);

    if (isDev) {
        return {
            env: {
                API_SERV: process.env.API_SERV,
                IS_DEV: process.env.IS_DEV
            },
            // Next's own optimizer at /_next/image resolves a relative src by
            // fetching it back through this same server, which in production has
            // no route for /api-static (nginx serves it straight off disk, and
            // the prod rewrites below are empty) - so every dish photo 404s.
            // The images are already sized by the backend (image_thumb_file_name
            // is generated on upload), and this box is a 1-core droplet, so
            // re-encoding them here buys nothing. Unoptimized emits a plain
            // <img> with the original URL and lets nginx serve it.
            images: {
                unoptimized: true,
            },
            async rewrites() {
                return [
                    {
                        source: '/api/:path*',
                        destination: `http://sepet.md/api/:path*` // Proxy to Backend
                    },
                    {
                        source: '/ws/:path*',
                        destination: `http://sepet.md/ws/:path*` // Proxy to Backend
                    },
                    {
                        source: "/api-static/:path*",
                        destination: `https://sepet.md/api-static/:path*`, // Proxy to Backend
                    },
                ];
            },
        };
    }

    //PROD CONFIG
    return {
        env: {
            API_SERV: process.env.API_SERV,
            IS_DEV: process.env.IS_DEV,
        },
        // Same reason as the dev branch above - kept identical on purpose, so
        // images cannot work locally and break in production again.
        images: {
            unoptimized: true,
        },
        async rewrites() {
            return [
                // {
                //   source: '/api/:path*',
                //   destination: `http://localhost:9999/api/:path*` // Proxy to Backend
                // },
            ];
        },
    };
};
