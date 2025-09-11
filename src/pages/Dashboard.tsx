import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDashboard } from '../hooks/useDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, CheckCircle, Clock, TrendingUp, Award, MapPin } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header Premium para TV */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-white/30 blur-lg"></div>
                <div className="relative p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Dashboard de Performance
                </h1>
                <p className="text-purple-100 text-lg font-medium mt-1">Análise Completa dos Dados Bitrix24</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300 shadow-lg"></div>
                  <span className="text-sm font-bold text-blue-100">Período de Envio</span>
                </div>
                <p className="text-white font-black text-base">
                  {formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-300 shadow-lg"></div>
                  <span className="text-sm font-bold text-emerald-100">Período de Liberação</span>
                </div>
                <p className="text-white font-black text-base">
                  {formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Principais Premium para TV */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"></div>
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
          
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-black uppercase tracking-wide text-cyan-100">
              Total de Enviados
            </CardTitle>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-white/30 blur-lg"></div>
              <div className="relative p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
              {data.totalEnviados.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-cyan-100 font-semibold">
              Contatos enviados no período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-800 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"></div>
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
          
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-black uppercase tracking-wide text-emerald-100">
              Total de Liberados
            </CardTitle>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-white/30 blur-lg"></div>
              <div className="relative p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
              {data.totalLiberados.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-emerald-100 font-semibold">
              Contatos liberados no período selecionado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Cidades */}
      {cityData && cityData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 blur-lg opacity-50"></div>
              <div className="relative p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Valores por Cidade
            </h2>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {cityData.map((city) => (
              <Card key={city.id} className="relative overflow-hidden border-0 bg-white shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 opacity-8"></div>
                <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-white/10 blur-lg"></div>
                <CardHeader className="relative z-10 flex flex-row items-center space-x-3 pb-2">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-lg bg-amber-500 blur-md opacity-50"></div>
                    <div className="relative p-2 rounded-lg bg-amber-500 shadow-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-sm font-bold text-gray-800">{city.name}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-base font-bold text-amber-800">R$</span>
                    <span className="text-2xl font-black text-amber-800">{city.value}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cards dos Responsáveis Premium para TV */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-50"></div>
            <div className="relative p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Performance por Responsável
          </h2>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {responsaveis.map((responsavel, index) => {
            const dados = data.responsaveis[responsavel] || { enviados: 0, liberados: 0 };
            
            const gradientColors = [
              'from-rose-500 to-pink-700',
              'from-violet-500 to-purple-700', 
              'from-blue-500 to-indigo-700',
              'from-emerald-500 to-teal-700',
              'from-amber-500 to-orange-700'
            ];
            
            return (
              <Card key={responsavel} className="relative overflow-hidden border-0 bg-white shadow-xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-8`}></div>
                <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-white/10 blur-xl"></div>
                
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} blur-lg opacity-50`}></div>
                      <div className={`relative w-10 h-10 rounded-2xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center shadow-lg border-2 border-white/20`}>
                        <span className="text-white font-black text-sm">
                          {responsavel.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-sm font-bold text-gray-800 text-center leading-tight">
                      {responsavel}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-3 px-4 pb-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-blue-500 shadow-md">
                        <Clock className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs text-blue-700 font-bold">Enviados</span>
                    </div>
                    <span className="text-xl font-black text-blue-700">
                      {dados.enviados.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-emerald-500 shadow-md">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs text-emerald-700 font-bold">Liberados</span>
                    </div>
                    <span className="text-xl font-black text-emerald-700">
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
