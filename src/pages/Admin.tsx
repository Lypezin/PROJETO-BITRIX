import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useDashboard } from '../hooks/useDashboard';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';

export default function Admin() {
  const { filters, setFilters, exportData, isLoading, fetchData } = useDashboard();
  const [dateRange, setDateRange] = useState({
    start: filters.startDate,
    end: filters.endDate,
  });

  const responsaveis = [
    { value: '', label: 'Todos os responsáveis' },
    { value: 'Carolini Braguini', label: 'Carolini Braguini' },
    { value: 'Melissa', label: 'Melissa' },
    { value: 'Beatriz Angelo', label: 'Beatriz Angelo' },
    { value: 'Fernanda Raphaelly', label: 'Fernanda Raphaelly' },
    { value: 'Kerolay Oliveira', label: 'Kerolay Oliveira' },
  ];

  const presets = [
    { label: 'Hoje', value: 'today' },
    { label: 'Ontem', value: 'yesterday' },
    { label: 'Últimos 7 dias', value: 'last7days' },
    { label: 'Últimos 30 dias', value: 'last30days' },
    { label: 'Este mês', value: 'thismonth' },
  ];

  const handlePresetChange = (preset: string) => {
    const today = new Date();
    let start: Date, end: Date;

    switch (preset) {
      case 'today':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        start = startOfDay(yesterday);
        end = endOfDay(yesterday);
        break;
      case 'last7days':
        start = startOfDay(subDays(today, 6));
        end = endOfDay(today);
        break;
      case 'last30days':
        start = startOfDay(subDays(today, 29));
        end = endOfDay(today);
        break;
      case 'thismonth':
        start = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
        end = endOfDay(today);
        break;
      default:
        return;
    }

    setDateRange({ start, end });
  };

  const handleApplyFilters = () => {
    setFilters({
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
  };

  const handleExport = () => {
    exportData();
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Administração</h2>
          <p className="text-gray-600 mt-1">
            Configure filtros e exporte dados do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros de Data e Responsável</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets de Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período Rápido
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetChange(preset.value)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Seleção de Data Manual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={format(dateRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange(prev => ({
                      ...prev,
                      start: startOfDay(new Date(e.target.value))
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={format(dateRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange(prev => ({
                      ...prev,
                      end: endOfDay(new Date(e.target.value))
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Seleção de Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável
                </label>
                <Select
                  value={filters.responsavel || ''}
                  onValueChange={(value) => setFilters({ responsavel: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsaveis.map((responsavel) => (
                      <SelectItem key={responsavel.value} value={responsavel.value}>
                        {responsavel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de Ação */}
              <div className="flex space-x-4">
                <Button onClick={handleApplyFilters} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    setDateRange({
                      start: startOfDay(today),
                      end: endOfDay(today),
                    });
                    setFilters({
                      startDate: startOfDay(today),
                      endDate: endOfDay(today),
                      responsavel: null,
                    });
                  }}
                >
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exportação */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Exportação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Período:</strong> {formatDate(filters.startDate)} - {formatDate(filters.endDate)}</p>
                <p><strong>Responsável:</strong> {filters.responsavel || 'Todos'}</p>
              </div>

              <Button
                onClick={handleExport}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? 'Exportando...' : 'Exportar para Excel'}
              </Button>

              <div className="text-xs text-gray-500">
                <p>O arquivo será baixado automaticamente com todos os contatos do período selecionado.</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Os dados são atualizados automaticamente a cada 30 segundos</p>
              <p>• A contagem é baseada nas datas de envio e liberação</p>
              <p>• Use os filtros para analisar períodos específicos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
