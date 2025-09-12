import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboard } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle, TrendingUp, Award, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { data, filters, isLoading, cityData } = useDashboard();

  const responsaveis = [
    'Carolini Braguini',
    'Melissa', 
    'Beatriz Angelo',
    'Fernanda Raphaelly',
    'Kerolay Oliveira'
  ];

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  if (isLoading && !data.totalEnviados && !data.totalLiberados) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-3 gap-3">
      {/* Header com gradientes vibrantes */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 shadow-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">Dashboard de Performance</h1>
              <p className="text-blue-700 text-sm">Análise Bitrix24</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-3 py-2 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-xs text-blue-700 font-medium">Envio</p>
              <p className="text-blue-900 font-semibold text-sm">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
            </div>
            <div className="text-center px-3 py-2 bg-indigo-100 rounded-lg border border-indigo-300">
              <p className="text-xs text-indigo-700 font-medium">Liberação</p>
              <p className="text-indigo-900 font-semibold text-sm">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais com gradientes */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-cyan-800">Total de Enviados</CardTitle>
            <div className="p-2 rounded-lg bg-cyan-600 shadow-lg"><Users className="h-5 w-5 text-white" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900">{data.totalEnviados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-cyan-700">Contatos no período</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800">Total de Liberados</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-600 shadow-lg"><CheckCircle className="h-5 w-5 text-white" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{data.totalLiberados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-emerald-700">Contatos no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Custo por Cidade com cores vibrantes */}
      {cityData && cityData.length > 0 && (
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-orange-500 shadow-md"><MapPin className="h-4 w-4 text-white" /></div>
            <h2 className="text-sm font-semibold text-orange-800">Custo por Cidade</h2>
          </div>
          <div className="grid grid-cols-6 gap-2 justify-center">
            {cityData.map((city) => {
              // Garante que o valor seja tratado como número, substituindo vírgula por ponto
              const value = parseFloat(city.value.replace(',', '.'));
              const valueColor = value >= 50 ? 'text-red-600' : 'text-green-600';

              return (
                <Card key={city.id} className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 shadow-sm">
                  <CardContent className="p-2 text-center">
                    <p className="text-xs font-bold text-orange-900 mb-1 truncate">{city.name}</p>
                    <p className={`text-base font-bold ${valueColor}`}>R$ {city.value}</p>
                    {city.remaining !== undefined && city.remaining > 0 && (
                      <p className="text-xs font-semibold text-blue-600 mt-1">
                        Faltam: {city.remaining}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance por Responsável com gradientes coloridos */}
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-purple-500 shadow-md"><Award className="h-4 w-4 text-white" /></div>
          <h2 className="text-sm font-semibold text-purple-800">Performance por Responsável</h2>
        </div>
        <div className="flex-grow grid grid-cols-5 gap-2 min-h-0">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { totalEnviados: 0, totalLiberados: 0, enviadosPorCidade: {}, liberadosPorCidade: {} };
            const cardColors = ['from-blue-50 to-blue-100 border-blue-200','from-purple-50 to-purple-100 border-purple-200','from-green-50 to-green-100 border-green-200','from-orange-50 to-orange-100 border-orange-200','from-pink-50 to-pink-100 border-pink-200'];
            const textColors = ['text-blue-800','text-purple-800','text-green-800','text-orange-800','text-pink-800'];
            
            return (
              <Card key={responsavel} className={`flex flex-col bg-gradient-to-br ${cardColors[index % cardColors.length]} shadow-md`}>
                <CardHeader className="pb-1">
                  <CardTitle className={`text-sm font-bold ${textColors[index % textColors.length]} text-center`}>{responsavel}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-1 min-h-0">
                  {/* Enviados */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-1.5 flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600">Enviados</span>
                      <span className={`text-lg font-extrabold ${textColors[index % textColors.length]}`}>{dados.totalEnviados}</span>
                    </div>
                    <div className="border-t border-gray-200/75 my-1"></div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-0.5">
                        {Object.entries(dados.enviadosPorCidade).map(([cidade, count]: [string, any]) => (
                          <div key={cidade} className="flex justify-between items-center text-xs">
                            <span className="truncate text-gray-700 pr-1">{cidade}</span>
                            <span className={`font-semibold ${textColors[index % textColors.length]}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Liberados */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-1.5 flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-600">Liberados</span>
                      <span className={`text-lg font-extrabold ${textColors[index % textColors.length]}`}>{dados.totalLiberados}</span>
                    </div>
                    <div className="border-t border-gray-200/75 my-1"></div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-0.5">
                        {Object.entries(dados.liberadosPorCidade).map(([cidade, count]: [string, any]) => (
                          <div key={cidade} className="flex justify-between items-center text-xs">
                            <span className="truncate text-gray-700 pr-1">{cidade}</span>
                            <span className={`font-semibold ${textColors[index % textColors.length]}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
