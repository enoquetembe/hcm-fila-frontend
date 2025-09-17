import { GoogleGenerativeAI } from '@google/generative-ai'


const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY


if (!GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY não está definida')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function analisarSintomasGemini(sintomas: string, idade: number): Promise<{
  prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
  explicacao: string
  recomendacao: string
}> {
  // Se não tiver chave API, use análise local como fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'sua-chave-api-aqui') {
    return analisarSintomasLocal(sintomas, idade)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Você é um assistente médico de triagem pediátrica. Analise os sintomas descritos e classifique a urgência em:
- MUITO_URGENTE: risco de vida, necessidade de atendimento imediato
- URGENTE: necessidade de avaliação rápida mas sem risco imediato  
- POUCO_URGENTE: pode aguardar avaliação sem comprometer a saúde

Idade do paciente: ${idade} anos
Sintomas: ${sintomas}

Responda APENAS com um JSON no formato:
{
  "prioridade": "MUITO_URGENTE" | "URGENTE" | "POUCO_URGENTE",
  "explicacao": "explicação médica breve da classificação",
  "recomendacao": "recomendação específica para este caso"
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        prioridade: parsed.prioridade,
        explicacao: parsed.explicacao,
        recomendacao: parsed.recomendacao
      }
    }

    throw new Error('Resposta do Gemini não contém JSON válido')

  } catch (error) {
    console.error('Erro ao consultar Gemini:', error)
    // Fallback para análise local em caso de erro
    return analisarSintomasLocal(sintomas, idade)
  }
}

// Função de fallback para análise local
function analisarSintomasLocal(sintomas: string, idade: number): {
  prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE'
  explicacao: string
  recomendacao: string
} {
  const sintomasLower = sintomas.toLowerCase()
  
  const muitoUrgenteKeywords = [
    'dificuldade respiratória', 'respirar', 'falta de ar', 'cianose', 'azulado',
    'convulsão', 'convulsivo', 'desmaio', 'inconsciente', 'coma',
    'trauma grave', 'acidente', 'queimadura grave', 'hemorragia', 'sangramento intenso',
    'febre alta', '40°', '41°', '42°', 'hipertermia',
    'desidratação severa', 'sem urinar', 'chorar sem lágrimas', 'moleira funda',
    'dor intensa', 'gritando de dor', 'não para de chorar'
  ]

  const urgenteKeywords = [
    'febre', '38°', '39°', 'vômito', 'diarreia', 'desidratação',
    'dor abdominal', 'barriga inchada', 'dor de ouvido', 'otite',
    'tosse persistente', 'chiado no peito', 'sibilância',
    'erupção cutânea', 'manchas na pele', 'alergia severa',
    'queda', 'batida na cabeça', 'trauma moderado'
  ]

  let prioridade: 'MUITO_URGENTE' | 'URGENTE' | 'POUCO_URGENTE' = 'POUCO_URGENTE'
  let explicacao = ''
  let recomendacao = ''

  if (muitoUrgenteKeywords.some(keyword => sintomasLower.includes(keyword))) {
    prioridade = 'MUITO_URGENTE'
    explicacao = 'Sintomas indicam possível emergência médica que requer atenção imediata'
    recomendacao = 'Procure imediatamente a recepção para atendimento prioritário'
  } else if (urgenteKeywords.some(keyword => sintomasLower.includes(keyword))) {
    prioridade = 'URGENTE'
    explicacao = 'Sintomas indicam necessidade de avaliação médica em breve'
    recomendacao = 'Aguarde na sala de espera, seu caso será atendido prioritariamente'
  } else {
    prioridade = 'POUCO_URGENTE'
    explicacao = 'Sintomas indicam caso de baixa urgência que pode aguardar avaliação'
    recomendacao = 'Pode aguardar com tranquilidade na sala de espera'
  }

  return { prioridade, explicacao, recomendacao }
}