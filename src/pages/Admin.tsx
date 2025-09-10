import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboard } from '../hooks/useDashboard';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Download, Filter, RefreshCw } from 'lucide-react';

const formatDate = (date: Date) => format(date, "dd/MM/yyyy");

export default function Admin() {
  const { filters, setFilters, exportData, isLoading } = useDashboard();
  const [dataEnvioRange, setDataEnvioRange] = useState({
    start: filters.dataEnvioStart,
    end: filters.dataEnvioEnd,
  });
  const [dataLiberacaoRange, setDataLiberacaoRange] = useState({
    start: filters.dataLiberacaoStart,
    end: filters.dataLiberacaoEnd,
  });

  const handleApplyFilters = () => {
    setFilters({
      dataEnvioStart: startOfDay(dataEnvioRange.start),
      dataEnvioEnd: endOfDay(dataEnvioRange.end),
      dataLiberacaoStart: startOfDay(dataLiberacaoRange.start),
      dataLiberacaoEnd: endOfDay(dataLiberacaoRange.end),
    });
  };

  const handleExport = () => {
    exportData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Administração</h2>
      <p className="text-gray-600">Configure filtros e exporte dados do sistema</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros de Data de Envio e Liberação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtro de Data de Envio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📤 Período de Data de Envio
                </label>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={format(dataEnvioRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDataEnvioRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={format(dataEnvioRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDataEnvioRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filtro de Data de Liberação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ✅ Período de Data de Liberação
                </label>
                <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={format(dataLiberacaoRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={format(dataLiberacaoRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDataLiberacaoRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
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
                    const start = startOfDay(today);
                    const end = endOfDay(today);
                    setDataEnvioRange({ start, end });
                    setDataLiberacaoRange({ start, end });
                    setFilters({
                      dataEnvioStart: start,
                      dataEnvioEnd: end,
                      dataLiberacaoStart: start,
                      dataLiberacaoEnd: end,
                    });
                  }}
                >
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status e Exportação */}
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
                <p><strong>📤 Data de Envio:</strong> {formatDate(filters.dataEnvioStart)} - {formatDate(filters.dataEnvioEnd)}</p>
                <p><strong>✅ Data de Liberação:</strong> {formatDate(filters.dataLiberacaoStart)} - {formatDate(filters.dataLiberacaoEnd)}</p>
              </div>

              <Button
                onClick={handleExport}
                disabled={isLoading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? 'Exportando...' : 'Exportar para Excel'}
              </Button>

              <div className="text-xs text-gray-500">
                <p>O arquivo será baixado com base no filtro de <strong>Data de Envio</strong>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
