import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { BarChart3, Settings, RefreshCw, Activity } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { fetchData, isLoading, lastUpdate } = useDashboard();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('pt-BR');
  };

  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Clean */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-slate-900">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Dashboard EntreGÔ
                  </h1>
                  <p className="text-xs text-gray-500">Bitrix24 Analytics</p>
                </div>
              </div>
              
              <nav className="flex space-x-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/'
                      ? 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === '/admin'
                      ? 'bg-slate-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </div>
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium">Última atualização: {formatLastUpdate(lastUpdate)}</span>
                </div>
              </div>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="font-medium">Atualizar</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content condicional para TV */}
      <main className={isDashboard 
        ? "max-w-full mx-auto h-[calc(100vh-60px)] overflow-hidden" 
        : "max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      }>
        {children}
      </main>
    </div>
  );
}
