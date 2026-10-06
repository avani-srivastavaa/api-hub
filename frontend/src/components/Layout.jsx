import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Plus, Settings, Home } from 'lucide-react';

function Layout() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/connectors', label: 'Connectors', icon: Settings },
    { path: '/documentation', label: 'Documentation', icon: BookOpen },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">API Hub</h1>
          <p className="text-sm text-gray-600">Admin Dashboard</p>
        </div>

        <nav className="p-4 space-y-2">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 w-64">
          <Link
            to="/connectors/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            New Connector
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {navLinks.find((link) => link.path === location.pathname)?.label ||
                'Dashboard'}
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
