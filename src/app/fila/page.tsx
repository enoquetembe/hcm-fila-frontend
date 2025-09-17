'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Clock, 
  AlertTriangle,
  Phone,
  UserCheck,
  UserX,
  Play,
  Pause,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { senhaAPI } from '@/lib/api'
import { formatTimeAgo, getPriorityColor, getPriorityText, getStatusColor, getStatusText, formatTempoEspera } from '@/lib/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function FilaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null)

  // Query para buscar fila atual com polling rápido
  const { data: filaData, isLoading } = useQuery({
    queryKey: ['fila-atual'],
    queryFn: senhaAPI.getFilaAtual,
    refetchInterval: 3000, // 3 segundos
  })

  const senhas = filaData?.fila || []
  const estatisticas = filaData?.estatisticas || {}

  // Filtrar senhas
  const filteredSenhas = senhas.filter(senha => {
    const matchesSearch = !searchTerm || 
      senha.paciente.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senha.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senha.paciente.numeroIdentificacao.includes(searchTerm)
    
    const matchesPriority = priorityFilter === 'all' || senha.prioridade === priorityFilter
    const matchesStatus = statusFilter === 'all' || senha.status === statusFilter

    return matchesSearch && matchesPriority && matchesStatus
  })

  const handleChamarProximo = async () => {
    try {
      await senhaAPI.chamarProximo()
    } catch (error) {
      console.error('Erro ao chamar próximo paciente:', error)
    }
  }

  const handleUpdateStatus = async (senhaId: string, status: string) => {
    setAcaoEmAndamento(`${senhaId}-${status}`)
    try {
      await senhaAPI.updateStatus(senhaId, status)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    } finally {
      setAcaoEmAndamento(null)
    }
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
                <Clock className="h-8 w-8 mr-3 text-green-600" />
                Fila de Espera
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie e monitore a fila de atendimento em tempo real
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total na Fila</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-600 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {isLoading ? '...' : estatisticas.senhasAguardando || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pacientes aguardando</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Muito Urgente</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {isLoading ? '...' : estatisticas.senhasPorPrioridade?.MUITO_URGENTE || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Casos críticos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Urgente</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-orange-600">
                  {isLoading ? '...' : estatisticas.senhasPorPrioridade?.URGENTE || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Atenção rápida</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pouco Urgente</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : estatisticas.senhasPorPrioridade?.POUCO_URGENTE || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Consulta rotina</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Tempo Médio</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  {isLoading ? '...' : `${estatisticas.tempoMedioEspera || 0}`}
                </div>
                <p className="text-xs text-gray-500 mt-1">minutos</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            {/* Ações Rápidas */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleChamarProximo}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Chamar Próximo
              </Button>
              
              <Button variant="outline">
                <UserX className="w-4 h-4 mr-2" />
                Pausar Paciente
              </Button>
              
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar Fila
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar Paciente
                </label>
                <Input
                  placeholder="Nome, ID ou Senha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Filtrar por Prioridade
                </label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as Prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="MUITO_URGENTE">Muito Urgente</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                    <SelectItem value="POUCO_URGENTE">Pouco Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[150px]">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                    <SelectItem value="CHAMANDO">Chamando</SelectItem>
                    <SelectItem value="EM_ATENDIMENTO">Em Atendimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lista de Espera */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Lista de Espera
                </span>
                <Badge variant="secondary">
                  {filteredSenhas.length} pacientes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : filteredSenhas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum paciente na fila</p>
                  <p className="text-sm">A fila está vazia no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSenhas.map((senha, index) => (
                    <div
                      key={senha.id}
                      className={`
                        p-4 rounded-lg border-l-4 transition-all hover:shadow-md
                        ${senha.prioridade === 'MUITO_URGENTE' ? 'border-red-500 bg-red-50' :
                          senha.prioridade === 'URGENTE' ? 'border-orange-500 bg-orange-50' :
                          'border-green-500 bg-green-50'
                        }
                        ${senha.status === 'CHAMANDO' ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
                        ${senha.status === 'EM_ATENDIMENTO' ? 'ring-2 ring-green-400' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Posição e Código */}
                          <div className="text-center">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-700 border-2">
                              {senha.posicaoFila || index + 1}
                            </div>
                          </div>

                          {/* Info do Paciente */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getPriorityColor(senha.prioridade)}>
                                {senha.codigo}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(senha.status)}
                              >
                                {getStatusText(senha.status)}
                              </Badge>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 truncate">
                              {senha.paciente.nomeCompleto}
                            </h3>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>ID: {senha.paciente.numeroIdentificacao}</span>
                              <span>{senha.paciente.idade} anos</span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTempoEspera(senha.tempoEspera || 0)}
                              </span>
                            </div>

                            {/* Sintomas (truncados) */}
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {senha.sintomas}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {senha.status === 'AGUARDANDO' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(senha.id, 'CHAMANDO')}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={acaoEmAndamento === `${senha.id}-CHAMANDO`}
                              >
                                {acaoEmAndamento === `${senha.id}-CHAMANDO` ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Phone className="h-3 w-3 mr-1" />
                                )}
                                Chamar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(senha.id, 'EM_ATENDIMENTO')}
                                disabled={acaoEmAndamento === `${senha.id}-EM_ATENDIMENTO`}
                              >
                                {acaoEmAndamento === `${senha.id}-EM_ATENDIMENTO` ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Play className="h-3 w-3 mr-1" />
                                )}
                                Iniciar
                              </Button>
                            </>
                          )}
                          
                          {senha.status === 'CHAMANDO' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(senha.id, 'EM_ATENDIMENTO')}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={acaoEmAndamento === `${senha.id}-EM_ATENDIMENTO`}
                            >
                              {acaoEmAndamento === `${senha.id}-EM_ATENDIMENTO` ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <UserCheck className="h-3 w-3 mr-1" />
                              )}
                              Atender
                            </Button>
                          )}
                          
                          {senha.status === 'EM_ATENDIMENTO' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(senha.id, 'ATENDIDO')}
                              className="bg-gray-600 hover:bg-gray-700"
                              disabled={acaoEmAndamento === `${senha.id}-ATENDIDO`}
                            >
                              {acaoEmAndamento === `${senha.id}-ATENDIDO` ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Pause className="h-3 w-3 mr-1" />
                              )}
                              Finalizar
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(senha.id, 'CANCELADO')}
                            disabled={acaoEmAndamento === `${senha.id}-CANCELADO`}
                          >
                            {acaoEmAndamento === `${senha.id}-CANCELADO` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}