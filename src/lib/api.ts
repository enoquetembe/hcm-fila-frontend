import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'
import { Paciente, DashboardStats, FilaResumo } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
    const response = await api.post('/senhas', data)
    return response.data
  },

  chamarProximo: async () => {
    const response = await api.post('/senhas/chamar-proximo')
    return response.data
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/senhas/${id}/status`, { status })
    return response.data
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