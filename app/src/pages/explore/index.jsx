// src/pages/explore/index.jsx
import { useLocation, Navigate } from 'react-router-dom';
import ExploreLayout from '../../components/explore/layout/ExploreLayout';

const ExplorePage = () => {
  const location = useLocation();

  // Redirect to overview if accessing /explore directly
  if (['/explore', '/explore/'].includes(location.pathname))
    return <Navigate to="/explore/overview" replace />;

  return <ExploreLayout />;
};

export default ExplorePage;
