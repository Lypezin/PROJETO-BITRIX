import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboard } from '../hooks/useDashboard';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Download, Filter, RefreshCw, Settings2, Calendar, FileSpreadsheet, Zap, Sparkles, PlusCircle, Trash2, Map } from 'lucide-react';

const formatDate = (date: Date) => format(date, "dd/MM/yyyy");

export default function Admin() {
  const { 
    filters, 
    setFilters, 
    exportData, 
    isLoading, 
    cityData, 
    addCity, 
    removeCity 
  } = useDashboard();
  
  const [dataEnvioRange, setDataEnvioRange] = useState({
    start: filters.dataEnvioStart,
    end: filters.dataEnvioEnd,
  });
  const [dataLiberacaoRange, setDataLiberacaoRange] = useState({
    start: filters.dataLiberacaoStart,
    end: filters.dataLiberacaoEnd,
  });
  const [cityName, setCityName] = useState('');
  const [cityValue, setCityValue] = useState('');

  const handleApplyFilters = () => {
    setFilters({
      dataEnvioStart: startOfDay(dataEnvioRange.start),
      dataEnvioEnd: endOfDay(dataEnvioRange.end),
      dataLiberacaoStart: startOfDay(dataLiberacaoRange.start),
      dataLiberacaoEnd: endOfDay(dataLiberacaoRange.end),
    });
  };

  const handleExport = () => {
    exportData();
  };

  const handleAddCity = () => {
    addCity(cityName, cityValue);
    setCityName('');
    setCityValue('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="relative z-10 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Settings2 className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
              Painel de Administração
            </h1>
            <p className="text-pink-100 text-lg font-medium mt-2">
              Configure filtros avançados e exporte dados em tempo real
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Sistema Integrado Bitrix24</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 animate-in slide-in-from-left duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-2xl group-hover:blur-xl transition-all duration-500"></div>
            
            <CardHeader className="relative z-10 pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Configuração de Filtros Avançados
                </span>
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Defina períodos personalizados para análise detalhada</p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-8">
              {/* Filtro de Data de Envio */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Período de Envio</h3>
                    <p className="text-sm text-gray-500">Selecione o intervalo para contatos enviados</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={format(dataEnvioRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDataEnvioRange(prev => ({ ...prev, start: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-blue-50/50 hover:bg-blue-50 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={format(dataEnvioRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDataEnvioRange(prev => ({ ...prev, end: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-blue-50/50 hover:bg-blue-50 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Separador visual */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                  <div className="px-4 bg-white text-sm text-gray-500 font-medium">
                    <Zap className="h-4 w-4 inline mr-1" />
                  </div>
                </div>
              </div>

              {/* Filtro de Data de Liberação */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Período de Liberação</h3>
                    <p className="text-sm text-gray-500">Selecione o intervalo para contatos liberados</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={format(dataLiberacaoRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, start: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50 hover:bg-emerald-50 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={format(dataLiberacaoRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, end: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50 hover:bg-emerald-50 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação Premium */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleApplyFilters} 
                  className="group relative flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border-0 py-3 px-6 rounded-2xl font-semibold text-base hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Aplicar Filtros</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    const start = startOfDay(today);
                    const end = endOfDay(today);
                    setDataEnvioRange({ start, end });
                    setDataLiberacaoRange({ start, end });
                    setFilters({
                      dataEnvioStart: start,
                      dataEnvioEnd: end,
                      dataLiberacaoStart: start,
                      dataLiberacaoEnd: end,
                    });
                  }}
                  className="group border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-800 transition-all duration-300 py-3 px-6 rounded-2xl font-semibold text-base hover:scale-[1.02]"
                >
                  <Zap className="h-5 w-5 mr-2 group-hover:text-yellow-500 transition-colors duration-300" />
                  Resetar Hoje
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status e Exportação Premium */}
        <div className="space-y-8">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <span className="font-bold text-lg">Exportação de Dados</span>
              </CardTitle>
              <p className="text-emerald-100 text-sm">Baixe relatórios completos em Excel</p>
            </CardHeader>
            
            <CardContent className="relative z-10 space-y-6">
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
                    <span className="text-sm font-semibold text-emerald-100">Período de Envio</span>
                  </div>
                  <p className="text-white font-bold">
                    {formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                    <span className="text-sm font-semibold text-emerald-100">Período de Liberação</span>
                  </div>
                  <p className="text-white font-bold">
                    {formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={isLoading}
                className={`group w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 shadow-lg transition-all duration-300 py-4 px-6 rounded-2xl font-bold text-base ${
                  isLoading ? 'animate-pulse cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Download className={`h-5 w-5 ${isLoading ? 'animate-bounce' : 'group-hover:scale-110 transition-transform duration-300'}`} />
                  <span>{isLoading ? 'Processando Exportação...' : 'Exportar para Excel'}</span>
                </div>
              </Button>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs text-emerald-100 font-medium">
                    Exportação baseada no período de <strong>Data de Envio</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gerenciador de Cidades */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gerenciar Cidades
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome da Cidade"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 bg-amber-50/50 hover:bg-amber-50 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={cityValue}
                    onChange={(e) => setCityValue(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 bg-amber-50/50 hover:bg-amber-50 font-medium"
                  />
                </div>
                <Button
                  onClick={handleAddCity}
                  className="w-full group relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg transition-all duration-300 border-0 py-3 rounded-2xl font-semibold text-base"
                >
                  <div className="relative flex items-center justify-center space-x-2">
                    <PlusCircle className="h-5 w-5" />
                    <span>Adicionar Cidade</span>
                  </div>
                </Button>
              </div>

              <div className="mt-6 space-y-2">
                {cityData.length > 0 && cityData.map(city => (
                  <div key={city.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-gray-200">
                    <div>
                      <span className="font-bold text-gray-800">{city.name}</span>
                      <span className="text-gray-600">: {city.value}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCity(city.id)} className="text-red-500 hover:bg-red-100 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
