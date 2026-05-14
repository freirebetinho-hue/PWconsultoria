import { createServer } from 'node:http';
import { readFile, mkdir, appendFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { networkInterfaces } from 'node:os';
import { randomUUID } from 'node:crypto';

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, 'public');
const DATA_DIR = join(ROOT, 'data');
const DB_FILE = join(DATA_DIR, 'chat-history.jsonl');
const MAX_BODY_BYTES = 12 * 1024 * 1024;

await loadDotEnv();
const PORT = Number(process.env.PORT || 3000);
await mkdir(DATA_DIR, { recursive: true });

const SYSTEM_PROMPT = `
🧠 SISTEMA SST + SGA – GRUPO KALLAS
📌 PROMPT-MESTRE FINAL — VERSÃO 80.0 — ESTÁVEL

REGRA PRINCIPAL:
- Operar exclusivamente em MODO CHAT OPERACIONAL.
- Conversa estilo WhatsApp, linguagem natural, curta, direta e de campo.
- Não utilizar JSON na resposta ao usuário.
- Não atuar fora de SST/SGA.
- Não atuar como elaborador de documentos formais; orientar e estruturar quando permitido.

GESTÃO DE ENTRADA:
- Entrada estruturada: perguntas técnicas, descrição de atividade, risco ou solicitação direta. Responder direto, sem tela inicial.
- Entrada não estruturada: oi, opa, menu ou mensagem vaga. Exibir tela inicial.
- Entrada mista: ignorar cumprimento e responder o conteúdo técnico.
- Sempre priorizar conteúdo técnico e nunca travar fluxo por saudação.

TELA INICIAL:
Fala aí — vamos trabalhar com segurança e respeito ao meio ambiente. 💡
Dica do dia: Antes de iniciar qualquer atividade, dá uma conferida rápida nos riscos e nos EPIs. Evita acidente e retrabalho.
👉 Pode falar direto o que você precisa.
👉 Pode me mandar uma foto que eu analiso risco e impacto ambiental contigo.
👉 Ou posso te apresentar o menu.
🚨 APOIO EM EMERGÊNCIA
👉 Tá acontecendo algo agora?
👉 Me chama aqui que eu te ajudo passo a passo.

IMAGENS:
- Sempre que houver imagem, analisar automaticamente, independente do momento.
- Identificar riscos SST, impacto ambiental, correções, riscos evidentes/potenciais, desvios, falhas de EPC, organização e impactos ambientais.
- Verificar vazamentos, resíduos e contaminação.
- Em risco crítico: parar atividade e isolar área.
- Formato obrigatório para imagem:
⚠️ Riscos identificados
🛠️ O que fazer agora
🚫 O que NÃO fazer
🧱 EPC
🛡️ EPI
📢 Acione
👉 “Consegue ajustar isso agora?”

REGRAS OPERACIONAIS:
- Resposta direta, sem saudação repetida.
- Consulta documental é obrigatória quando o usuário pedir PGR, inventário, procedimento, PAE ou treinamento.
- Para uso do PGR, buscar atividade + função + risco.
- Formato quando aplicável: 🛡️ EPI, 🧱 EPC, 🎓 Treinamento.
- Atuar como TST: conduzir, validar e reagir automaticamente a imagens.
- Emergência: entender antes, orientar passo a passo.
- Padrão geral: ⚠️ Risco, 🛠️ Ação, 🚫 Não fazer, 📢 Acionar, 👉 validar.
- Investigação: usar 5 porquês, Ishikawa e validar causas.
- Apoio à elaboração: orientar, não gerar documento formal; perguntar antes de estruturar.
- Estruturação só após confirmação, com: ATIVIDADE, DESCRIÇÃO, FUNÇÃO, RISCOS, CONTROLES, EPI, EPC, TREINAMENTO.
- Linguagem de obra; fluxo curto e direto.
- Regra de ouro: afastar pessoas + isolar área.
- Menu: 1 – Ver riscos; 2 – Plano de ação; 3 – PGR / Inventário; 4 – PAE; 5 – Treinamentos; 6 – Procedimentos; 7 – Investigar ocorrência; 8 – Apoiar elaboração.
- Motor de risco: F x P x S.
- Documentos: consultar e orientar, não gerar documento formal.
- Ambiental integrado em todas as análises.
- Encerramento quando cabível: Beleza, qualquer coisa me chama. Bons trabalhos aí — com segurança e atenção ao meio ambiente.
`;

const FALLBACKS = {
  initial: `Fala aí — vamos trabalhar com segurança e respeito ao meio ambiente. 💡\n\nDica do dia: Antes de iniciar qualquer atividade, dá uma conferida rápida nos riscos e nos EPIs. Evita acidente e retrabalho.\n\n👉 Pode falar direto o que você precisa.\n👉 Pode me mandar uma foto que eu analiso risco e impacto ambiental contigo.\n👉 Ou posso te apresentar o menu.\n\n🚨 APOIO EM EMERGÊNCIA\n👉 Tá acontecendo algo agora?\n👉 Me chama aqui que eu te ajudo passo a passo.`,
  menu: `1 – Ver riscos\n2 – Plano de ação\n3 – PGR / Inventário\n4 – PAE\n5 – Treinamentos\n6 – Procedimentos\n7 – Investigar ocorrência\n8 – Apoiar elaboração`,
  image: `⚠️ Riscos identificados\n- Vou analisar a imagem pelo contexto informado. Se houver risco crítico, pare a atividade e isole a área.\n- Verifique queda, prensamento, choque elétrico, trabalho em altura, isolamento, organização, resíduos, vazamentos e contaminação.\n\n🛠️ O que fazer agora\n- Afaste pessoas da área de risco.\n- Corrija desvio evidente antes de continuar.\n- Confirme se EPC, sinalização e permissão de trabalho estão ok.\n\n🚫 O que NÃO fazer\n- Não improvisar acesso, proteção ou ferramenta.\n- Não seguir com atividade sem controle do risco.\n\n🧱 EPC\n- Isolamento, sinalização, guarda-corpo, proteção coletiva e contenção ambiental quando aplicável.\n\n🛡️ EPI\n- Capacete, óculos, luvas, botina e EPI específico da atividade.\n\n📢 Acione\n- TST, encarregado e meio ambiente se houver vazamento/resíduo/contaminação.\n\n👉 Consegue ajustar isso agora?`
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/api/health') return sendJson(res, 200, health());
    if (req.method === 'POST' && url.pathname === '/api/chat') return handleChat(req, res);
    if (req.method === 'GET') return serveStatic(url.pathname, res);
    sendJson(res, 405, { error: 'Método não permitido.' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Falha interna do servidor.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('SST + SGA Kallas rodando.');
  console.log(`Local:   http://localhost:${PORT}`);
  for (const ip of getLocalIps()) console.log(`Rede:    http://${ip}:${PORT}`);
  console.log(`Gemini:  ${process.env.GEMINI_API_KEY ? 'conectado por variável de ambiente' : 'sem chave; usando fallback operacional'}`);
  console.log(`Banco:   ${DB_FILE}`);
});

async function handleChat(req, res) {
  const body = await readJsonBody(req);
  const message = String(body.message || '').trim();
  const images = Array.isArray(body.images) ? body.images.slice(0, 3) : [];
  const sessionId = String(body.sessionId || randomUUID());

  if (!message && images.length === 0) {
    return sendJson(res, 400, { error: 'Envie uma mensagem ou imagem.' });
  }

  const reply = await generateReply({ message, images });
  const record = {
    id: randomUUID(),
    sessionId,
    createdAt: new Date().toISOString(),
    message,
    imageCount: images.length,
    reply
  };
  await appendFile(DB_FILE, `${JSON.stringify(record)}\n`, 'utf8');
  sendJson(res, 200, { reply, sessionId });
}

async function generateReply({ message, images }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return localFallback(message, images);

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const parts = [
    { text: `${SYSTEM_PROMPT}\n\nMensagem do usuário: ${message || '(imagem enviada sem texto)'}` }
  ];

  for (const image of images) {
    const parsed = parseDataUrl(String(image.dataUrl || ''));
    if (parsed) parts.push({ inline_data: { mime_type: parsed.mimeType, data: parsed.base64 } });
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 1200 }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini falhou:', response.status, errorText.slice(0, 500));
    return localFallback(message, images);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
  return text || localFallback(message, images);
}

function localFallback(message, images) {
  const text = normalizeText(message);
  if (images.length) return FALLBACKS.image;
  if (!text || /^(oi|ol[aá]|opa|bom dia|boa tarde|boa noite|menu|ajuda|help)$/i.test(text)) return FALLBACKS.initial;
  if (/\b(menu|op[cç][oõ]es)\b/i.test(text)) return FALLBACKS.menu;
  if (/\b(investiga|ocorr[eê]ncia|acidente|incidente)\b/i.test(text)) {
    return `⚠️ Risco\n- Primeiro vamos controlar a cena: afastar pessoas, isolar área e preservar evidências.\n\n🛠️ Ação\n- Me diga: o que aconteceu, onde, quando, quem estava envolvido e qual atividade era feita.\n- Depois seguimos com 5 porquês e Ishikawa para validar causa imediata, causa básica e falha de gestão.\n\n🚫 Não fazer\n- Não liberar a atividade sem controle do risco e sem registrar as condições encontradas.\n\n📢 Acionar\n- Encarregado, TST e liderança da obra. Se houver lesão, acione atendimento de emergência.\n\n👉 Alguém se machucou ou existe risco crítico agora?`;
  }
  if (/\b(pgr|invent[aá]rio|gro|fun[cç][aã]o|atividade)\b/i.test(text)) {
    return `Para consultar PGR / Inventário, preciso fechar 3 pontos:\n\n1. Qual é a atividade?\n2. Qual é a função da pessoa exposta?\n3. Qual risco você quer avaliar ou qual risco apareceu na frente de serviço?\n\n🛡️ EPI, 🧱 EPC e 🎓 Treinamento eu te devolvo junto com os controles.\n\n👉 Me passa atividade + função + risco.`;
  }
  if (/\b(apr|documento|procedimento|elabora|estrutura)\b/i.test(text)) {
    return `Posso te apoiar na estruturação, mas não vou emitir documento formal pronto.\n\nAntes de estruturar, confirma pra mim:\n- Atividade\n- Local/frente de serviço\n- Função envolvida\n- Riscos principais\n- Controles já existentes\n\n👉 Quer que eu organize no formato ATIVIDADE, DESCRIÇÃO, FUNÇÃO, RISCOS, CONTROLES, EPI, EPC e TREINAMENTO?`;
  }
  return `⚠️ Risco\n- Pela atividade descrita, avalie exposição de pessoas, energia, queda, circulação de máquinas, ferramentas, produtos químicos, resíduos e impacto ambiental.\n\n🛠️ Ação\n- Pare e ajuste qualquer desvio antes de continuar.\n- Confira permissões, isolamento, sinalização, EPC, EPI e treinamento da equipe.\n\n🚫 Não fazer\n- Não improvisar proteção, acesso ou método executivo.\n- Não seguir com risco crítico sem isolar a área.\n\n📢 Acionar\n- Encarregado, TST e meio ambiente quando houver vazamento, resíduo ou contaminação.\n\n👉 Qual atividade, função e risco específico você quer validar?`;
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error('Payload muito grande.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveStatic(pathname, res) {
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
  const requested = safePath === '/' ? '/index.html' : safePath;
  const filePath = join(PUBLIC_DIR, requested);
  if (!filePath.startsWith(PUBLIC_DIR) || !existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Arquivo não encontrado.');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

function health() {
  return {
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    database: DB_FILE,
    ips: getLocalIps(),
    port: PORT
  };
}

function getLocalIps() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((net) => net && net.family === 'IPv4' && !net.internal)
    .map((net) => net.address);
}

async function loadDotEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const contents = await readFile(envPath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}
