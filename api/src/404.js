export default (app) => {
  const listRoutes = () => {
    const routes = [];

    const processStack = (stack, basePath = '') => {
      stack.forEach((middleware) => {
        if (middleware.route) {
          // Direct route
          const methods = Object.keys(middleware.route.methods)
            .map((method) => method.toUpperCase())
            .join(', ');
          const paths = Array.isArray(middleware.route.path)
            ? middleware.route.path
            : [middleware.route.path];
          paths.forEach((path) => {
            routes.push(
              `${methods} ${
                basePath && !basePath.startsWith('/')
                  ? `/${basePath}`
                  : basePath
              }${path}`
            );
          });
        } else if (middleware.name === 'router') {
          // Nested router
          const path = middleware.regexp
            ? basePath +
              middleware.regexp.source
                .replace(/\^\\\/?/g, '') // Remove leading ^\/
                .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, '') // Remove trailing matching regex
                .replace(/\\\//g, '/') // Replace escaped slashes
            : basePath;

          processStack(middleware.handle.stack, path);
        }
      });
    };

    processStack(app._router.stack);

    return routes
      .filter(
        (route) =>
          !route.includes('*') && // Exclude wildcards
          !route.includes('favicon') &&
          route.length > 0
      )
      .map((route) => route.replace(/\/\?\(\?=\/\|\$\)/g, '')) // Clean redundant patterns
      .sort((a, b) => {
        // Extract the route part from the string (e.g., GET /api/auth/@me/...)
        const routeA = a.split(' ')[1];
        const routeB = b.split(' ')[1];

        // Compare the segments to determine which one should come first
        return routeA.localeCompare(routeB);
      });
  };

  return (req, res) => {
    res.status(404).json({
      error: 'مسار غير موجود',
      message: `Route ${req.method} ${req.path} does not exist.`,
      availableRoutes: listRoutes(),
    });
  };
};
