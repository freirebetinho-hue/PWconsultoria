# SST + SGA Kallas Chatbot

Chatbot operacional de SST + SGA para o Grupo Kallas, com atendimento em estilo WhatsApp, análise automática de imagem e integração server-side com a API do Gemini.

## Recursos

- Prompt-mestre SST + SGA v80.0 embutido no servidor.
- Chave Gemini lida automaticamente do ambiente, sem campo de chave na interface.
- Banco local automático em `data/chat-history.jsonl` para registrar conversas.
- Endpoint de saúde com IPs da máquina para facilitar acesso na rede.
- Fallback operacional quando a chave Gemini ainda não estiver configurada.

## Como configurar

```bash
cp .env.example .env
# edite .env e informe GEMINI_API_KEY
```

Também é possível configurar `GEMINI_API_KEY`, `GOOGLE_API_KEY` ou `GOOGLE_GENERATIVE_AI_API_KEY` diretamente no ambiente do servidor.

## Como rodar e obter o IP

```bash
npm start
```

Ao iniciar, o servidor imprime os endereços:

- `Local: http://localhost:3000`
- `Rede: http://<IP_DA_MAQUINA>:3000`

A tela do chatbot também mostra o primeiro IP detectado pelo endpoint `/api/health`.

## Testes

```bash
npm test
```
