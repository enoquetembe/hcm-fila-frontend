import { api } from "@/lib/api"

// src/types/index.ts
export interface Usuario {
  id: string
  nome: string
  email: string
  role: 'ADMIN' | 'MEDICO' | 'ENFERMEIRO' | 'RECEPCIONIST'
  ativo: boolean
  createdAt: string
}

export interface Paciente {
  id: string
  nomeCompleto: string
  numeroIdentificacao?: string
  idade: number
  dataNascimento?: string
  telefone?: string
  endereco?: string
  responsavel?: string
  telefoneResponsavel?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface Senha {
  id: string
  codigo: string
  prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
  sintomas: string
  status: 'AGUARDANDO' | 'CHAMANDO' | 'EM_ATENDIMENTO' | 'ATENDIDO' | 'CANCELADO' | 'NAO_COMPARECEU'
  posicaoFila?: number
  tempoEspera?: number
  emitidaEm: string
  iniciadaEm?: string
  finalizadaEm?: string
  paciente: {
    id: string
    nomeCompleto: string
    idade: number
    numeroIdentificacao: string
  }
}

export interface DashboardStats {
  senhasHoje: {
    total: number
    crescimento: string
  }
  prioridades: {
    MUITO_URGENTE: number
    URGENTE: number
    POUCO_URGENTE: number
  }
  filaAtual: {
    aguardando: number
    emAtendimento: number
  }
  atendimentos: {
    finalizados: number
    pacientesUnicos: number
  }
  tempoMedio: {
    espera: number
    unidade: string
  }
  proximoPaciente?: {
    nome: string
    codigo: string
    idade: number
    tempoAtendimento: number
  }
}

export interface FilaResumo {
  fila: Array<{
    id: string
    codigo: string
    prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
    status: string
    posicao: number
    paciente: {
      nome: string
      idade: number
      identificacao: string
    }
    tempoEspera: number
    emitidaEm: string
  }>
  totalNaFila: number
}


