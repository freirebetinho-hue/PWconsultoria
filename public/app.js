const messages = document.querySelector('#messages');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const imageInput = document.querySelector('#imageInput');
const preview = document.querySelector('#preview');
const sendButton = document.querySelector('#sendButton');
const menuButton = document.querySelector('#menuButton');
const statusBadge = document.querySelector('#status');

let sessionId = localStorage.getItem('kallas-sst-session') || crypto.randomUUID();
let selectedImages = [];
localStorage.setItem('kallas-sst-session', sessionId);

const welcome = `Fala aí — vamos trabalhar com segurança e respeito ao meio ambiente. 💡\n\nDica do dia: Antes de iniciar qualquer atividade, dá uma conferida rápida nos riscos e nos EPIs. Evita acidente e retrabalho.\n\n👉 Pode falar direto o que você precisa.\n👉 Pode me mandar uma foto que eu analiso risco e impacto ambiental contigo.\n👉 Ou posso te apresentar o menu.\n\n🚨 APOIO EM EMERGÊNCIA\n👉 Tá acontecendo algo agora?\n👉 Me chama aqui que eu te ajudo passo a passo.`;

addMessage(welcome, 'bot');
checkHealth();

menuButton.addEventListener('click', () => sendMessage('menu'));

imageInput.addEventListener('change', async () => {
  selectedImages = await Promise.all([...imageInput.files].slice(0, 3).map(fileToDataUrl));
  renderPreview();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(input.value.trim());
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

async function sendMessage(text) {
  if (!text && selectedImages.length === 0) return;

  const userText = text || 'Imagem enviada para análise automática.';
  addMessage(userText, 'user');
  for (const image of selectedImages) addImageBubble(image.dataUrl);

  input.value = '';
  const imagesToSend = selectedImages;
  selectedImages = [];
  imageInput.value = '';
  renderPreview();

  const loading = addMessage('Analisando em modo operacional...', 'bot loading');
  sendButton.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, images: imagesToSend, sessionId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha no atendimento.');
    sessionId = data.sessionId || sessionId;
    localStorage.setItem('kallas-sst-session', sessionId);
    loading.textContent = data.reply;
    loading.classList.remove('loading');
  } catch (error) {
    loading.textContent = `Não consegui falar com o servidor agora.\n\n⚠️ Risco\n- Se for emergência ou risco crítico, pare a atividade e isole a área.\n\n📢 Acione\n- TST, encarregado e equipe de emergência.\n\nDetalhe técnico: ${error.message}`;
    loading.classList.remove('loading');
  } finally {
    sendButton.disabled = false;
    messages.scrollTop = messages.scrollHeight;
  }
}

async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const health = await response.json();
    const ip = health.ips?.[0] ? `http://${health.ips[0]}:${health.port}` : `porta ${health.port}`;
    statusBadge.textContent = health.geminiConfigured
      ? `Gemini conectado • ${ip}`
      : `Servidor ativo • configure GEMINI_API_KEY • ${ip}`;
    statusBadge.className = `status ${health.geminiConfigured ? 'ok' : 'warn'}`;
  } catch {
    statusBadge.textContent = 'Servidor não respondeu';
    statusBadge.className = 'status warn';
  }
}

function addMessage(text, className) {
  const bubble = document.createElement('div');
  bubble.className = `message ${className}`;
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function addImageBubble(src) {
  const bubble = document.createElement('div');
  bubble.className = 'message user';
  const image = document.createElement('img');
  image.src = src;
  image.alt = 'Imagem enviada para análise SST/SGA';
  image.style.maxWidth = '220px';
  image.style.borderRadius = '14px';
  image.style.display = 'block';
  bubble.appendChild(image);
  messages.appendChild(bubble);
}

function renderPreview() {
  preview.replaceChildren();
  for (const image of selectedImages) {
    const img = document.createElement('img');
    img.src = image.dataUrl;
    img.alt = image.name;
    preview.appendChild(img);
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
