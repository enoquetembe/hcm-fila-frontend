'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Clock, 
  Eye,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Timer,
  Info,
  Brain,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { dashboardAPI, senhaAPI } from '@/lib/api'
import { formatTempoEspera, getPriorityColor, getPriorityText } from '@/lib/utils'
import { analisarSintomasGemini } from '@/lib/gemini'

interface TriagemForm {
  nomeCompleto: string
  idade: number
  sintomas: string
}

interface ResultadoTriagem {
  prioridadeSugerida: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
  tempoEstimado: number
  descricao: string
  recomendacao: string
  usandoIA: boolean
}

export default function PacientePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [formData, setFormData] = useState<TriagemForm>({
    nomeCompleto: '',
    idade: 0,
    sintomas: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resultadoTriagem, setResultadoTriagem] = useState<ResultadoTriagem | null>(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Query para buscar fila atual
  const { data: filaData, isLoading: filaLoading, refetch: refetchFila } = useQuery({
    queryKey: ['fila-paciente'],
    queryFn: senhaAPI.getFilaAtual,
    refetchInterval: 10000,
  })

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof TriagemForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calcularTempoEstimado = (prioridade: string): number => {
    const fila = filaData?.fila || []
    
    let tempoEstimado = 0
    const tempoMedioPorPrioridade = {
      'MUITO_URGENTE': 15,
      'URGENTE': 25,
      'POUCO_URGENTE': 35
    }

    const pacientesNaFrente = fila.filter(senha => {
      const prioridades = ['MUITO_URGENTE', 'URGENTE', 'POUCO_URGENTE']
      const indexSugerido = prioridades.indexOf(prioridade)
      const indexSenha = prioridades.indexOf(senha.prioridade)
      return indexSenha <= indexSugerido
    }).length

    tempoEstimado = pacientesNaFrente * tempoMedioPorPrioridade[prioridade as keyof typeof tempoMedioPorPrioridade]
    return tempoEstimado
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setCarregando(true)
    setMostrarResultado(false)

    try {
      // Usar Gemini para análise dos sintomas
      const resultadoGemini = await analisarSintomasGemini(formData.sintomas, formData.idade)
      
      const tempoEstimado = calcularTempoEstimado(resultadoGemini.prioridade)

      const resultado: ResultadoTriagem = {
        prioridadeSugerida: resultadoGemini.prioridade,
        tempoEstimado,
        descricao: resultadoGemini.explicacao,
        recomendacao: resultadoGemini.recomendacao,
        usandoIA: true
      }

      setResultadoTriagem(resultado)
      setMostrarResultado(true)

    } catch (error: any) {
      console.error('Erro na triagem:', error)
      alert('Erro ao processar triagem. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const handleNovaTriagem = () => {
    setMostrarResultado(false)
    setResultadoTriagem(null)
    setFormData({
      nomeCompleto: '',
      idade: 0,
      sintomas: ''
    })
  }

  const fila = filaData?.fila || []
  const estatisticas = filaData?.estatisticas || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center">
            <Stethoscope className="h-10 w-10 mr-3 text-green-600" />
            Sistema de Triagem - Pediatria
          </h1>
          <p className="text-gray-600 mt-2">
            Hospital Central de Maputo • Pré-registo e Orientação
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filaLoading ? '...' : estatisticas.senhasAguardando || 0}
              </div>
              <p className="text-sm text-gray-600">Pacientes na Fila</p>
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
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Triagem */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                {mostrarResultado ? 'Resultado da Triagem' : 'Pré-registo e Triagem'}
              </CardTitle>
              <CardDescription>
                {mostrarResultado 
                  ? 'Veja a orientação baseada nos sintomas descritos'
                  : 'Descreva os sintomas para receber orientação sobre prioridade'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {carregando ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                  <div className="text-center">
                    <p className="font-medium">Analisando sintomas com IA...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <Brain className="h-4 w-4 inline mr-1" />
                      Usando inteligência artificial para melhor avaliação
                    </p>
                  </div>
                </div>
              ) : mostrarResultado && resultadoTriagem ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-l-4 ${
                    resultadoTriagem.prioridadeSugerida === 'MUITO_URGENTE' ? 
                      'border-red-500 bg-red-50' :
                    resultadoTriagem.prioridadeSugerida === 'URGENTE' ? 
                      'border-orange-500 bg-orange-50' :
                      'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Prioridade: {getPriorityText(resultadoTriagem.prioridadeSugerida)}</h3>
                        <Badge className={getPriorityColor(resultadoTriagem.prioridadeSugerida)}>
                          {resultadoTriagem.prioridadeSugerida}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {resultadoTriagem.tempoEstimado}min
                        </div>
                        <div className="text-sm text-gray-600">Tempo estimado</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                        <p className="text-sm">{resultadoTriagem.descricao}</p>
                      </div>
                      
                      <div className="flex items-start">
                        <Timer className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                        <p className="text-sm font-medium">{resultadoTriagem.recomendacao}</p>
                      </div>
                    </div>

                    {resultadoTriagem.usandoIA && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <Brain className="h-3 w-3 mr-1" />
                          Análise feita com inteligência artificial
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm mb-2">
                      Próximos Passos:
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Dirija-se à recepção para registro completo</li>
                      <li>Apresente este resultado ao atendente</li>
                      <li>Aguarde na sala de espera conforme orientação</li>
                      <li>Mantenha a criança hidratada e confortável</li>
                    </ol>
                  </div>

                  <Button 
                    onClick={handleNovaTriagem}
                    variant="outline"
                    className="w-full"
                  >
                    Fazer Nova Triagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto">Nome da Criança *</Label>
                    <Input
                      id="nomeCompleto"
                      placeholder="Nome completo da criança..."
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                    />
                    {errors.nomeCompleto && (
                      <p className="text-sm text-red-600">{errors.nomeCompleto}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade da Criança *</Label>
                    <Input
                      id="idade"
                      type="number"
                      min="0"
                      max="14"
                      placeholder="Idade em anos completos"
                      value={formData.idade || ''}
                      onChange={(e) => handleInputChange('idade', parseInt(e.target.value) || 0)}
                    />
                    {errors.idade && (
                      <p className="text-sm text-red-600">{errors.idade}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sintomas">Sintomas e Queixas *</Label>
                    <Textarea
                      id="sintomas"
                      rows={4}
                      placeholder="Descreva detalhadamente os sintomas, há quanto tempo começaram, intensidade da febre (se houver), se a criança está conseguindo se alimentar, etc..."
                      value={formData.sintomas}
                      onChange={(e) => handleInputChange('sintomas', e.target.value)}
                    />
                    {errors.sintomas && (
                      <p className="text-sm text-red-600">{errors.sintomas}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      💡 Exemplos: "Febre de 39° há 2 dias", "Vômito frequente desde ontem", 
                      "Dificuldade para respirar", "Queda e batida na cabeça"
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={carregando}
                  >
                    {carregando ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Stethoscope className="w-4 h-4 mr-2" />
                    )}
                    {carregando ? 'Analisando...' : 'Analisar com IA'}
                  </Button>

                  <div className="text-xs text-center text-gray-500">
                    <Brain className="h-3 w-3 inline mr-1" />
                    Usamos inteligência artificial para melhor avaliação dos sintomas
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Visualização da Fila e Informações */}
          <div className="space-y-6">
            {/* Fila Atual */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Fila de Atendimento
                  </span>
                  <Button 
                    onClick={() => refetchFila()}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Atualizar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filaLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                    </div>
                  ) : fila.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhum paciente na fila no momento</p>
                    </div>
                  ) : (
                    fila.slice(0, 6).map((senha, index) => (
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
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTempoEspera(senha.tempoEspera || 0)} de espera
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Posição #{index + 1}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {fila.length > 6 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">
                        +{fila.length - 6} pacientes na fila
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Importantes */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span>Tempo médio de espera: <strong>{estatisticas.tempoMedioEspera || 0} minutos</strong></span>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-red-100 p-1 rounded mr-2">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    </div>
                    <span><strong>Casos muito urgentes</strong> são atendidos imediatamente</span>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-1 rounded mr-2">
                      <Users className="h-3 w-3 text-green-500" />
                    </div>
                    <span>Traga documento de identificação se tiver</span>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-1 rounded mr-2">
                      <Stethoscope className="h-3 w-3 text-orange-500" />
                    </div>
                    <span>Esta triagem não substitui avaliação médica</span>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Brain className="h-3 w-3 text-purple-500" />
                    </div>
                    <span>Sistema utiliza IA para análise prelimar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>Hospital Central de Maputo • Sector de Pediatria</p>
          <p>Sistema de Triagem Inteligente • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}