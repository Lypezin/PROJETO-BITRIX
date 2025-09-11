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
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header com cores sutis */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600 shadow-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">Dashboard de Performance</h1>
              <p className="text-blue-700 text-sm">Análise Bitrix24</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-100 rounded-lg p-3 text-center border border-blue-300">
              <span className="text-xs font-medium text-blue-700">Envio</span>
              <p className="text-blue-900 font-semibold text-sm">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-3 text-center border border-indigo-300">
              <span className="text-xs font-medium text-indigo-700">Liberação</span>
              <p className="text-indigo-900 font-semibold text-sm">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Totais com cores sutis */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-semibold text-cyan-800">Total de Enviados</CardTitle>
            <div className="p-2 rounded-lg bg-cyan-600 shadow-lg"><Users className="h-5 w-5 text-white" /></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-4xl font-bold text-cyan-900">{data.totalEnviados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-cyan-700">Contatos no período</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-semibold text-emerald-800">Total de Liberados</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-600 shadow-lg"><CheckCircle className="h-5 w-5 text-white" /></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-4xl font-bold text-emerald-900">{data.totalLiberados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-emerald-700">Contatos no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Custo por Cidade com cores */}
      {cityData && cityData.length > 0 && (
        <div className="flex-shrink-0 space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1"></div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-lg border border-orange-200 shadow-sm">
              <div className="p-1.5 rounded-lg bg-orange-500 shadow-md">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-orange-800">
                Custo por Cidade
              </h2>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent flex-1"></div>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {cityData.map((city) => (
              <Card key={city.id} className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-col items-center space-y-1 p-3 pb-2">
                  <div className="p-1.5 rounded-lg bg-orange-500 shadow-md">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <CardTitle className="text-xs font-semibold text-orange-900 text-center leading-tight">{city.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 text-center">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-xs font-medium text-orange-700">R$</span>
                    <span className="text-lg font-bold text-orange-900">
                      {city.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance por Responsável com cores */}
      <div className="flex-shrink-0 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500 shadow-md"><Award className="h-4 w-4 text-white" /></div>
          <h2 className="text-sm font-semibold text-purple-800">Performance por Responsável</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            const cardColors = ['from-blue-50 to-blue-100 border-blue-200','from-purple-50 to-purple-100 border-purple-200','from-green-50 to-green-100 border-green-200','from-orange-50 to-orange-100 border-orange-200','from-pink-50 to-pink-100 border-pink-200'];
            const avatarColors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500'];
            const textColors = ['text-blue-800','text-purple-800','text-green-800','text-orange-800','text-pink-800'];
            return (
              <Card key={responsavel} className={`bg-gradient-to-br ${cardColors[index % cardColors.length]} shadow-md hover:shadow-lg transition-all duration-200`}>
                <CardHeader className="flex flex-col items-center space-y-1 p-3">
                  <CardTitle className={`text-base font-bold ${textColors[index % textColors.length]} text-center`}>{responsavel}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 backdrop-blur-sm">
                    <span className="text-xs text-gray-600 font-medium">Enviados</span>
                    <span className={`text-sm font-bold ${textColors[index % textColors.length]}`}>{dados.enviados.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 backdrop-blur-sm">
                    <span className="text-xs text-gray-600 font-medium">Liberados</span>
                    <span className={`text-sm font-bold ${textColors[index % textColors.length]}`}>{dados.liberados.toLocaleString('pt-BR')}</span>
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
