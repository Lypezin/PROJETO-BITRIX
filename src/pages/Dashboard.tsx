import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboard } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { data, filters, isLoading } = useDashboard();

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard de Performance</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-semibold">Períodos de Análise:</span>
          </p>
          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1">
            <span>📤 Envio: <span className="font-medium">{formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</span></span>
            <span>✅ Liberação: <span className="font-medium">{formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</span></span>
          </div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              Total de Enviados
            </CardTitle>
            <Users className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">
              {data.totalEnviados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-blue-200 pt-1">
              Contatos enviados no período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider">
              Total de Liberados
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">
              {data.totalLiberados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-green-200 pt-1">
              Contatos liberados no período selecionado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Responsáveis */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Performance por Responsável</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {responsaveis.map((responsavel) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            
            return (
              <Card key={responsavel} className="bg-white hover:shadow-xl transition-shadow duration-300 border-t-4 border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-gray-800 truncate">
                    {responsavel}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600 font-medium">Enviados</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {dados.enviados.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600 font-medium">Liberados</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {dados.liberados.toLocaleString('pt-BR')}
                    </span>
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
