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
      {/* Header Clean */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-100"><TrendingUp className="h-5 w-5 text-slate-700" /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard de Performance</h1>
              <p className="text-gray-500 text-sm">Análise Bitrix24</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <span className="text-xs font-medium text-gray-600">Envio</span>
              <p className="text-gray-900 font-semibold text-sm">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <span className="text-xs font-medium text-gray-600">Liberação</span>
              <p className="text-gray-900 font-semibold text-sm">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Totais Clean */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Total de Enviados</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50"><Users className="h-5 w-5 text-blue-600" /></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-4xl font-bold text-gray-900">{data.totalEnviados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-gray-600">Contatos no período</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Total de Liberados</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-4xl font-bold text-gray-900">{data.totalLiberados.toLocaleString('pt-BR')}</div>
            <p className="text-sm text-gray-600">Contatos no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Valores por Cidade Clean */}
      {cityData && cityData.length > 0 && (
        <div className="flex-shrink-0 space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-px bg-gray-200 flex-1"></div>
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="p-1.5 rounded-lg bg-orange-100">
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700">
                Valores por Cidade
              </h2>
            </div>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {cityData.map((city) => (
              <Card key={city.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-col items-center space-y-1 p-3 pb-2">
                  <div className="p-1.5 rounded-lg bg-orange-100">
                    <MapPin className="h-3 w-3 text-orange-600" />
                  </div>
                  <CardTitle className="text-xs font-semibold text-gray-800 text-center leading-tight">{city.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 text-center">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-xs font-medium text-gray-600">R$</span>
                    <span className="text-lg font-bold text-gray-900">
                      {city.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance por Responsável Clean */}
      <div className="flex-shrink-0 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-slate-100"><Award className="h-4 w-4 text-slate-700" /></div>
          <h2 className="text-sm font-semibold text-gray-700">Performance por Responsável</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            const colors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-green-100 text-green-700','bg-orange-100 text-orange-700','bg-pink-100 text-pink-700'];
            return (
              <Card key={responsavel} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-col items-center space-y-1 p-3">
                  <div className={`w-8 h-8 rounded-lg ${colors[index % colors.length]} flex items-center justify-center`}>
                    <span className="font-bold text-xs">{responsavel.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                  </div>
                  <CardTitle className="text-xs font-semibold text-gray-800 text-center">{responsavel}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-600 font-medium">Enviados</span>
                    <span className="text-sm font-bold text-gray-900">{dados.enviados.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <span className="text-xs text-gray-600 font-medium">Liberados</span>
                    <span className="text-sm font-bold text-gray-900">{dados.liberados.toLocaleString('pt-BR')}</span>
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
