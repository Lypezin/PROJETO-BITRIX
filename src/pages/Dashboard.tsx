import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboard } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle, Clock, TrendingUp, Award, Star } from 'lucide-react';

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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-20"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-border">
            <div className="absolute inset-2 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dashboard de Performance
              </h1>
              <p className="text-blue-100 text-lg">Análise completa dos dados Bitrix24</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-100">Período de Envio</span>
              </div>
              <p className="text-white font-semibold">
                {formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                <span className="text-sm font-medium text-green-100">Período de Liberação</span>
              </div>
              <p className="text-white font-semibold">
                {formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais com gradientes lindos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-[1.02] animate-in slide-in-from-left duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
          
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-100">
              Total de Enviados
            </CardTitle>
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {data.totalEnviados.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-blue-100 font-medium">
              Contatos enviados no período selecionado
            </p>
            <div className="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-white/40 to-white/60 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:scale-[1.02] animate-in slide-in-from-right duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
          
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-100">
              Total de Liberados
            </CardTitle>
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              {data.totalLiberados.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-emerald-100 font-medium">
              Contatos liberados no período selecionado
            </p>
            <div className="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-white/40 to-white/60 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Responsáveis - Design Premium */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Performance por Responsável
            </h2>
            <p className="text-gray-500 text-sm">Análise individual de produtividade</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            const total = dados.enviados + dados.liberados;
            const isTopPerformer = total > 0 && index === 0; // Você pode ajustar esta lógica
            
            const gradientColors = [
              'from-rose-400 to-pink-600',
              'from-violet-400 to-purple-600', 
              'from-blue-400 to-indigo-600',
              'from-emerald-400 to-teal-600',
              'from-amber-400 to-orange-600'
            ];
            
            return (
              <Card key={responsavel} className={`group relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom duration-${700 + index * 100}`}>
                {/* Gradiente de fundo sutil */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Badge para top performer */}
                {isTopPerformer && (
                  <div className="absolute -top-2 -right-2 z-20">
                    <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-bold text-lg">
                        {responsavel.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-bold text-gray-800 leading-tight">
                        {responsavel}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        Total: {total.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-lg bg-blue-500">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-blue-700 font-semibold">Enviados</span>
                      </div>
                      <span className="text-xl font-black text-blue-600">
                        {dados.enviados.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-300">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-lg bg-emerald-500">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold">Liberados</span>
                      </div>
                      <span className="text-xl font-black text-emerald-600">
                        {dados.liberados.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Taxa de Liberação</span>
                      <span>{dados.enviados > 0 ? Math.round((dados.liberados / dados.enviados) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${gradientColors[index % gradientColors.length]} transition-all duration-1000 ease-out`}
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
