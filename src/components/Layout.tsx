import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { BarChart3, Settings, RefreshCw, Sparkles, Activity } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header com gradiente */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-r from-pink-400/20 to-indigo-400/20 blur-2xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-30"></div>
                  <div className="relative p-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Dashboard EntreGÔ
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Bitrix24 Analytics</p>
                </div>
              </div>
              
              <nav className="flex space-x-2">
                <Link
                  to="/"
                  className={`group relative px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    location.pathname === '/'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/60 backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                  {location.pathname === '/' && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
                  )}
                </Link>
                <Link
                  to="/admin"
                  className={`group relative px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    location.pathname === '/admin'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/60 backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </div>
                  {location.pathname === '/admin' && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl"></div>
                  )}
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-medium">Última atualização: {formatLastUpdate(lastUpdate)}</span>
                </div>
              </div>
              <Button
                className={`group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 border-0 ${
                  isLoading ? 'animate-pulse' : 'hover:scale-105'
                }`}
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span className="font-semibold">Atualizar</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content com fundo animado */}
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        {children}
      </main>
    </div>
  );
}
