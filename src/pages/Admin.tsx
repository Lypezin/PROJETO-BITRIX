import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboard } from '../hooks/useDashboard';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Filter, RefreshCw, Settings2, Calendar, Zap, Sparkles, PlusCircle, Trash2, Map } from 'lucide-react';

export default function Admin() {
  const { 
    filters, 
    setFilters, 
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

  const handleAddCity = () => {
    addCity(cityName, cityValue);
    setCityName('');
    setCityValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header com cores sutis */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
            <Settings2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Painel de Administração
            </h1>
            <p className="text-slate-700 text-sm mt-1">
              Configure filtros avançados e exporte dados em tempo real
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg border border-yellow-300 shadow-sm">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Sistema Integrado Bitrix24</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 rounded-lg bg-blue-600 shadow-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-blue-900">
                  Configuração de Filtros
                </span>
              </CardTitle>
              <p className="text-blue-700 text-sm mt-1">Defina períodos personalizados para análise detalhada</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Filtro de Data de Envio */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Período de Envio</h3>
                    <p className="text-sm text-gray-600">Selecione o intervalo para contatos enviados</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={format(dataEnvioRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDataEnvioRange(prev => ({ ...prev, start: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={format(dataEnvioRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDataEnvioRange(prev => ({ ...prev, end: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Separador visual */}
              <div className="border-t border-gray-200"></div>

              {/* Filtro de Data de Liberação */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Período de Liberação</h3>
                    <p className="text-sm text-gray-600">Selecione o intervalo para contatos liberados</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={format(dataLiberacaoRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, start: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={format(dataLiberacaoRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, end: new Date(e.target.value.replace(/-/g, '/')) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleApplyFilters} 
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white transition-colors duration-200 py-2.5 px-4 rounded-lg font-medium"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4" />
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
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2.5 px-4 rounded-lg font-medium"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Resetar Hoje
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Gerenciador de Custos por Cidade */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 rounded-lg bg-orange-500 shadow-lg">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-orange-900">
                  Gerenciar Custos por Cidade
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome da Cidade"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/70 transition-colors duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Custo (R$)"
                    value={cityValue}
                    onChange={(e) => setCityValue(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/70 transition-colors duration-200"
                  />
                </div>
                <Button
                  onClick={handleAddCity}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200 py-2.5 px-4 rounded-lg font-medium shadow-md"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PlusCircle className="h-4 w-4" />
                    <span>Adicionar Custo</span>
                  </div>
                </Button>
              </div>

              <div className="mt-6 space-y-2">
                {cityData.length > 0 && cityData.map(city => (
                  <div key={city.id} className="flex justify-between items-center bg-white/70 p-3 rounded-lg border border-orange-300 shadow-sm">
                    <div>
                      <span className="font-semibold text-orange-900">{city.name}</span>
                      <span className="text-orange-700">: R$ {city.value}</span>
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
