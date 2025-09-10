import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboard } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard de Performance</h2>
          <p className="text-gray-600 mt-1">
            📤 Envio: {formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)} | 
            ✅ Liberação: {formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Enviados
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalEnviados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-blue-100">
              Contatos enviados no período
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Liberados
            </CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalLiberados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-green-100">
              Contatos liberados no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Responsáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {responsaveis.map((responsavel) => {
          const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
          const taxaLiberacao = dados.enviados > 0 
            ? ((dados.liberados / dados.enviados) * 100).toFixed(1)
            : '0.0';

          return (
            <Card key={responsavel} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {responsavel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Enviados</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {dados.enviados.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Liberados</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {dados.liberados.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Taxa</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">
                      {taxaLiberacao}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.totalEnviados.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-600">Total Enviados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.totalLiberados.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-600">Total Liberados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.totalEnviados > 0 
                  ? ((data.totalLiberados / data.totalEnviados) * 100).toFixed(1)
                  : '0.0'
                }%
              </div>
              <div className="text-sm text-gray-600">Taxa de Liberação</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
