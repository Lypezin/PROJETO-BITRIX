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
    <div className="flex flex-col h-full gap-3 p-2">
      {/* Header com cores sutis */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600 shadow-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">Dashboard de Performance</h1>
              <p className="text-blue-700 text-sm">Análise Bitrix24</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-100 rounded-lg p-2 text-center border border-blue-300">
              <span className="text-xs font-medium text-blue-700">Envio</span>
              <p className="text-blue-900 font-semibold text-sm">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-2 text-center border border-indigo-300">
              <span className="text-xs font-medium text-indigo-700">Liberação</span>
              <p className="text-indigo-900 font-semibold text-sm">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Totais com cores sutis */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
            <CardTitle className="text-sm font-semibold text-cyan-800">Total de Enviados</CardTitle>
            <div className="p-2 rounded-lg bg-cyan-600 shadow-lg"><Users className="h-5 w-5 text-white" /></div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-4xl font-bold text-cyan-900">{data.totalEnviados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-cyan-700">Contatos no período</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Total de Liberados</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-600 shadow-lg"><CheckCircle className="h-5 w-5 text-white" /></div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-4xl font-bold text-emerald-900">{data.totalLiberados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-emerald-700">Contatos no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Custo por Cidade com cores */}
      {cityData && cityData.length > 0 && (
        <div className="flex-shrink-0 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-orange-500 shadow-md"><MapPin className="h-4 w-4 text-white" /></div>
            <h2 className="text-sm font-semibold text-orange-800">Custo por Cidade</h2>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {cityData.map((city) => (
              <Card key={city.id} className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 shadow-sm">
                 <CardContent className="p-2 text-center">
                    <p className="text-xs font-bold text-orange-900 truncate">{city.name}</p>
                    <p className="text-base font-bold text-orange-800">R$ {city.value}</p>
                  </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance por Responsável com cores */}
      <div className="flex-grow flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500 shadow-md"><Award className="h-4 w-4 text-white" /></div>
          <h2 className="text-sm font-semibold text-purple-800">Performance por Responsável</h2>
        </div>
        <div className="flex-grow grid grid-cols-5 gap-3">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { totalEnviados: 0, totalLiberados: 0, enviadosPorCidade: {}, liberadosPorCidade: {} };
            const cardColors = ['from-blue-50 to-blue-100 border-blue-200','from-purple-50 to-purple-100 border-purple-200','from-green-50 to-green-100 border-green-200','from-orange-50 to-orange-100 border-orange-200','from-pink-50 to-pink-100 border-pink-200'];
            const textColors = ['text-blue-800','text-purple-800','text-green-800','text-orange-800','text-pink-800'];
            return (
              <Card key={responsavel} className={`flex flex-col bg-gradient-to-br ${cardColors[index % cardColors.length]} shadow-md`}>
                <CardHeader className="flex flex-col items-center p-2">
                  <CardTitle className={`text-sm font-bold ${textColors[index % textColors.length]} text-center`}>{responsavel}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow px-2 pb-2 space-y-1">
                  {/* Enviados */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-1.5 flex-grow flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-semibold">Enviados</span>
                      <span className={`text-sm font-bold ${textColors[index % textColors.length]}`}>{dados.totalEnviados}</span>
                    </div>
                    <div className="border-t border-gray-200/50 my-1"></div>
                    <div className="flex-grow text-[10px] font-medium text-gray-700 overflow-y-auto">
                      {Object.entries(dados.enviadosPorCidade).map(([cidade, count]: [string, any]) => (
                        <div key={cidade} className="flex justify-between items-center">
                          <span className="truncate pr-1">{cidade}</span>
                          <span className={`font-semibold ${textColors[index % textColors.length]}`}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Liberados */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-md p-1.5 flex-grow flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-semibold">Liberados</span>
                      <span className={`text-sm font-bold ${textColors[index % textColors.length]}`}>{dados.totalLiberados}</span>
                    </div>
                    <div className="border-t border-gray-200/50 my-1"></div>
                    <div className="flex-grow text-[10px] font-medium text-gray-700 overflow-y-auto">
                      {Object.entries(dados.liberadosPorCidade).map(([cidade, count]: [string, any]) => (
                        <div key={cidade} className="flex justify-between items-center">
                          <span className="truncate pr-1">{cidade}</span>
                          <span className={`font-semibold ${textColors[index % textColors.length]}`}>{count}</span>
                        </div>
                      ))}
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
