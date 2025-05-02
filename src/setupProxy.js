const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // CRM 서버 프록시
  app.use(
    '/crm',
    createProxyMiddleware({
      target: 'http://localhost:8081',
      changeOrigin: true,
    //   pathRewrite: { '^/crm': '' },
    })
  );

  // PMS 서버 프록시
  app.use(
    '/pms',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    //   pathRewrite: { '^/pms': '' },
    })
  );
};