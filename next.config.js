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
            async rewrites() {
                    return [
                        {
                          source: '/api/:path*',
                          destination: `http://localhost:9999/api/:path*` // Proxy to Backend
                        },
                        {
                          source: '/ws/:path*',
                          destination: `http://localhost:9999/ws/:path*` // Proxy to Backend
                        },
                        {
                            source: "/api-static/:path*",
                            destination: `http://localhost:9999/static/:path*`, // Proxy to Backend
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
