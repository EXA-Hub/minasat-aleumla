// react-app/src/main.jsx
console.log(
  '%c!!! تـحـذيـر !!!',
  `
    color: white;
    background-color: red;
    font-size: 40px;
    font-weight: bold;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    display: block;
    width: 100%;
    margin: 10px 0;
  `
);

console.log(
  '%c!!! لا تلصق أي شيء لا تعرفه !!!',
  `
    color: black;
    background-color: yellow;
    font-size: 25px;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    display: block;
    width: 100%;
    margin: 10px 0;
  `
);

console.log(
  '%cهذا الجزء من المتصفح مخصص للمطورين. إذا طُلب منك لصق أي شيء هنا، فقد يكون ذلك محاولة لاختراق حسابك. لا تشارك هذه المعلومات مع أي شخص.',
  `
    color: white;
    background-color: #333;
    font-size: 16px;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    display: block;
    width: 100%;
    margin: 10px 0;
  `
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import dashboardMenuItems from './components/dashboard/DashboardRoutes';
import exploreMenuItems from './components/explore/ExploreRoutes';
import { ReferralRedirect } from './context/ReferralRedirect';
import { ModalProvider } from './context/ModalManager';
import { ColorProvider } from './context/ColorContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './pages/core/ErrorBoundary';
import LoadingPage from './pages/core/loading.jsx';
import { errorRoutes } from './errorConfig.jsx';
import RecoveryPage from './pages/RecoveryPage';
import DashboardPage from './pages/dashboard';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/explore';
import LoginPage from './pages/LoginPage';

import './index.css';

// Import all .jsx files from autoRouting directory
const autoRouting = import.meta.glob('./pages/autoRouting/**/*.jsx');

// Convert file paths to route paths and components
const dynamicRoutes = Object.entries(autoRouting).map(([path, component]) => {
  // Extract the route path from the file path
  let routePath = path
    .replace('./pages/autoRouting/', '') // Remove the base path
    .replace(/\.jsx$/, '') // Remove file extension
    .toLowerCase(); // Convert to lowercase

  return {
    path: `/${routePath}`,
    component: React.lazy(component),
  };
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <React.StrictMode>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      <ColorProvider>
        <ThemeProvider>
          <ModalProvider>
            <Router>
              <Routes>
                {/* Static routes */}
                <Route key={'/'} path="/" element={<LandingPage />} />
                <Route
                  key={'/ref/:userId'}
                  path="/ref/:userId"
                  element={<ReferralRedirect />}
                />
                <Route key={'/login'} path="/login" element={<LoginPage />} />
                <Route
                  key={'/recoverAccount'}
                  path="/recoverAccount"
                  element={<RecoveryPage />}
                />

                {/* Dashboard routes */}
                <Route
                  key={'/dashboard'}
                  path="/dashboard"
                  element={<DashboardPage />}>
                  {dashboardMenuItems.flatMap((section) =>
                    section.items.map(
                      ({ path, component }) =>
                        component && (
                          <Route
                            key={path}
                            path={path}
                            element={
                              <React.Suspense fallback={<LoadingPage />}>
                                {React.createElement(component)}
                              </React.Suspense>
                            }
                          />
                        )
                    )
                  )}
                </Route>

                {/* Explore routes */}
                <Route
                  key={'/explore'}
                  path="/explore"
                  element={<ExplorePage />}>
                  {exploreMenuItems.flatMap((section) =>
                    section.items.map(
                      ({ path, component }) =>
                        component && (
                          <Route
                            key={path}
                            path={path}
                            element={
                              <React.Suspense fallback={<LoadingPage />}>
                                {React.createElement(component)}
                              </React.Suspense>
                            }
                          />
                        )
                    )
                  )}
                </Route>

                {/* Dynamic routes from autoRouting directory */}
                {dynamicRoutes.map(({ path, component: Component }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <React.Suspense fallback={<LoadingPage />}>
                        <Component />
                      </React.Suspense>
                    }
                  />
                ))}

                {/* Dynamically generated error routes */}
                {errorRoutes
                  .filter((route) => route.path) // Filter out routes without a `path`
                  .map((route) => (
                    <Route
                      key={route.path} // Ensure the key is unique
                      path={route.path}
                      element={route.element}
                    />
                  ))}

                {/* Catch-all route for unknown pages */}
                <Route
                  key={'*'}
                  path="*"
                  element={<Navigate to="/error/not-found" />}
                />
              </Routes>
            </Router>
          </ModalProvider>
        </ThemeProvider>
      </ColorProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
