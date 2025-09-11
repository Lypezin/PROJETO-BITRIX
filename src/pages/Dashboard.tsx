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
    <div className="h-full flex flex-col p-3 gap-4 bg-gray-50">
      {/* Header Clean */}
      <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600"><TrendingUp className="h-5 w-5 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard de Performance</h1>
              <p className="text-gray-600 text-sm">Análise Bitrix24</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border">
              <p className="text-xs text-blue-600 font-medium">Envio</p>
              <p className="text-blue-800 font-semibold text-sm">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
            </div>
            <div className="text-center px-3 py-2 bg-green-50 rounded-lg border">
              <p className="text-xs text-green-600 font-medium">Liberação</p>
              <p className="text-green-800 font-semibold text-sm">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Total de Enviados</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data.totalEnviados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-gray-500 mt-1">Contatos no período</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Total de Liberados</CardTitle>
            <div className="p-2 rounded-lg bg-green-100"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{data.totalLiberados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-gray-500 mt-1">Contatos no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Custo por Cidade */}
      {cityData && cityData.length > 0 && (
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-100"><MapPin className="h-4 w-4 text-orange-600" /></div>
            <h2 className="text-base font-semibold text-gray-800">Custo por Cidade</h2>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {cityData.map((city) => (
              <Card key={city.id} className="bg-white shadow-sm border hover:shadow-md transition-shadow">
                <CardContent className="p-3 text-center">
                  <p className="text-sm font-semibold text-gray-800 mb-1 truncate">{city.name}</p>
                  <p className="text-lg font-bold text-orange-600">R$ {city.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance por Responsável */}
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-purple-100"><Award className="h-4 w-4 text-purple-600" /></div>
          <h2 className="text-base font-semibold text-gray-800">Performance por Responsável</h2>
        </div>
        <div className="flex-grow grid grid-cols-5 gap-3 min-h-0">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { totalEnviados: 0, totalLiberados: 0, enviadosPorCidade: {}, liberadosPorCidade: {} };
            const colors = [
              { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'text-blue-600' },
              { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'text-purple-600' },
              { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', accent: 'text-green-600' },
              { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'text-orange-600' },
              { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', accent: 'text-pink-600' }
            ];
            const color = colors[index % colors.length];
            
            return (
              <Card key={responsavel} className={`${color.bg} ${color.border} border shadow-sm flex flex-col`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-bold ${color.text} text-center`}>{responsavel}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-2 min-h-0">
                  {/* Enviados */}
                  <div className="bg-white/80 rounded-md p-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Enviados</span>
                      <span className={`text-sm font-bold ${color.accent}`}>{dados.totalEnviados}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-1">
                        {Object.entries(dados.enviadosPorCidade).map(([cidade, count]: [string, any]) => (
                          <div key={cidade} className="flex justify-between items-center text-xs">
                            <span className="truncate text-gray-700">{cidade}</span>
                            <span className={`font-semibold ${color.accent}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Liberados */}
                  <div className="bg-white/80 rounded-md p-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Liberados</span>
                      <span className={`text-sm font-bold ${color.accent}`}>{dados.totalLiberados}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-1">
                        {Object.entries(dados.liberadosPorCidade).map(([cidade, count]: [string, any]) => (
                          <div key={cidade} className="flex justify-between items-center text-xs">
                            <span className="truncate text-gray-700">{cidade}</span>
                            <span className={`font-semibold ${color.accent}`}>{count}</span>
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
