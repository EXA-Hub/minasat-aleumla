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
      <div className="space-y-2 p-4">
        {menuItems.map((section) => (
          <div key={section.id} className="rounded-xl backdrop-blur-sm">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full p-3 text-right rounded-lg hover:bg-primary/5 transition-all duration-300"
            >
              <span className="font-medium text-foreground/90">
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
              }`}
            >
              <div className="space-y-1 p-2">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary shadow-lg shadow-primary/20'
                        : 'hover:bg-primary/5 text-foreground/70 hover:text-foreground'
                    }`}
                  >
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
    <div className="fixed right-4 top-4 h-[calc(100vh-2rem)] w-72">
      <div className="h-full rounded-2xl bg-background/30 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden">
        <SidebarContent />
      </div>
    </div>
  );
};

export default Sidebar;
