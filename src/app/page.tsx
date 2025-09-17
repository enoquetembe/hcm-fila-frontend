'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  Users, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { dashboardAPI, senhaAPI, pacienteAPI } from '@/lib/api'
import { DashboardStats, FilaResumo } from '@/types'
import { formatTimeAgo, getPriorityColor, getPriorityText, getStatusText, formatTempoEspera } from '@/lib/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

interface NovoPackienteForm {
  nomeCompleto: string
  numeroIdentificacao: string
  idade: number
  telefone: string
  responsavel: string
  telefoneResponsavel: string
  sintomas: string
  prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE' | ''
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [formData, setFormData] = useState<NovoPackienteForm>({
    nomeCompleto: '',
    numeroIdentificacao: '',
    idade: 0,
    telefone: '',
    responsavel: '',
    telefoneResponsavel: '',
    sintomas: '',
    prioridade: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Queries para buscar dados com polling rápido
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 5000, // 5 segundos
  })

  const { data: filaData, isLoading: filaLoading } = useQuery({
    queryKey: ['fila-resumo'],
    queryFn: dashboardAPI.getFilaResumo,
    refetchInterval: 3000, // 3 segundos
  })

  // Mutations
  const criarPacienteMutation = useMutation({
    mutationFn: pacienteAPI.create,
  })

  const criarSenhaMutation = useMutation({
    mutationFn: senhaAPI.create,
  })

  const chamarProximoMutation = useMutation({
    mutationFn: senhaAPI.chamarProximo,
  })

  const stats = statsData?.stats
  const fila = filaData

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório'
    }

    if (!formData.idade || formData.idade < 0 || formData.idade > 14) {
      newErrors.idade = 'Idade deve estar entre 0 e 14 anos'
    }

    if (!formData.sintomas.trim()) {
      newErrors.sintomas = 'Descrição dos sintomas é obrigatória'
    }

    if (!formData.prioridade) {
      newErrors.prioridade = 'Prioridade é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof NovoPackienteForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      // 1. Criar paciente
      const novoPaciente = await criarPacienteMutation.mutateAsync({
        nomeCompleto: formData.nomeCompleto,
        numeroIdentificacao: formData.numeroIdentificacao || undefined,
        idade: formData.idade,
        telefone: formData.telefone || undefined,
        responsavel: formData.responsavel || undefined,
        telefoneResponsavel: formData.telefoneResponsavel || undefined
      })

      // 2. Criar senha
      await criarSenhaMutation.mutateAsync({
        pacienteId: novoPaciente.paciente.id,
        sintomas: formData.sintomas,
        prioridade: formData.prioridade as 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
      })

      // 3. Limpar formulário
      setFormData({
        nomeCompleto: '',
        numeroIdentificacao: '',
        idade: 0,
        telefone: '',
        responsavel: '',
        telefoneResponsavel: '',
        sintomas: '',
        prioridade: ''
      })

    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao registrar paciente')
    }
  }

  const handleChamarProximo = async () => {
    try {
      await chamarProximoMutation.mutateAsync()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao chamar próximo paciente')
    }
  }

  const isSubmitting = criarPacienteMutation.isPending || criarSenhaMutation.isPending

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
              <p className="text-gray-600">
                {currentTime.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} - {currentTime.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleChamarProximo}
                disabled={chamarProximoMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {chamarProximoMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                Chamar Próximo
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Senhas Hoje */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Senhas Hoje</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats?.senhasHoje.total || 0}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats?.senhasHoje.crescimento || '+0%'} vs ontem</span>
                </div>
              </CardContent>
            </Card>

            {/* Muito Urgente */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Muito Urgente</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {statsLoading ? '...' : stats?.prioridades.MUITO_URGENTE || 0}
                </div>
                <p className="text-xs text-muted-foreground">Na fila agora</p>
              </CardContent>
            </Card>

            {/* Urgente */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgente</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {statsLoading ? '...' : stats?.prioridades.URGENTE || 0}
                </div>
                <p className="text-xs text-muted-foreground">Na fila agora</p>
              </CardContent>
            </Card>

            {/* Pouco Urgente */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pouco Urgente</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats?.prioridades.POUCO_URGENTE || 0}
                </div>
                <p className="text-xs text-muted-foreground">Na fila agora</p>
              </CardContent>
            </Card>

            {/* Tempo Médio */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : `${stats?.tempoMedio.espera || 0}min`}
                </div>
                <p className="text-xs text-muted-foreground">Tempo de espera</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registrar Novo Paciente */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Registrar Novo Paciente
                  </CardTitle>
                  <CardDescription>
                    Adicione um novo paciente e gere uma senha para atendimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome do paciente..."
                            value={formData.nomeCompleto}
                            onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        {errors.nomeCompleto && <FormMessage>{errors.nomeCompleto}</FormMessage>}
                      </FormItem>

                      <FormItem>
                        <FormLabel>Número de Identificação</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ID do paciente (opcional)..."
                            value={formData.numeroIdentificacao}
                            onChange={(e) => handleInputChange('numeroIdentificacao', e.target.value)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Idade *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="14"
                            value={formData.idade || ''}
                            onChange={(e) => handleInputChange('idade', parseInt(e.target.value) || 0)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        {errors.idade && <FormMessage>{errors.idade}</FormMessage>}
                      </FormItem>

                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+258 84 1234567"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome do responsável..."
                            value={formData.responsavel}
                            onChange={(e) => handleInputChange('responsavel', e.target.value)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Telefone do Responsável</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+258 84 1234567"
                            value={formData.telefoneResponsavel}
                            onChange={(e) => handleInputChange('telefoneResponsavel', e.target.value)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    {/* Sintomas primeiro */}
                    <FormItem>
                      <FormLabel>Sintomas *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3}
                          placeholder="Descreva os sintomas do paciente..."
                          value={formData.sintomas}
                          onChange={(e) => handleInputChange('sintomas', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {errors.sintomas && <FormMessage>{errors.sintomas}</FormMessage>}
                    </FormItem>

                    {/* Prioridade depois */}
                    <FormItem>
                      <FormLabel>Prioridade *</FormLabel>
                      <FormControl>
                        <Select 
                          value={formData.prioridade} 
                          onValueChange={(value) => handleInputChange('prioridade', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MUITO_URGENTE">Muito Urgente</SelectItem>
                            <SelectItem value="URGENTE">Urgente</SelectItem>
                            <SelectItem value="POUCO_URGENTE">Pouco Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {errors.prioridade && <FormMessage>{errors.prioridade}</FormMessage>}
                    </FormItem>

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Gerar Senha
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Fila Actual */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Fila Actual
                    <Badge variant="secondary">
                      {filaLoading ? '...' : fila?.totalNaFila || 0} aguardando
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filaLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                      </div>
                    ) : fila?.fila.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Fila vazia</p>
                      </div>
                    ) : (
                      fila?.fila.slice(0, 5).map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            item.prioridade === 'MUITO_URGENTE' ? 'border-red-500 bg-red-50' :
                            item.prioridade === 'URGENTE' ? 'border-orange-500 bg-orange-50' :
                            'border-green-500 bg-green-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <Badge className={getPriorityColor(item.prioridade)}>
                                  {item.codigo}
                                </Badge>
                                {item.status === 'EM_ATENDIMENTO' && (
                                  <Badge variant="secondary" className="animate-pulse">
                                    Atendendo
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-sm mt-1 truncate">
                                {item.paciente.nome}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.paciente.idade} anos • {formatTempoEspera(item.tempoEspera)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">#{item.posicao}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {fila && fila.fila.length > 5 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">
                          +{fila.fila.length - 5} pacientes na fila
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Próximo Paciente em Atendimento */}
                  {stats?.proximoPaciente && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 text-sm mb-2 flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        Atendendo Agora
                      </h4>
                      <div className="space-y-1">
                        <p className="font-medium text-green-900">
                          {stats.proximoPaciente.nome}
                        </p>
                        <div className="flex justify-between text-xs text-green-700">
                          <span>{stats.proximoPaciente.codigo}</span>
                          <span>{stats.proximoPaciente.tempoAtendimento}min</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}