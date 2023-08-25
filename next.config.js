/** @type {import('next').NextConfig} */

module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3333/:path*' // Proxy to Backend
        },
        {
          source: '/api-static/:path*',
          destination: 'http://localhost:3333/static/:path*' // Proxy to Backend
        },
      ]
    }
  }
  