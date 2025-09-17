import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'
import { Paciente, DashboardStats, FilaResumo } from '@/types'
import { queryClient } from './query-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000, // Reduzido para 5 segundos
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Função para invalidar caches de fila
export const invalidarCacheFila = () => {
  queryClient.invalidateQueries({ queryKey: ['fila-atual'] })
  queryClient.invalidateQueries({ queryKey: ['fila-resumo'] })
  queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  queryClient.invalidateQueries({ queryKey: ['fila-paciente'] })
}

// Funções para atualização otimista
export const atualizacaoOtimista = {
  // Atualizar a fila após criar senha
  atualizarFilaAposCriarSenha: (novaSenha: any) => {
    // Atualizar fila-atual
    queryClient.setQueryData(['fila-atual'], (oldData: any) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        fila: [novaSenha, ...oldData.fila],
        estatisticas: {
          ...oldData.estatisticas,
          senhasAguardando: oldData.estatisticas.senhasAguardando + 1,
          senhasPorPrioridade: {
            ...oldData.estatisticas.senhasPorPrioridade,
            [novaSenha.prioridade]: (oldData.estatisticas.senhasPorPrioridade[novaSenha.prioridade] || 0) + 1
          }
        }
      }
    })
    
    // Atualizar fila-resumo
    queryClient.setQueryData(['fila-resumo'], (oldData: any) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        fila: [{
          id: novaSenha.id,
          codigo: novaSenha.codigo,
          prioridade: novaSenha.prioridade,
          status: novaSenha.status,
          posicao: 1, // Sempre no topo
          paciente: {
            nome: novaSenha.paciente.nomeCompleto,
            idade: novaSenha.paciente.idade,
            identificacao: novaSenha.paciente.numeroIdentificacao
          },
          tempoEspera: 0,
          emitidaEm: novaSenha.emitidaEm
        }, ...oldData.fila],
        totalNaFila: oldData.totalNaFila + 1
      }
    })

    // Atualizar dashboard stats
    queryClient.setQueryData(['dashboard-stats'], (oldData: any) => {
      if (!oldData) return oldData
      return {
        stats: {
          ...oldData.stats,
          senhasHoje: {
            ...oldData.stats.senhasHoje,
            total: oldData.stats.senhasHoje.total + 1
          },
          prioridades: {
            ...oldData.stats.prioridades,
            [novaSenha.prioridade]: (oldData.stats.prioridades[novaSenha.prioridade] || 0) + 1
          },
          filaAtual: {
            ...oldData.stats.filaAtual,
            aguardando: oldData.stats.filaAtual.aguardando + 1
          }
        }
      }
    })
  },

  // Atualizar após mudar status
  atualizarFilaAposMudancaStatus: (senhaId: string, novoStatus: string, senhaOriginal?: any) => {
    // Atualizar fila-atual
    queryClient.setQueryData(['fila-atual'], (oldData: any) => {
      if (!oldData) return oldData
      
      if (['ATENDIDO', 'CANCELADO', 'NAO_COMPARECEU'].includes(novoStatus)) {
        // Remover da fila se foi finalizado
        const senhaRemovida = oldData.fila.find((s: any) => s.id === senhaId)
        return {
          ...oldData,
          fila: oldData.fila.filter((senha: any) => senha.id !== senhaId),
          estatisticas: {
            ...oldData.estatisticas,
            senhasAguardando: Math.max(0, oldData.estatisticas.senhasAguardando - 1),
            senhasPorPrioridade: senhaRemovida ? {
              ...oldData.estatisticas.senhasPorPrioridade,
              [senhaRemovida.prioridade]: Math.max(0, (oldData.estatisticas.senhasPorPrioridade[senhaRemovida.prioridade] || 0) - 1)
            } : oldData.estatisticas.senhasPorPrioridade
          }
        }
      } else {
        // Apenas atualizar status
        return {
          ...oldData,
          fila: oldData.fila.map((senha: any) => 
            senha.id === senhaId 
              ? { ...senha, status: novoStatus }
              : senha
          )
        }
      }
    })

    // Atualizar fila-resumo
    queryClient.setQueryData(['fila-resumo'], (oldData: any) => {
      if (!oldData) return oldData
      
      if (['ATENDIDO', 'CANCELADO', 'NAO_COMPARECEU'].includes(novoStatus)) {
        // Remover da fila se foi finalizado
        return {
          ...oldData,
          fila: oldData.fila.filter((senha: any) => senha.id !== senhaId),
          totalNaFila: Math.max(0, oldData.totalNaFila - 1)
        }
      } else {
        // Apenas atualizar status
        return {
          ...oldData,
          fila: oldData.fila.map((senha: any) => 
            senha.id === senhaId 
              ? { ...senha, status: novoStatus }
              : senha
          )
        }
      }
    })

    // Atualizar dashboard stats se for finalização
    if (['ATENDIDO', 'CANCELADO', 'NAO_COMPARECEU'].includes(novoStatus)) {
      queryClient.setQueryData(['dashboard-stats'], (oldData: any) => {
        if (!oldData) return oldData
        return {
          stats: {
            ...oldData.stats,
            filaAtual: {
              ...oldData.stats.filaAtual,
              aguardando: Math.max(0, oldData.stats.filaAtual.aguardando - 1)
            },
            atendimentos: {
              ...oldData.stats.atendimentos,
              finalizados: novoStatus === 'ATENDIDO' 
                ? oldData.stats.atendimentos.finalizados + 1 
                : oldData.stats.atendimentos.finalizados
            }
          }
        }
      })
    }
  }
}

// API Functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const pacienteAPI = {
  list: async (params?: {
    nome?: string
    numeroIdentificacao?: string
    idade?: number
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/pacientes', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/pacientes/${id}`)
    return response.data
  },

  create: async (data: Omit<Paciente, 'id' | 'ativo' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/pacientes', data)
    return response.data
  },

  update: async (id: string, data: Partial<Paciente>) => {
    const response = await api.put(`/pacientes/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/pacientes/${id}`)
    return response.data
  },
}

export const senhaAPI = {
  getFilaAtual: async () => {
    const response = await api.get('/senhas/fila')
    return response.data
  },

  create: async (data: {
    pacienteId: string
    sintomas: string
    prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
  }) => {
    // Primeiro faz a atualização otimista
    const senhaOtimista = {
      id: 'temp-' + Date.now(),
      codigo: 'GERANDO...',
      prioridade: data.prioridade,
      sintomas: data.sintomas,
      status: 'AGUARDANDO',
      paciente: {
        id: data.pacienteId,
        nomeCompleto: 'Carregando...',
        idade: 0,
        numeroIdentificacao: ''
      },
      emitidaEm: new Date().toISOString(),
      posicaoFila: 1
    }
    
    atualizacaoOtimista.atualizarFilaAposCriarSenha(senhaOtimista)
    
    // Depois faz a chamada real
    try {
      const response = await api.post('/senhas', data)
      // Invalidar caches para garantir sincronização
      setTimeout(() => invalidarCacheFila(), 1000)
      return response.data
    } catch (error) {
      // Em caso de erro, reverter a atualização otimista
      invalidarCacheFila()
      throw error
    }
  },

  chamarProximo: async () => {
    const response = await api.post('/senhas/chamar-proximo')
    invalidarCacheFila()
    return response.data
  },

  updateStatus: async (id: string, status: string) => {
    // Guardar dados atuais para possível rollback
    const oldFilaAtual = queryClient.getQueryData(['fila-atual'])
    const oldFilaResumo = queryClient.getQueryData(['fila-resumo'])
    
    // Atualização otimista imediata
    atualizacaoOtimista.atualizarFilaAposMudancaStatus(id, status)
    
    try {
      // Chamada API
      const response = await api.put(`/senhas/${id}/status`, { status })
      
      // Invalidar para sincronizar com backend após breve delay
      setTimeout(() => invalidarCacheFila(), 1500)
      
      return response.data
    } catch (error) {
      // Reverter em caso de erro
      queryClient.setQueryData(['fila-atual'], oldFilaAtual)
      queryClient.setQueryData(['fila-resumo'], oldFilaResumo)
      throw error
    }
  },
}

export const dashboardAPI = {
  getStats: async (): Promise<{ stats: DashboardStats }> => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  getFilaResumo: async (): Promise<FilaResumo> => {
    const response = await api.get('/dashboard/fila-resumo')
    return response.data
  },
}

export const relatorioAPI = {
  gerar: async (filtros: any) => {
    const response = await api.post('/relatorios/gerar', filtros)
    return response.data
  },

  listar: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/relatorios', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/relatorios/${id}`)
    return response.data
  },

  download: async (id: string, formato: string) => {
    const response = await api.get(`/relatorios/${id}/download?formato=${formato}`, {
      responseType: 'blob'
    })
    return response.data
  }
}