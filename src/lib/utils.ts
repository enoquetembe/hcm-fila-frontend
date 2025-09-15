import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"




export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy HH:mm") {
  return format(new Date(date), pattern, { locale: ptBR })
}

export function formatTimeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true, 
    locale: ptBR 
  })
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'MUITO_URGENTE':
      return 'bg-red-500 hover:bg-red-600 text-white'
    case 'URGENTE':
      return 'bg-orange-500 hover:bg-orange-600 text-white'
    case 'POUCO_URGENTE':
      return 'bg-green-500 hover:bg-green-600 text-white'
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white'
  }
}

export function getPriorityText(priority: string) {
  switch (priority) {
    case 'MUITO_URGENTE':
      return 'Muito Urgente'
    case 'URGENTE':
      return 'Urgente'
    case 'POUCO_URGENTE':
      return 'Pouco Urgente'
    default:
      return priority
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'AGUARDANDO':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CHAMANDO':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse-slow'
    case 'EM_ATENDIMENTO':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'ATENDIDO':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'CANCELADO':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'NAO_COMPARECEU':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getStatusText(status: string) {
  switch (status) {
    case 'AGUARDANDO':
      return 'Aguardando'
    case 'CHAMANDO':
      return 'Chamando'
    case 'EM_ATENDIMENTO':
      return 'Em Atendimento'
    case 'ATENDIDO':
      return 'Atendido'
    case 'CANCELADO':
      return 'Cancelado'
    case 'NAO_COMPARECEU':
      return 'Não Compareceu'
    default:
      return status
  }
}

export function formatTempoEspera(minutos: number) {
  if (minutos < 60) {
    return `${minutos} min`
  }
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60
  return `${horas}h ${minutosRestantes}min`
}

