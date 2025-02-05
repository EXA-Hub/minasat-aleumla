import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import menuItems from '../../../components/explore/ExploreRoutes';

const SidebarContent = () => {
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
    <nav className="h-full overflow-y-auto">
      <div className="flex flex-col gap-y-2 p-4">
        {menuItems.map((section) => (
          <div key={section.id} className="rounded-xl backdrop-blur-xs">
            <button
              onClick={() => toggleSection(section.id)}
              className="hover:bg-5primary flex w-full items-center justify-between rounded-lg p-3 text-right transition-all duration-300">
              <span className="text-90foreground font-medium">
                {section.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-500 ${
                  !collapsedSections[section.id] ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                !collapsedSections[section.id]
                  ? 'max-h-[1000px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}>
              <div className="space-y-1 p-2">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-10primary text-primary shadow-20primary shadow-lg'
                        : 'text-70foreground hover:bg-5primary hover:text-foreground'
                    }`}>
                    <item.icon
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isActive(item.path) ? 'scale-110' : ''
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};

const Sidebar = () => {
  return (
    <div className="fixed top-4 right-4 h-[calc(100vh-2rem)] w-72">
      <div className="bg-30background h-full overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl">
        <SidebarContent />
      </div>
    </div>
  );
};

export default Sidebar;
