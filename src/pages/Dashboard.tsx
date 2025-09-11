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
        <div className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3 p-2">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-3 text-white shadow-lg flex-shrink-0">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/20"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard de Performance</h1>
                <p className="text-purple-100 text-xs">Análise Bitrix24</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <span className="text-xs font-semibold text-blue-100">Envio</span>
                <p className="text-white font-bold text-sm">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center">
                <span className="text-xs font-semibold text-emerald-100">Liberação</span>
                <p className="text-white font-bold text-sm">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          <Card className="flex-1 flex flex-col justify-center relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800 text-white shadow-xl">
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-3">
              <CardTitle className="text-sm font-bold uppercase">Total de Enviados</CardTitle>
              <div className="p-2 rounded-lg bg-white/20"><Users className="h-5 w-5 text-white" /></div>
            </CardHeader>
            <CardContent className="relative z-10 p-3 pt-0">
              <div className="text-5xl font-black">{data.totalEnviados.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-cyan-100">Contatos no período</p>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col justify-center relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-800 text-white shadow-xl">
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 p-3">
              <CardTitle className="text-sm font-bold uppercase">Total de Liberados</CardTitle>
              <div className="p-2 rounded-lg bg-white/20"><CheckCircle className="h-5 w-5 text-white" /></div>
            </CardHeader>
            <CardContent className="relative z-10 p-3 pt-0">
              <div className="text-5xl font-black">{data.totalLiberados.toLocaleString('pt-BR')}</div>
              <p className="text-xs text-emerald-100">Contatos no período</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3">
            <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500"><MapPin className="h-4 w-4 text-white" /></div>
                    <h2 className="text-base font-bold text-gray-700">Valores por Cidade</h2>
                </div>
            </div>
            {cityData && cityData.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {cityData.map((city) => (
                    <Card key={city.id} className="bg-white shadow-lg">
                        <CardHeader className="flex flex-row items-center space-x-2 p-2 pb-0">
                            <MapPin className="h-3 w-3 text-amber-600" />
                            <CardTitle className="text-xs font-bold text-gray-800 truncate">{city.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <div className="flex items-baseline space-x-1">
                                <span className="text-xs font-bold text-gray-600">R$</span>
                                <span className="text-lg font-black text-gray-800">{city.value}</span>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Responsibles Row */}
      <div className="flex-shrink-0 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500"><Award className="h-4 w-4 text-white" /></div>
          <h2 className="text-base font-bold text-gray-700">Performance por Responsável</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            const gradientColors = ['from-rose-500 to-pink-700','from-violet-500 to-purple-700','from-blue-500 to-indigo-700','from-emerald-500 to-teal-700','from-amber-500 to-orange-700'];
            return (
              <Card key={responsavel} className="bg-white shadow-lg">
                <CardHeader className="flex flex-col items-center space-y-1 p-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{responsavel.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                  </div>
                  <CardTitle className="text-xs font-bold text-gray-800 text-center">{responsavel}</CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2 space-y-1">
                  <div className="flex items-center justify-between p-1.5 rounded-md bg-blue-50">
                    <span className="text-xs text-blue-700 font-bold">Env</span>
                    <span className="text-base font-black text-blue-700">{dados.enviados.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-md bg-emerald-50">
                    <span className="text-xs text-emerald-700 font-bold">Lib</span>
                    <span className="text-base font-black text-emerald-700">{dados.liberados.toLocaleString('pt-BR')}</span>
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
