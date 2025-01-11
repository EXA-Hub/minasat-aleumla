// src/components/dashboard/layout/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
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
      } lg:flex h-[calc(100vh-4rem)] lg:h-screen w-64 flex-col fixed right-0 top-16 lg:top-0 border-l bg-background z-40 overflow-y-auto`}
    >
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="space-y-6 p-4">
          {menuItems.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full text-right mb-2 group"
              >
                <h2 className="font-medium text-muted-foreground group-hover:text-foreground">
                  {section.title}
                </h2>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    collapsedSections[section.id] ? '-rotate-180' : ''
                  }`}
                />
              </button>

              <ul
                className={`space-y-1 transition-all duration-200 ${
                  collapsedSections[section.id] ? 'hidden' : ''
                }`}
              >
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                          : 'hover:bg-muted'
                      }`}
                    >
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

export default Sidebar;
