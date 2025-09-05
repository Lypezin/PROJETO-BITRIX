# Dashboard Bitrix24 - EntreGÔ

Dashboard de performance de contatos com integração ao Bitrix24 para a EntreGÔ.

## 🚀 Funcionalidades

- **Dashboard em Tempo Real**: Visualização de métricas de performance atualizadas automaticamente
- **Filtros Avançados**: Filtros por data e responsável
- **Exportação Excel**: Exportação de dados filtrados
- **Integração Segura**: Comunicação segura com API do Bitrix24 via proxy
- **Interface Moderna**: UI responsiva com TailwindCSS e Shadcn/ui

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Bitrix24 com acesso à API REST
- Conta no Vercel (para deploy)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd bitrix-dashboard
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite o arquivo .env.local com sua URL do webhook
BITRIX_WEBHOOK_URL=https://seu-dominio.bitrix24.com.br/rest/ID/USUARIO/
```

4. **Execute o setup inicial (opcional)**
```bash
# Para descobrir IDs automaticamente
npm run setup
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🔧 Configuração

### 1. Configuração do Bitrix24

1. Acesse seu Bitrix24
2. Vá em **Configurações** > **Desenvolvimento** > **Outros** > **Webhooks**
3. Crie um novo webhook com as permissões:
   - `crm.contact.list`
   - `crm.contact.fields`
   - `user.search`
   - `batch`
4. Copie a URL do webhook para a variável `BITRIX_WEBHOOK_URL`

### 2. Configuração dos IDs

O sistema precisa dos IDs dos responsáveis e campos personalizados. Você pode:

**Opção A: Descoberta Automática**
```bash
npm run setup
```

**Opção B: Configuração Manual**
Edite o arquivo `src/config/bitrix.ts` com os IDs corretos:

```typescript
export const RESPONSIBLE_USERS = {
  'Carolini Braguini': 4984,  // Substitua pelo ID real
  'Melissa': 4986,            // Substitua pelo ID real
  // ... outros usuários
};

export const CUSTOM_FIELDS = {
  DATA_ENVIO: 'UF_CRM_1659459001630',      // Data de Envio
  DATA_LIBERACAO: 'UF_CRM_1669498023605',  // Data de Liberação*
  STATUS: 'UF_CRM_1659459407558',          // Status
};
```

## 🚀 Deploy no Vercel

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente**:
   - `BITRIX_WEBHOOK_URL`: URL do seu webhook do Bitrix24
3. **Deploy automático** será feito a cada push

### Configuração de Variáveis no Vercel

```bash
# Via CLI do Vercel
vercel env add BITRIX_WEBHOOK_URL
# Cole a URL do webhook quando solicitado
```

## 📊 Como Usar

### Dashboard Principal (`/`)
- Visualiza métricas em tempo real
- Atualização automática a cada 30 segundos
- Cards individuais para cada responsável
- Taxa de liberação calculada automaticamente

### Página de Admin (`/admin`)
- **Filtros de Data**: Selecione períodos específicos
- **Filtros de Responsável**: Filtre por pessoa responsável
- **Exportação**: Baixe dados em Excel
- **Presets Rápidos**: Hoje, ontem, últimos 7/30 dias

## 🔍 Regras de Negócio

### Contagem de Dados
- **Enviados**: Baseado no campo "Data de Envio" (não na data de criação)
- **Liberados**: Baseado no campo "Data de Liberação*"
- **Filtros**: Aplicados diretamente no Bitrix24 (não no frontend)

### Otimizações
- **Dashboard**: Usa batch requests para máxima performance
- **Exportação**: Paginação automática para grandes volumes
- **Formato de Data**: DD/MM/YYYY HH:MM:SS para compatibilidade

## 🛠️ Desenvolvimento

### Estrutura do Projeto
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Serviços de API
├── store/         # Gerenciamento de estado (Zustand)
├── hooks/         # Hooks personalizados
├── config/        # Configurações
└── utils/         # Utilitários
```

### Scripts Disponíveis
```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Linting
npm run setup      # Setup inicial (descoberta de IDs)
```

## 🔒 Segurança

- Webhook URL armazenada como variável de ambiente
- Comunicação via proxy serverless (não exposta no frontend)
- Validação de dados no servidor
- Timeout de 30 segundos para evitar travamentos

## 🐛 Troubleshooting

### Erro de Conexão
1. Verifique se a URL do webhook está correta
2. Confirme as permissões do webhook no Bitrix24
3. Teste a conexão: `npm run setup`

### Dados Não Aparecem
1. Verifique os IDs dos responsáveis
2. Confirme os campos personalizados
3. Verifique se há dados no período selecionado

### Exportação Falha
1. Verifique se há dados para o período
2. Confirme as permissões do webhook
3. Tente com um período menor

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Execute `npm run setup` para diagnóstico
3. Consulte a documentação do Bitrix24

## 📝 Changelog

### v1.0.0
- Dashboard inicial com métricas de performance
- Integração completa com Bitrix24
- Sistema de filtros e exportação
- Interface responsiva e moderna
