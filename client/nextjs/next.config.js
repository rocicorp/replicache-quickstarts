const withTM = require('next-transpile-modules')([
  'replicache-quickstarts-shared',
]);

module.exports = withTM({
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
});
