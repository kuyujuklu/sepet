const { createProxyMiddleware } = require("http-proxy-middleware");

// CRA's simple package.json "proxy" field forwards paths verbatim - fine
// for /api/* (the backend already serves everything under /api), but
// uploaded images (courier photos, dish/category images, pub logos/QR
// codes) are all requested from the frontend as /api-static/... while the
// backend only serves that same content under plain /static/... (see
// main.go's app.Static("/static", "clientfiles")). Whatever sits in front
// of the deployed site evidently rewrites that prefix - locally there was
// nothing doing it, so every one of those images 404's in dev. This file
// replaces the simple "proxy" field (CRA uses one or the other, not both)
// and reproduces both paths explicitly.
// app.use(path, proxy) has Express strip `path` from req.url before the
// middleware ever sees it, which silently drops the prefix the backend
// expects (a request for /api/courier/ arrives at the target as plain
// /courier/, 404-ing there). Mounting at the root and matching via
// `pathFilter` instead keeps the full original URL intact.
module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      pathFilter: "/api-static",
      target: "http://localhost:9999",
      changeOrigin: true,
      pathRewrite: { "^/api-static": "/static" },
    })
  );

  app.use(
    createProxyMiddleware({
      pathFilter: "/api",
      target: "http://localhost:9999",
      changeOrigin: true,
    })
  );
};
