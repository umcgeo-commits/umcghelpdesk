# Guia de Configuração - Evolution API WhatsApp

## 📋 Visão Geral

A [Evolution API](https://github.com/evolution-foundation/evolution-api) é um middleware open-source que permite integrar o WhatsApp Business a sistemas externos. Ela transforma o WhatsApp em endpoints REST, permitindo enviar e receber mensagens programaticamente.

## 🔧 Métodos de Instalação

### Opção 1: Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/evolution-foundation/evolution-api.git
cd evolution-api

# 2. Copie o arquivo de exemplo
cp .env.example .env

# 3. Edite o .env com suas configurações
nano .env
```

#### Configuração do `.env`:

```env
# ========== SERVIDOR ==========
SERVER_PORT=8080

# ========== BANCO DE DADOS ==========
DATABASE_ENABLED=true
DATABASE_CONNECTION_URI=postgresql://user:password@localhost:5432/evolution
# ou MySQL:
# DATABASE_CONNECTION_URI=mysql://user:password@localhost:3306/evolution

# ========== REDIS (Cache) ==========
REDIS_ENABLED=true
REDIS_URI=redis://localhost:6379

# ========== AUTENTICAÇÃO ==========
AUTHENTICATION_API_KEY=SUA_CHAVE_API_AQUI
# Gere uma chave segura: openssl rand -hex 32

# ========== INSTÂNCIA PADRÃO ==========
DEFAULT_INSTANCE_NAME=helpdesk
```

```bash
# 4. Execute com Docker Compose
docker-compose up -d
```

### Opção 2: Servidor VPS Manual

```bash
# Requisitos: Node.js 18+, PostgreSQL/MySQL, Redis

# 1. Clone e instale dependências
git clone https://github.com/evolution-foundation/evolution-api.git
cd evolution-api
npm install

# 2. Configure o .env (mesmo acima)

# 3. Inicie o servidor
npm run start
```

## 🚀 Conectando uma Instância do WhatsApp

### Via API:

```bash
# 1. Criar uma instância
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: SUA_CHAVE_API" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "helpdesk",
    "qrcode": true
  }'

# 2. Obter QR Code (escaneie com o WhatsApp)
curl http://localhost:8080/instance/qrcode/helpdesk \
  -H "apikey: SUA_CHAVE_API"

# 3. Verificar status da conexão
curl http://localhost:8080/instance/status/helpdesk \
  -H "apikey: SUA_CHAVE_API"
```

### Via Interface Web:
- Acesse `http://localhost:8080/manager`
- Crie uma nova instância
- Escaneie o QR Code com o WhatsApp

## 🔌 Enviar Mensagens

```bash
curl -X POST http://localhost:8080/message/sendText/helpdesk \
  -H "apikey: SUA_CHAVE_API" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Seu chamado foi atualizado."
  }'
```

## 📡 Webhooks (Eventos em Tempo Real)

Configure no `.env` para receber notificações quando mensagens chegarem:

```env
WEBHOOK_ENABLED=true
WEBHOOK_URL=https://seu-dominio.com/api/whatsapp-webhook
WEBHOOK_EVENTS=RECEIVED_MESSAGE,STATUS_INSTANCE
```

## 🔗 Integração com o HelpDesk

### Variáveis de Ambiente Necessárias:

Adicione estas variáveis no menu **Keys/API keys** do Freebuff:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `EVOLUTION_API_URL` | URL da sua instância | `https://evo.seudominio.com` |
| `EVOLUTION_API_KEY` | Chave de API | `abc123...` |
| `EVOLUTION_INSTANCE_NAME` | Nome da instância | `helpdesk` (padrão) |

### Testando a Integração:

1. Após configurar as env vars, crie um chamado com número de WhatsApp
2. O sistema tentará enviar uma notificação via WhatsApp
3. Acompanhe os logs em: `src/convex/whatsapp.ts`

## ✅ Checklist de Configuração

- [ ] Evolution API rodando (Docker/VPS)
- [ ] Banco de dados PostgreSQL/MySQL configurado
- [ ] Redis configurado
- [ ] Instância do WhatsApp conectada (QR Code escaneado)
- [ ] `EVOLUTION_API_URL` configurada no Freebuff
- [ ] `EVOLUTION_API_KEY` configurada no Freebuff
- [ ] Teste de envio de mensagem bem-sucedido

## 🆘 Suporte

- **Documentação Oficial**: https://docs.evolutionfoundation.com.br/evolution-api
- **GitHub**: https://github.com/evolution-foundation/evolution-api
- **Comunidade**: https://t.me/evolution_apibot
