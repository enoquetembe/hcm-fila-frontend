'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  RefreshCw,
  Users,
  Bell,
  Clock,
  Shield,
  Database,
  Mail,
  MessageSquare,
  Volume2,
  Monitor,
  Palette,
  Languages
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

interface ConfiguracoesSistema {
  // Geral
  nomeHospital: string
  tempoMaximoAtendimento: number
  tempoRefreshFila: number
  idioma: string
  tema: string
  
  // Notificações
  notificacoesAudio: boolean
  notificacoesPopup: boolean
  volumeNotificacao: number
  somPrioridadeAlta: string
  
  // Segurança
  timeoutSessao: number
  tentativasLogin: number
  complexidadeSenha: string
  doisFatores: boolean
  
  // Backup
  autoBackup: boolean
  intervaloBackup: number
  manterBackups: number
  backupCloud: boolean
  
  // Email
  servidorSMTP: string
  portaSMTP: number
  emailSistema: string
  sslSMTP: boolean
}

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSistema>({
    // Valores padrão
    nomeHospital: 'Hospital Central de Maputo',
    tempoMaximoAtendimento: 30,
    tempoRefreshFila: 15,
    idioma: 'pt',
    tema: 'light',
    
    notificacoesAudio: true,
    notificacoesPopup: true,
    volumeNotificacao: 80,
    somPrioridadeAlta: 'alerta1',
    
    timeoutSessao: 30,
    tentativasLogin: 3,
    complexidadeSenha: 'media',
    doisFatores: false,
    
    autoBackup: true,
    intervaloBackup: 24,
    manterBackups: 30,
    backupCloud: false,
    
    servidorSMTP: 'smtp.hcm.mz',
    portaSMTP: 587,
    emailSistema: 'sistema@hcm.mz',
    sslSMTP: true
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Simular carregamento das configurações
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Aqui você faria a chamada API para buscar as configurações
      // setConfiguracoes(dadosDaApi)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    // Simular salvamento
    setTimeout(() => {
      setIsSaving(false)
      alert('Configurações salvas com sucesso!')
    }, 1500)
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setConfiguracoes({
        nomeHospital: 'Hospital Central de Maputo',
        tempoMaximoAtendimento: 30,
        tempoRefreshFila: 15,
        idioma: 'pt',
        tema: 'light',
        notificacoesAudio: true,
        notificacoesPopup: true,
        volumeNotificacao: 80,
        somPrioridadeAlta: 'alerta1',
        timeoutSessao: 30,
        tentativasLogin: 3,
        complexidadeSenha: 'media',
        doisFatores: false,
        autoBackup: true,
        intervaloBackup: 24,
        manterBackups: 30,
        backupCloud: false,
        servidorSMTP: 'smtp.hcm.mz',
        portaSMTP: 587,
        emailSistema: 'sistema@hcm.mz',
        sslSMTP: true
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          </main>
        </div>
      </div>
    )
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
                <Settings className="h-8 w-8 mr-3 text-green-600" />
                Configurações do Sistema
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie as configurações e preferências do sistema
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </div>

          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList>
              <TabsTrigger value="geral">
                <Settings className="h-4 w-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="notificacoes">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="seguranca">
                <Shield className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="backup">
                <Database className="h-4 w-4 mr-2" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* ABA GERAL */}
            <TabsContent value="geral">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="h-5 w-5 mr-2" />
                      Configurações Gerais
                    </CardTitle>
                    <CardDescription>
                      Configurações básicas do sistema e aparência
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeHospital">Nome do Hospital</Label>
                      <Input
                        id="nomeHospital"
                        value={configuracoes.nomeHospital}
                        onChange={(e) => setConfiguracoes({...configuracoes, nomeHospital: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempoMaximoAtendimento">
                        Tempo Máximo de Atendimento (minutos)
                      </Label>
                      <Input
                        id="tempoMaximoAtendimento"
                        type="number"
                        min="5"
                        max="120"
                        value={configuracoes.tempoMaximoAtendimento}
                        onChange={(e) => setConfiguracoes({...configuracoes, tempoMaximoAtendimento: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempoRefreshFila">
                        Tempo de Refresh da Fila (segundos)
                      </Label>
                      <Input
                        id="tempoRefreshFila"
                        type="number"
                        min="5"
                        max="60"
                        value={configuracoes.tempoRefreshFila}
                        onChange={(e) => setConfiguracoes({...configuracoes, tempoRefreshFila: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idioma">Idioma do Sistema</Label>
                      <Select
                        value={configuracoes.idioma}
                        onValueChange={(value) => setConfiguracoes({...configuracoes, idioma: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tema">Tema de Interface</Label>
                      <Select
                        value={configuracoes.tema}
                        onValueChange={(value) => setConfiguracoes({...configuracoes, tema: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Informações do Sistema
                    </CardTitle>
                    <CardDescription>
                      Status e informações técnicas do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">1.2.4</div>
                        <p className="text-sm text-blue-600">Versão</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Online</div>
                        <p className="text-sm text-green-600">Status</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Uso de Recursos</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Memória</span>
                          <span className="font-medium">62%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '62%'}}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Armazenamento</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Verificar Atualizações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ABA NOTIFICAÇÕES */}
            <TabsContent value="notificacoes">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Configurações de Notificação
                    </CardTitle>
                    <CardDescription>
                      Gerencie como receber notificações do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações de Áudio</Label>
                        <p className="text-sm text-gray-500">
                          Sons de alerta para chamadas de senha
                        </p>
                      </div>
                      <Switch
                        checked={configuracoes.notificacoesAudio}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, notificacoesAudio: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações Popup</Label>
                        <p className="text-sm text-gray-500">
                          Alertas visuais na tela
                        </p>
                      </div>
                      <Switch
                        checked={configuracoes.notificacoesPopup}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, notificacoesPopup: checked})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Volume das Notificações</Label>
                      <div className="flex items-center space-x-3">
                        <Volume2 className="h-4 w-4 text-gray-500" />
                        <Slider
                          value={[configuracoes.volumeNotificacao]}
                          onValueChange={([value]) => setConfiguracoes({...configuracoes, volumeNotificacao: value})}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-12 text-sm text-gray-500">
                          {configuracoes.volumeNotificacao}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="somPrioridadeAlta">Som para Prioridade Alta</Label>
                      <Select
                        value={configuracoes.somPrioridadeAlta}
                        onValueChange={(value) => setConfiguracoes({...configuracoes, somPrioridadeAlta: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alerta1">Alerta 1</SelectItem>
                          <SelectItem value="alerta2">Alerta 2</SelectItem>
                          <SelectItem value="alerta3">Alerta 3</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Teste de Notificações
                    </CardTitle>
                    <CardDescription>
                      Teste as configurações de notificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Preview de Notificação</h4>
                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-red-500">A001</Badge>
                          <span className="font-medium">João Silva</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Paciente chamado para atendimento - Muito Urgente
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline">
                        <Bell className="h-4 w-4 mr-2" />
                        Testar Som
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Testar Popup
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Histórico de Testes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Último teste de áudio</span>
                          <span className="text-gray-500">Há 2 minutos</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Último teste de popup</span>
                          <span className="text-gray-500">Há 5 minutos</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ABA SEGURANÇA */}
            <TabsContent value="seguranca">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Configurações de Segurança
                    </CardTitle>
                    <CardDescription>
                      Configure as políticas de segurança do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeoutSessao">
                        Timeout de Sessão (minutos)
                      </Label>
                      <Input
                        id="timeoutSessao"
                        type="number"
                        min="5"
                        max="240"
                        value={configuracoes.timeoutSessao}
                        onChange={(e) => setConfiguracoes({...configuracoes, timeoutSessao: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tentativasLogin">
                        Tentativas de Login Permitidas
                      </Label>
                      <Input
                        id="tentativasLogin"
                        type="number"
                        min="1"
                        max="10"
                        value={configuracoes.tentativasLogin}
                        onChange={(e) => setConfiguracoes({...configuracoes, tentativasLogin: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complexidadeSenha">
                        Complexidade de Senha
                      </Label>
                      <Select
                        value={configuracoes.complexidadeSenha}
                        onValueChange={(value) => setConfiguracoes({...configuracoes, complexidadeSenha: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa (4+ caracteres)</SelectItem>
                          <SelectItem value="media">Média (6+ caracteres, números)</SelectItem>
                          <SelectItem value="alta">Alta (8+ caracteres, números, símbolos)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação em Dois Fatores</Label>
                        <p className="text-sm text-gray-500">
                          Requer código adicional para login
                        </p>
                      </div>
                      <Switch
                        checked={configuracoes.doisFatores}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, doisFatores: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Logs de Segurança
                    </CardTitle>
                    <CardDescription>
                      Monitoramento e auditoria de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Atividade Recente</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Último login bem-sucedido</span>
                          <span className="text-green-600">Há 15 minutos</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tentativas falhas</span>
                          <span className="text-red-600">0 nas últimas 24h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Logs de auditoria</span>
                          <span className="text-blue-600">1.247 registros</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Ver Logs
                      </Button>
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Exportar Logs
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Auditoria do Sistema</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Usuários ativos</span>
                          <Badge variant="secondary">12</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Sessões ativas</span>
                          <Badge variant="secondary">8</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Última auditoria</span>
                          <span className="text-gray-500">Hoje, 09:30</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ABA BACKUP */}
            <TabsContent value="backup">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Configurações de Backup
                    </CardTitle>
                    <CardDescription>
                      Configure o backup automático dos dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Backup Automático</Label>
                        <p className="text-sm text-gray-500">
                          Realizar backups automaticamente
                        </p>
                      </div>
                      <Switch
                        checked={configuracoes.autoBackup}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, autoBackup: checked})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="intervaloBackup">
                        Intervalo de Backup (horas)
                      </Label>
                      <Input
                        id="intervaloBackup"
                        type="number"
                        min="1"
                        max="168"
                        value={configuracoes.intervaloBackup}
                        onChange={(e) => setConfiguracoes({...configuracoes, intervaloBackup: parseInt(e.target.value)})}
                        disabled={!configuracoes.autoBackup}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manterBackups">
                        Manter Backups (dias)
                      </Label>
                      <Input
                        id="manterBackups"
                        type="number"
                        min="1"
                        max="365"
                        value={configuracoes.manterBackups}
                        onChange={(e) => setConfiguracoes({...configuracoes, manterBackups: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Backup em Nuvem</Label>
                        <p className="text-sm text-gray-500">
                          Sincronizar com cloud storage
                        </p>
                      </div>
                      <Switch
                        checked={configuracoes.backupCloud}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, backupCloud: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Gerenciamento de Backup
                    </CardTitle>
                    <CardDescription>
                      Execute e gerencie backups manuais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Status do Backup</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Último backup</span>
                          <span className="text-green-600">Hoje, 03:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Próximo backup</span>
                          <span className="text-blue-600">Hoje, 15:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tamanho total</span>
                          <span className="text-gray-600">2.4 GB</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Backup Agora
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Backups Disponíveis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>backup_2024_01_15_0300.zip</span>
                          <span className="text-gray-500">2.1 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>backup_2024_01_14_0300.zip</span>
                          <span className="text-gray-500">2.0 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>backup_2024_01_13_0300.zip</span>
                          <span className="text-gray-500">1.9 GB</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ABA EMAIL */}
            <TabsContent value="email">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Configurações de Email
                    </CardTitle>
                    <CardDescription>
                      Configure o servidor de email para notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="servidorSMTP">Servidor SMTP</Label>
                      <Input
                        id="servidorSMTP"
                        value={configuracoes.servidorSMTP}
                        onChange={(e) => setConfiguracoes({...configuracoes, servidorSMTP: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portaSMTP">Porta SMTP</Label>
                      <Input
                        id="portaSMTP"
                        type="number"
                        value={configuracoes.portaSMTP}
                        onChange={(e) => setConfiguracoes({...configuracoes, portaSMTP: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailSistema">Email do Sistema</Label>
                      <Input
                        id="emailSistema"
                        type="email"
                        value={configuracoes.emailSistema}
                        onChange={(e) => setConfiguracoes({...configuracoes, emailSistema: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Conexão SSL/TLS</Label>
                        <p className="text-sm text-gray-500">
                          Usar conexão segura
                        </p>
                      </div>
                      <Switch
                        checked={configuracoes.sslSMTP}
                        onCheckedChange={(checked) => setConfiguracoes({...configuracoes, sslSMTP: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Teste de Email
                    </CardTitle>
                    <CardDescription>
                      Teste as configurações de email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Status da Conexão</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Servidor SMTP</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Conectado
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Autenticação</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Bem-sucedida
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Último teste</span>
                          <span className="text-gray-500">Há 10 minutos</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailTeste">Email para Teste</Label>
                      <Input
                        id="emailTeste"
                        type="email"
                        placeholder="teste@exemplo.com"
                      />
                    </div>

                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email de Teste
                    </Button>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Estatísticas de Email</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">98%</div>
                          <p className="text-gray-600">Taxa de entrega</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">1.2s</div>
                          <p className="text-gray-600">Tempo médio</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}