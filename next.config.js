/** @type {import('next').NextConfig} */

console.log("apiServ", process.env.API_SERV)

module.exports = {
    env: {
      API_SERV: process.env.API_SERV,
    },
    async rewrites() {
      return [
        // {
        //   source: '/api/:path*',
        //   destination: `http://localhost/api/:path*` // Proxy to Backend
        // },
        // {
        //   source: '/api-static/:path*',
        //   destination: `http://localhost/static/:path*` // Proxy to Backend
        // },
        // {
        //   source: '/api/:path*',
        //   destination: `http://localhost:3333/api/:path*` // Proxy to Backend
        // },
        {
          source: '/api-static/:path*',
          destination: `http://localhost/api-static/:path*` // Proxy to Backend
        },
      ]
    }
  }
  