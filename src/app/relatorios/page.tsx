
// src/app/relatorios/page.tsx
'use client'

import { useState } from 'react'
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('Hoje')
  const [dataInicial, setDataInicial] = useState('01-Jan-2024')
  const [dataFinal, setDataFinal] = useState('31-Dec-2024')
  const [prioridade, setPrioridade] = useState('Todas as Prioridades')
  const [turno, setTurno] = useState('Todos os Turnos')
  const [faixaEtaria, setFaixaEtaria] = useState('Todas as Idades')

  // Dados mockados para os relatórios
  const relatoriosDisponiveis = [
    {
      id: 'diario',
      title: 'Relatório Diário',
      description: 'Estatísticas detalhadas do atendimento do dia atual, incluindo volume de pacientes e tempo de espera.',
      icon: Calendar,
      stats: { visitas: 156, crescimento: '+12%', tempo: '18min' },
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'semanal',
      title: 'Relatório Semanal',
      description: 'Análise semanal do fluxo de pacientes, tendências e comparações com semanas anteriores.',
      icon: BarChart3,
      stats: { visitas: '1.1k', crescimento: '+8%', tempo: '157' },
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'mensal',
      title: 'Relatório Mensal',
      description: 'Visão abrangente do mês, incluindo picos de atendimento, sazonalidades e performance geral.',
      icon: TrendingUp,
      stats: { visitas: '4.8k', crescimento: '+15%', tempo: '160' },
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'anual',
      title: 'Relatório Anual',
      description: 'Consolidação anual com análises de crescimento, sazonalidades e planejamento estratégico.',
      icon: Users,
      stats: { visitas: '58k', crescimento: '+22%', tempo: '159' },
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
    esteMes: 2
  }

  const handleExportReport = (format: string, reportType: string) => {
    console.log(`Exportando relatório ${reportType} em formato ${format}`)
    // Implementar lógica de exportação
  }

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
                    
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Análise Comparativa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-pink-500" />
                Análise Comparativa
              </CardTitle>
              <CardDescription>
                Compare diferentes períodos, turnos, prioridades e identifique padrões e oportunidades de melhoria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-gray-500">DIMENSÕES</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-sm text-gray-500">GRÁFICOS</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">📊</div>
                  <div className="text-sm text-gray-500">INSIGHTS</div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Data Final</label>
                  <Input 
                    type="date" 
                    value={dataFinal} 
                    onChange={(e) => setDataFinal(e.target.value)}
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
                <Button className="bg-green-600 hover:bg-green-700">
                  <Filter className="h-4 w-4 mr-2" />
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
                {['PDF', 'Excel', 'CSV', 'Imagem', 'Email', 'Imprimir'].map((format) => (
                  <Button 
                    key={format}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => handleExportReport(format, 'geral')}
                  >
                    <div className="text-2xl">
                      {format === 'PDF' && '📄'}
                      {format === 'Excel' && '📊'}
                      {format === 'CSV' && '📋'}
                      {format === 'Imagem' && '🖼️'}
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