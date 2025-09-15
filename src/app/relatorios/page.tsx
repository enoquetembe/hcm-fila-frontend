// src/app/relatorios/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Loader2,
  Eye,
  Printer
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useQuery, useMutation } from '@tanstack/react-query'
import { relatorioAPI } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'

interface FiltrosRelatorio {
  tipo: 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'ANUAL' | 'PERSONALIZADO'
  dataInicio?: string
  dataFim?: string
  prioridades?: string[]
  turnos?: string[]
  faixasEtarias?: string[]
}

interface Relatorio {
  id: string
  tipo: string
  titulo: string
  periodo: string
  dadosJson: string
  geradoEm: string
  usuario: {
    nome: string
    email: string
  }
}

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('Hoje')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [prioridade, setPrioridade] = useState('Todas as Prioridades')
  const [turno, setTurno] = useState('Todos os Turnos')
  const [faixaEtaria, setFaixaEtaria] = useState('Todas as Idades')
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null)
  
  const { usuario } = useAuthStore()

  // Query para listar relatórios
  const { data: relatorios, isLoading: loadingRelatorios, refetch: refetchRelatorios } = useQuery({
    queryKey: ['relatorios'],
    queryFn: () => relatorioAPI.listar(),
    enabled: !!usuario
  })

  // Preparar filtros para a API
  const prepararFiltros = (): FiltrosRelatorio => {
    const hoje = new Date().toISOString().split('T')[0]
    
    let tipo: FiltrosRelatorio['tipo'] = 'DIARIO'
    let dataInicio = hoje
    let dataFim = hoje

    switch (periodo) {
      case 'Esta Semana':
        tipo = 'SEMANAL'
        break
      case 'Este Mês':
        tipo = 'MENSAL'
        break
      case 'Personalizado':
        tipo = 'PERSONALIZADO'
        if (dataInicial) dataInicio = dataInicial
        if (dataFinal) dataFim = dataFinal
        break
      default:
        tipo = 'DIARIO'
    }

    const filtros: FiltrosRelatorio = {
      tipo,
      dataInicio,
      dataFim
    }

    if (prioridade !== 'Todas as Prioridades') {
      filtros.prioridades = [prioridade.toUpperCase().replace(' ', '_')]
    }

    return filtros
  }

  // Mutation para gerar relatório
  const gerarRelatorioMutation = useMutation({
    mutationFn: (filtros: FiltrosRelatorio) => relatorioAPI.gerar(filtros),
    onSuccess: () => {
      refetchRelatorios()
      alert('Relatório gerado com sucesso!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Erro ao gerar relatório')
    }
  })

 // Adicione estas funções auxiliares no seu arquivo
const handleDownload = async (relatorioId: string, formato: string) => {
  try {
    if (formato === 'pdf') {
      // Para PDF, vamos criar no frontend já que o backend retorna JSON
      await downloadPDF(relatorioId);
    } else if (formato === 'csv') {
      // Para CSV, criar a partir dos dados
      await downloadCSV(relatorioId);
    } else {
      // Para JSON, usar o download normal da API
      const blob = await relatorioAPI.download(relatorioId, formato);
      downloadBlob(blob, relatorioId, formato);
    }
  } catch (error: any) {
    alert(error.response?.data?.error || 'Erro ao baixar relatório');
  }
};

const downloadBlob = (blob: Blob, relatorioId: string, formato: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const relatorio = relatorios?.relatorios.find((r: Relatorio) => r.id === relatorioId);
  const extensao = formato.toLowerCase();
  link.download = `${relatorio?.titulo || 'relatorio'}.${extensao}`;
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const downloadPDF = async (relatorioId: string) => {
  try {
    const relatorio = relatorios?.relatorios.find((r: Relatorio) => r.id === relatorioId);
    if (!relatorio) return;

    // Usar uma biblioteca para gerar PDF - você precisa instalar jspdf
    // npm install jspdf
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const dados = JSON.parse(relatorio.dadosJson);

    // Adicionar título
    doc.setFontSize(18);
    doc.text(relatorio.titulo, 14, 15);
    
    // Informações do relatório
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date(relatorio.geradoEm).toLocaleDateString('pt-BR')}`, 14, 25);
    doc.text(`Por: ${relatorio.usuario.nome}`, 14, 30);

    // Estatísticas
    doc.setFontSize(12);
    doc.text('Estatísticas:', 14, 40);
    
    doc.setFontSize(10);
    let yPos = 45;
    doc.text(`Total de Senhas: ${dados.estatisticas.totalSenhas || 0}`, 20, yPos);
    yPos += 5;
    doc.text(`Atendimentos Concluídos: ${dados.estatisticas.atendimentosConcluidos || 0}`, 20, yPos);
    yPos += 5;
    doc.text(`Tempo Médio de Espera: ${dados.estatisticas.tempoMedioEspera || 0} minutos`, 20, yPos);
    yPos += 10;

    // Tabela de detalhes
    if (dados.detalhes && dados.detalhes.length > 0) {
      doc.setFontSize(12);
      doc.text('Detalhes das Senhas:', 14, yPos);
      yPos += 10;

      // Cabeçalhos da tabela
      doc.setFontSize(10);
      doc.text('Código', 14, yPos);
      doc.text('Paciente', 40, yPos);
      doc.text('Prioridade', 80, yPos);
      doc.text('Status', 110, yPos);
      doc.text('Tempo', 140, yPos);
      yPos += 5;

      // Linhas da tabela
      dados.detalhes.slice(0, 20).forEach((item: any) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(item.codigo || '', 14, yPos);
        doc.text(item.paciente?.nome?.substring(0, 15) || '', 40, yPos);
        doc.text(item.prioridade || '', 80, yPos);
        doc.text(item.status || '', 110, yPos);
        doc.text(`${item.tempoEspera || 0} min`, 140, yPos);
        yPos += 5;
      });

      if (dados.detalhes.length > 20) {
        doc.text(`... e mais ${dados.detalhes.length - 20} registros`, 14, yPos);
      }
    }

    // Salvar PDF
    doc.save(`${relatorio.titulo}.pdf`);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    // Fallback: baixar como JSON
    const relatorio = relatorios?.relatorios.find((r: Relatorio) => r.id === relatorioId);
    if (relatorio) {
      const blob = new Blob([relatorio.dadosJson], { type: 'application/json' });
      downloadBlob(blob, relatorioId, 'json');
    }
  }
};

const downloadCSV = async (relatorioId: string) => {
  try {
    const relatorio = relatorios?.relatorios.find((r: Relatorio) => r.id === relatorioId);
    if (!relatorio) return;

    const dados = JSON.parse(relatorio.dadosJson);
    
    // Criar cabeçalhos CSV
    let csvContent = 'Código,Paciente,Idade,Prioridade,Status,Tempo Espera (min),Sintomas\n';
    
    // Adicionar dados
    dados.detalhes.forEach((item: any) => {
      const linha = [
        `"${item.codigo || ''}"`,
        `"${item.paciente?.nome || ''}"`,
        item.paciente?.idade || '',
        `"${item.prioridade || ''}"`,
        `"${item.status || ''}"`,
        item.tempoEspera || 0,
        `"${(item.sintomas || '').replace(/"/g, '""')}"`
      ].join(',');
      
      csvContent += linha + '\n';
    });

    // Criar blob e baixar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, relatorioId, 'csv');

  } catch (error) {
    console.error('Erro ao gerar CSV:', error);
    alert('Erro ao gerar arquivo CSV');
  }
};

// Também atualize a função handleImprimir para ser mais robusta
const handleImprimir = async (relatorioId: string) => {
  try {
    const relatorio = relatorios?.relatorios.find((r: Relatorio) => r.id === relatorioId);
    if (!relatorio) {
      alert('Relatório não encontrado');
      return;
    }

    const dados = JSON.parse(relatorio.dadosJson);
    const janelaImpressao = window.open('', '_blank');
    
    if (!janelaImpressao) {
      alert('Permita pop-ups para imprimir');
      return;
    }

    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${relatorio.titulo}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .section { 
            margin-bottom: 15px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
            font-size: 10px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 10px; 
            margin-bottom: 15px;
          }
          .stat-card { 
            border: 1px solid #ddd; 
            padding: 10px; 
            border-radius: 4px;
            text-align: center;
          }
          .stat-card h3 {
            margin: 0 0 5px 0;
            font-size: 11px;
            color: #666;
          }
          .stat-card p {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
          }
          @media print {
            body { margin: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0 0 5px 0; font-size: 16px;">${relatorio.titulo}</h1>
          <p style="margin: 0; color: #666;">Gerado em: ${new Date(relatorio.geradoEm).toLocaleDateString('pt-BR')} às ${new Date(relatorio.geradoEm).toLocaleTimeString('pt-BR')}</p>
          <p style="margin: 0; color: #666;">Por: ${relatorio.usuario.nome}</p>
        </div>

        <div class="section">
          <h2 style="margin: 0 0 10px 0; font-size: 14px;">Estatísticas</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total de Senhas</h3>
              <p>${dados.estatisticas.totalSenhas || 0}</p>
            </div>
            <div class="stat-card">
              <h3>Atendimentos Concluídos</h3>
              <p>${dados.estatisticas.atendimentosConcluidos || 0}</p>
            </div>
            <div class="stat-card">
              <h3>Tempo Médio de Espera</h3>
              <p>${dados.estatisticas.tempoMedioEspera || 0} min</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 style="margin: 0 0 10px 0; font-size: 14px;">Detalhes das Senhas (${dados.detalhes.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Paciente</th>
                <th>Idade</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Tempo Espera</th>
              </tr>
            </thead>
            <tbody>
              ${dados.detalhes.slice(0, 50).map((item: any) => `
                <tr>
                  <td>${item.codigo || '-'}</td>
                  <td>${item.paciente?.nome || '-'}</td>
                  <td>${item.paciente?.idade || '-'}</td>
                  <td>${item.prioridade || '-'}</td>
                  <td>${item.status || '-'}</td>
                  <td>${item.tempoEspera || 0} min</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${dados.detalhes.length > 50 ? 
            `<p style="text-align: center; color: #666; font-style: italic;">
              ... e mais ${dados.detalhes.length - 50} registros
            </p>` : ''}
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Fechar
          </button>
        </div>
      </body>
      </html>
    `);
    
    janelaImpressao.document.close();
    
  } catch (error: any) {
    console.error('Erro ao preparar impressão:', error);
    alert('Erro ao preparar a impressão: ' + error.message);
  }
};

  const handleGerarRelatorio = () => {
    const filtros = prepararFiltros()
    gerarRelatorioMutation.mutate(filtros)
  }

  // Dados mockados para a UI (mantendo a aparência original)
  const relatoriosDisponiveis = [
    {
      id: 'diario',
      title: 'Relatório Diário',
      description: 'Estatísticas detalhadas do atendimento do dia atual, incluindo volume de pacientes e tempo de espera.',
      icon: Calendar,
      stats: { visitas: relatorios?.relatorios.filter((r: Relatorio) => r.tipo === 'DIARIO').length || 0, crescimento: '+12%', tempo: '18min' },
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'semanal',
      title: 'Relatório Semanal',
      description: 'Análise semanal do fluxo de pacientes, tendências e comparações com semanas anteriores.',
      icon: BarChart3,
      stats: { visitas: relatorios?.relatorios.filter((r: Relatorio) => r.tipo === 'SEMANAL').length || 0, crescimento: '+8%', tempo: '157' },
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'mensal',
      title: 'Relatório Mensal',
      description: 'Visão abrangente do mês, incluindo picos de atendimento, sazonalidades e performance geral.',
      icon: TrendingUp,
      stats: { visitas: relatorios?.relatorios.filter((r: Relatorio) => r.tipo === 'MENSAL').length || 0, crescimento: '+15%', tempo: '160' },
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'anual',
      title: 'Relatório Anual',
      description: 'Consolidação anual com análises de crescimento, sazonalidades e planejamento estratégico.',
      icon: Users,
      stats: { visitas: relatorios?.relatorios.filter((r: Relatorio) => r.tipo === 'ANUAL').length || 0, crescimento: '+22%', tempo: '159' },
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'personalizado',
      title: 'Relatório Personalizado',
      description: 'Crie relatórios customizados com períodos específicos, filtros avançados e métricas personalizadas.',
      icon: Filter,
      stats: { filtros: '∞', opcoes: '25+', metricas: '10+' },
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const estatisticasGerais = {
    senhasHoje: 155,
    muitoUrgente: 22,
    urgente: 88,
    poucoUrgente: 47,
    esteMes: relatorios?.relatorios.length || 0
  }

  useEffect(() => {
    // Set default dates
    const hoje = new Date().toISOString().split('T')[0]
    setDataInicial(hoje)
    setDataFinal(hoje)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-green-600" />
                Relatórios
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard / Relatórios
              </p>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{estatisticasGerais.senhasHoje}</div>
                <p className="text-xs text-gray-500">SENHAS HOJE</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{estatisticasGerais.muitoUrgente}</div>
                <p className="text-xs text-gray-500">MUITO URGENTE</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{estatisticasGerais.urgente}</div>
                <p className="text-xs text-gray-500">URGENTE</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{estatisticasGerais.poucoUrgente}</div>
                <p className="text-xs text-gray-500">POUCO URGENTE</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{estatisticasGerais.esteMes}</div>
                <p className="text-xs text-gray-500">ESTE MÊS</p>
              </CardContent>
            </Card>
          </div>

          {/* Tipos de Relatórios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {relatoriosDisponiveis.map((relatorio) => {
              const Icon = relatorio.icon
              
              return (
                <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${relatorio.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {relatorio.id === 'diario' ? '17' : 
                         relatorio.id === 'semanal' ? 'M' :
                         relatorio.id === 'mensal' ? '📊' :
                         relatorio.id === 'anual' ? '👥' : '🔧'}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg mt-4">{relatorio.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {relatorio.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Estatísticas do Relatório */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-bold text-sm">{Object.values(relatorio.stats)[0]}</div>
                        <div className="text-xs text-gray-500">{Object.keys(relatorio.stats)[0].toUpperCase()}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-bold text-sm">{Object.values(relatorio.stats)[1]}</div>
                        <div className="text-xs text-gray-500">{Object.keys(relatorio.stats)[1].toUpperCase()}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-bold text-sm">{Object.values(relatorio.stats)[2]}</div>
                        <div className="text-xs text-gray-500">{Object.keys(relatorio.stats)[2].toUpperCase()}</div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleGerarRelatorio}
                      disabled={gerarRelatorioMutation.isPending}
                    >
                      {gerarRelatorioMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Filtros Avançados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoje">Hoje</SelectItem>
                      <SelectItem value="Esta Semana">Esta Semana</SelectItem>
                      <SelectItem value="Este Mês">Este Mês</SelectItem>
                      <SelectItem value="Personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Data Inicial</label>
                  <Input 
                    type="date" 
                    value={dataInicial} 
                    onChange={(e) => setDataInicial(e.target.value)}
                    disabled={periodo !== 'Personalizado'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Data Final</label>
                  <Input 
                    type="date" 
                    value={dataFinal} 
                    onChange={(e) => setDataFinal(e.target.value)}
                    disabled={periodo !== 'Personalizado'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Prioridade</label>
                  <Select value={prioridade} onValueChange={setPrioridade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas as Prioridades">Todas as Prioridades</SelectItem>
                      <SelectItem value="Muito Urgente">Muito Urgente</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Pouco Urgente">Pouco Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Turno</label>
                  <Select value={turno} onValueChange={setTurno}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos os Turnos">Todos os Turnos</SelectItem>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Faixa Etária</label>
                  <Select value={faixaEtaria} onValueChange={setFaixaEtaria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas as Idades">Todas as Idades</SelectItem>
                      <SelectItem value="0-2 anos">0-2 anos</SelectItem>
                      <SelectItem value="3-5 anos">3-5 anos</SelectItem>
                      <SelectItem value="6-12 anos">6-12 anos</SelectItem>
                      <SelectItem value="13-18 anos">13-18 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center space-x-3 mt-6">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleGerarRelatorio}
                  disabled={gerarRelatorioMutation.isPending}
                >
                  {gerarRelatorioMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Filter className="h-4 w-4 mr-2" />
                  )}
                  Aplicar Filtros
                </Button>
                <Button variant="outline">
                  Limpar Filtros
                </Button>
                <Button variant="outline">
                  Salvar Filtro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exportar Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Exportar Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {['PDF', 'CSV', 'Email', 'Imprimir'].map((format) => (
                  <Button 
                     key={format}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => {
                      if (relatorios?.relatorios.length) {
                        if (format === 'Imprimir') {
                          handleImprimir(relatorios.relatorios[0].id);
                        } else {
                          handleDownload(relatorios.relatorios[0].id, format.toLowerCase());
                        }
                      } else {
                        alert('Gere um relatório primeiro!');
                      }
                    }}
                  >
                    <div className="text-2xl">
                      {format === 'PDF' && '📄'}
                      {format === 'CSV' && '📋'}
                      {format === 'Email' && '📧'}
                      {format === 'Imprimir' && '🖨️'}
                    </div>
                    <span className="text-xs">{format}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}