import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboard } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';

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
        <div className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header compacto para TV */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Dashboard de Performance
                </h1>
                <p className="text-blue-100 text-sm">Análise dos dados Bitrix24</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                  <span className="text-xs font-medium text-blue-100">Envio</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  {formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-300"></div>
                  <span className="text-xs font-medium text-green-100">Liberação</span>
                </div>
                <p className="text-white font-semibold text-sm">
                  {formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais - Otimizado para TV */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-100">
              Total de Enviados
            </CardTitle>
            <div className="p-2 rounded-xl bg-white/20">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black mb-1 text-white">
              {data.totalEnviados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-blue-100 font-medium">
              Contatos enviados no período
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-100">
              Total de Liberados
            </CardTitle>
            <div className="p-2 rounded-xl bg-white/20">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black mb-1 text-white">
              {data.totalLiberados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              Contatos liberados no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Responsáveis - Otimizado para TV */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Award className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Performance por Responsável</h2>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            
            const gradientColors = [
              'from-rose-400 to-pink-600',
              'from-violet-400 to-purple-600', 
              'from-blue-400 to-indigo-600',
              'from-emerald-400 to-teal-600',
              'from-amber-400 to-orange-600'
            ];
            
            return (
              <Card key={responsavel} className="relative overflow-hidden border-0 bg-white shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-5`}></div>
                
                <CardHeader className="relative z-10 pb-2">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center shadow-md`}>
                      <span className="text-white font-bold text-sm">
                        {responsavel.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <CardTitle className="text-xs font-bold text-gray-800 text-center leading-tight">
                      {responsavel}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-2 px-3 pb-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-blue-700 font-semibold">Env</span>
                    </div>
                    <span className="text-lg font-black text-blue-600">
                      {dados.enviados.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-700 font-semibold">Lib</span>
                    </div>
                    <span className="text-lg font-black text-emerald-600">
                      {dados.liberados.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="pt-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Taxa</span>
                      <span>{dados.enviados > 0 ? Math.round((dados.liberados / dados.enviados) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${gradientColors[index % gradientColors.length]}`}
                        style={{ width: dados.enviados > 0 ? `${Math.min((dados.liberados / dados.enviados) * 100, 100)}%` : '0%' }}
                      ></div>
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
