// src/components/dashboard/layout/Sidebar.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Home, ChevronDown } from 'lucide-react';
import menuItems from '../../../components/dashboard/DashboardRoutes';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`${
        isOpen ? 'block' : 'hidden'
      } bg-background fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] w-64 flex-col overflow-y-auto border-l lg:top-0 lg:flex lg:h-screen`}>
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      </div>

      <Link
        to="/"
        className="mt-1 flex items-center gap-3 border border-transparent px-4 py-3 text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white">
        <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <span className="font-medium">الصفحة الرئيسية</span>
      </Link>
      <Link
        to="/explore"
        className="flex items-center gap-3 border border-transparent px-4 py-3 text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white">
        <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <span className="font-medium">التصفح</span>
      </Link>

      <nav className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {menuItems.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="group mb-2 flex w-full items-center justify-between text-right">
                <h2 className="text-muted-foreground group-hover:text-foreground font-medium">
                  {section.title}
                </h2>
                <ChevronDown
                  className={`text-muted-foreground h-4 w-4 transition-transform ${
                    collapsedSections[section.id] ? '-rotate-180' : ''
                  }`}
                />
              </button>

              <ul
                className={`space-y-1 transition-all duration-200 ${
                  collapsedSections[section.id] ? 'hidden' : ''
                }`}>
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
};

export default Sidebar;
