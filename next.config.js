/** @type {import('next').NextConfig} */

console.log("apiServ", process.env.API_SERV)

module.exports = {
    env: {
      API_SERV: process.env.API_SERV,
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `http://qrcodesapi/api/:path*` // Proxy to Backend
        },
        {
          source: '/api-static/:path*',
          destination: `http://qrcodesapi/static/:path*` // Proxy to Backend
        },
      ]
    }
  }
  