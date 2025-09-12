import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboard } from '../hooks/useDashboard';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Filter, Settings2, Calendar, Zap, PlusCircle, Trash2, Map, Target } from 'lucide-react';

export default function Admin() {
  const { 
    filters, 
    setFilters, 
    cityData, 
    addCity, 
    removeCity,
    goal,
    setGoal
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
  const [currentGoal, setCurrentGoal] = useState(goal);

  // Sincroniza o estado local quando a meta do hook mudar
  useState(() => {
    setCurrentGoal(goal);
  }, [goal]);

  const handleApplyFilters = () => {
    setFilters({
      dataEnvioStart: startOfDay(dataEnvioRange.start),
      dataEnvioEnd: endOfDay(dataEnvioRange.end),
      dataLiberacaoStart: startOfDay(dataLiberacaoRange.start),
      dataLiberacaoEnd: endOfDay(dataLiberacaoRange.end),
    });
  };

  const handleAddCity = () => {
    if (!cityName.trim() || !cityValue.trim()) return;
    addCity(cityName, cityValue);
    setCityName('');
    setCityValue('');
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite campo vazio ou números
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setCurrentGoal(Number(value));
    }
  };

  const handleSetGoal = () => {
    setGoal(currentGoal);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50/50">
      {/* Header */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-gray-800">
            <Settings2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Administração</h1>
            <p className="text-gray-600">Ajuste os filtros, gerencie custos e defina metas para o dashboard.</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Coluna da Esquerda (Filtros) */}
        <div className="lg:col-span-3">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                <Filter className="h-5 w-5 text-blue-600" />
                Configuração de Filtros
              </CardTitle>
              <p className="text-sm text-gray-500 pt-1">Defina os períodos para análise dos dados.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtro de Data de Envio */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-700">Período de Envio</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data Inicial</label>
                    <input type="date" value={format(dataEnvioRange.start, 'yyyy-MM-dd')} onChange={(e) => setDataEnvioRange(prev => ({ ...prev, start: new Date(e.target.value.replace(/-/g, '/')) }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data Final</label>
                    <input type="date" value={format(dataEnvioRange.end, 'yyyy-MM-dd')} onChange={(e) => setDataEnvioRange(prev => ({ ...prev, end: new Date(e.target.value.replace(/-/g, '/')) }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>
              </div>

              {/* Filtro de Data de Liberação */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-gray-700">Período de Liberação</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data Inicial</label>
                        <input type="date" value={format(dataLiberacaoRange.start, 'yyyy-MM-dd')} onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, start: new Date(e.target.value.replace(/-/g, '/')) }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data Final</label>
                        <input type="date" value={format(dataLiberacaoRange.end, 'yyyy-MM-dd')} onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, end: new Date(e.target.value.replace(/-/g, '/')) }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"/>
                    </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={handleApplyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={() => {
                    const today = new Date();
                    const start = startOfDay(today);
                    const end = endOfDay(today);
                    setDataEnvioRange({ start, end });
                    setDataLiberacaoRange({ start, end });
                    setFilters({ dataEnvioStart: start, dataEnvioEnd: end, dataLiberacaoStart: start, dataLiberacaoEnd: end });
                  }}>
                  <Zap className="h-4 w-4 mr-2" />
                  Filtros para Hoje
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita (Metas e Cidades) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metas de Performance */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                <Target className="h-5 w-5 text-green-600" />
                Metas de Performance
              </CardTitle>
              <p className="text-sm text-gray-500 pt-1">Defina a meta de liberados para o período.</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ex: 50"
                  value={currentGoal || ''}
                  onChange={handleGoalChange}
                  className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button onClick={handleSetGoal} className="bg-green-600 hover:bg-green-700 text-white">
                  <Target className="h-4 w-4 mr-2" />
                  Definir Meta
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Gerenciador de Custos por Cidade */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                <Map className="h-5 w-5 text-orange-600" />
                Gerenciar Custos por Cidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Nome da Cidade" value={cityName} onChange={(e) => setCityName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <input type="text" placeholder="Custo (R$)" value={cityValue} onChange={(e) => setCityValue(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <Button onClick={handleAddCity} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Custo
                </Button>
              </div>

              <div className="mt-5 space-y-2">
                {cityData.length > 0 && cityData.map(city => (
                  <div key={city.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-md border">
                    <div>
                      <span className="font-medium text-gray-800">{city.name}</span>
                      <span className="text-gray-600">: R$ {city.value}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCity(city.id)} className="text-red-500 hover:bg-red-100 h-8 w-8">
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
