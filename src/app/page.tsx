'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Clock, 
  Plus,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { dashboardAPI, senhaAPI, pacienteAPI } from '@/lib/api'
import { formatTempoEspera, getPriorityColor } from '@/lib/utils'

interface NovoPacienteForm {
  nomeCompleto: string
  numeroIdentificacao: string
  idade: number
  telefone: string
  responsavel: string
  telefoneResponsavel: string
  sintomas: string
}

export default function PacientePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [formData, setFormData] = useState<NovoPacienteForm>({
    nomeCompleto: '',
    numeroIdentificacao: '',
    idade: 0,
    telefone: '',
    responsavel: '',
    telefoneResponsavel: '',
    sintomas: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null)

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Query para buscar fila atual
  const { data: filaData, isLoading: filaLoading, refetch: refetchFila } = useQuery({
    queryKey: ['fila-paciente'],
    queryFn: senhaAPI.getFilaAtual,
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório'
    }

    if (!formData.numeroIdentificacao.trim()) {
      newErrors.numeroIdentificacao = 'Número de identificação é obrigatório'
    }

    if (!formData.idade || formData.idade <= 0 || formData.idade > 18) {
      newErrors.idade = 'Idade deve estar entre 1 e 18 anos'
    }

    if (!formData.sintomas.trim()) {
      newErrors.sintomas = 'Descrição dos sintomas é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof NovoPacienteForm, value: string | number) => {
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
      const novoPaciente = await pacienteAPI.create({
        nomeCompleto: formData.nomeCompleto,
        numeroIdentificacao: formData.numeroIdentificacao,
        idade: formData.idade,
        telefone: formData.telefone || undefined,
        responsavel: formData.responsavel || undefined,
        telefoneResponsavel: formData.telefoneResponsavel || undefined
      })

      // 2. Criar senha (prioridade será definida automaticamente no backend)
      const senha = await senhaAPI.create({
        pacienteId: novoPaciente.paciente.id,
        sintomas: formData.sintomas,
        prioridade: 'POUCO_URGENTE' // Prioridade padrão para pacientes
      })

      // 3. Mostrar senha gerada
      setSenhaGerada(senha.senha.codigo)

      // 4. Limpar formulário
      setFormData({
        nomeCompleto: '',
        numeroIdentificacao: '',
        idade: 0,
        telefone: '',
        responsavel: '',
        telefoneResponsavel: '',
        sintomas: ''
      })

      // 5. Atualizar fila
      refetchFila()

    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao registrar paciente')
    }
  }

  const fila = filaData?.fila || []
  const estatisticas = filaData?.estatisticas || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center">
            <Eye className="h-10 w-10 mr-3 text-green-600" />
            Área do Paciente
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema de Monitoria - Hospital Central de Maputo
          </p>
          <p className="text-sm text-gray-500">
            {currentTime.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Estatísticas Rápidas */}
  
<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  <Card className="bg-white/80 backdrop-blur-sm">
    <CardContent className="p-4 text-center">
      <div className="text-2xl font-bold text-blue-600">
        {filaLoading ? '...' : estatisticas.senhasAguardando || 0}
      </div>
      <p className="text-sm text-gray-600">Total na Fila</p>
    </CardContent>
  </Card>

  <Card className="bg-white/80 backdrop-blur-sm">
    <CardContent className="p-4 text-center">
      <div className="text-2xl font-bold text-red-600">
        {filaLoading ? '...' : estatisticas.senhasPorPrioridade?.MUITO_URGENTE || 0}
      </div>
      <p className="text-sm text-gray-600">Muito Urgente</p>
    </CardContent>
  </Card>

  <Card className="bg-white/80 backdrop-blur-sm">
    <CardContent className="p-4 text-center">
      <div className="text-2xl font-bold text-orange-600">
        {filaLoading ? '...' : estatisticas.senhasPorPrioridade?.URGENTE || 0}
      </div>
      <p className="text-sm text-gray-600">Urgente</p>
    </CardContent>
  </Card>

  <Card className="bg-white/80 backdrop-blur-sm">
    <CardContent className="p-4 text-center">
      <div className="text-2xl font-bold text-green-600">
        {filaLoading ? '...' : estatisticas.senhasPorPrioridade?.POUCO_URGENTE || 0}
      </div>
      <p className="text-sm text-gray-600">Pouco Urgente</p>
    </CardContent>
  </Card>

  <Card className="bg-white/80 backdrop-blur-sm">
    <CardContent className="p-4 text-center">
      <Button 
        onClick={() => refetchFila()}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
    </CardContent>
  </Card>
</div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Registro */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Registrar para Atendimento
              </CardTitle>
              <CardDescription>
                Preencha os dados para receber sua senha de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {senhaGerada && (
                <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg text-center">
                  <h3 className="font-bold text-green-800 text-lg">Senha Gerada!</h3>
                  <div className="text-3xl font-bold text-green-900 my-2">
                    {senhaGerada}
                  </div>
                  <p className="text-sm text-green-700">
                    Aguarde ser chamado 
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      placeholder="Nome do paciente..."
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                    />
                    {errors.nomeCompleto && (
                      <p className="text-sm text-red-600">{errors.nomeCompleto}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroIdentificacao">Nº Identificação *</Label>
                    <Input
                      id="numeroIdentificacao"
                      placeholder="Número de identificação..."
                      value={formData.numeroIdentificacao}
                      onChange={(e) => handleInputChange('numeroIdentificacao', e.target.value)}
                    />
                    {errors.numeroIdentificacao && (
                      <p className="text-sm text-red-600">{errors.numeroIdentificacao}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade *</Label>
                    <Input
                      id="idade"
                      type="number"
                      min="1"
                      max="18"
                      placeholder="Idade"
                      value={formData.idade || ''}
                      onChange={(e) => handleInputChange('idade', parseInt(e.target.value) || 0)}
                    />
                    {errors.idade && (
                      <p className="text-sm text-red-600">{errors.idade}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="+258 84 1234567"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      placeholder="Nome do responsável..."
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefoneResponsavel">Tel. Responsável</Label>
                    <Input
                      id="telefoneResponsavel"
                      placeholder="+258 84 1234567"
                      value={formData.telefoneResponsavel}
                      onChange={(e) => handleInputChange('telefoneResponsavel', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sintomas">Sintomas *</Label>
                  <Textarea
                    id="sintomas"
                    rows={3}
                    placeholder="Descreva os sintomas do paciente..."
                    value={formData.sintomas}
                    onChange={(e) => handleInputChange('sintomas', e.target.value)}
                  />
                  {errors.sintomas && (
                    <p className="text-sm text-red-600">{errors.sintomas}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar Senha de Atendimento
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Visualização da Fila */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Fila de Atendimento
                </span>
                <Badge variant="secondary">
                  {filaLoading ? '...' : fila.length} pacientes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filaLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : fila.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhum paciente na fila</p>
                  </div>
                ) : (
                  fila.slice(0, 8).map((senha, index) => (
                    <div
                      key={senha.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        senha.prioridade === 'MUITO_URGENTE' ? 'border-red-500 bg-red-50' :
                        senha.prioridade === 'URGENTE' ? 'border-orange-500 bg-orange-50' :
                        'border-green-500 bg-green-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(senha.prioridade)}>
                              {senha.codigo}
                            </Badge>
                            {senha.status === 'EM_ATENDIMENTO' && (
                              <Badge variant="secondary" className="animate-pulse">
                                Em Atendimento
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm mt-1">
                            {senha.paciente.nomeCompleto}
                          </p>
                          <p className="text-xs text-gray-500">
                            {senha.paciente.idade} anos • {formatTempoEspera(senha.tempoEspera || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Posição #{index + 1}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {fila.length > 8 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500">
                      +{fila.length - 8} pacientes na fila
                    </p>
                  </div>
                )}
              </div>

              {/* Informações Importantes */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Informações Importantes
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Sua senha será chamada</li>
                  <li>• Aguarde na sala de espera</li>
                  <li>• Mantenha seu número de identificação à mão</li>
                  <li>• Tempo médio de espera: {estatisticas.tempoMedioEspera || 0} minutos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>Hospital Central de Maputo • Sector de Pediatria</p>
          <p>Sistema de Monitoria de Filas • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}