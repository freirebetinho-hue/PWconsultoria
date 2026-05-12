const scenarios = {
  altura: {
    input: 'atividade em altura na fachada',
    response: [
      '⚠️ Confere risco de queda, queda de material e acesso inseguro.',
      '🛠️ Só libera com APR/PT, ancoragem validada, isolamento inferior e supervisão.',
      '🚫 Não iniciar com linha de vida improvisada ou vento forte.',
      '🧱 EPC: guarda-corpo, linha de vida, tela/barreira e sinalização.',
      '🛡️ EPI: cinto paraquedista, talabarte duplo, capacete jugular e calçado.'
    ]
  },
  oleo: {
    input: 'vazamento de óleo no piso',
    response: [
      '⚠️ Para a atividade e isola a área para evitar escorregamento e contaminação.',
      '🛠️ Usa absorvente do kit mitigação e faz contenção do ponto de vazamento.',
      '🚫 Não lavar com água e não empurrar para drenagem pluvial.',
      '🧱 EPC: barreira de contenção, sinalização e bandeja de retenção.',
      '📢 Aciona TST, liderança e ambiental para destinação do resíduo.'
    ]
  },
  queda: {
    input: 'queda de material próximo da circulação',
    response: [
      '⚠️ Risco grave: interromper movimentação e isolar rota de pedestres.',
      '🛠️ Verifica amarração, rodapé, guarda-corpo, armazenagem e plano de içamento.',
      '🚫 Não liberar circulação abaixo da atividade.',
      '🧱 EPC: tela, rodapé, isolamento físico e sinalização visível.',
      '📢 Aciona encarregado + TST para inspeção antes de retomar.'
    ]
  },
  menu: {
    input: 'menu',
    response: [
      'Pode mandar direto o que precisa.',
      'Exemplos: APR, PT, risco da atividade, foto da frente, vazamento, queda, DDS, RNC ou documento GCD.',
      'Se for risco grave: pare, isole e acione liderança/TST.'
    ]
  }
};

const architectureLayers = [
  ['Camada 1', 'Input', 'Texto, imagem e documento.'],
  ['Camada 2', 'Classificador', 'Emergência, APR, PT, investigação, risco, ambiental e GCD.'],
  ['Camada 3', 'Engine SST', 'Riscos, EPC, EPI, hierarquia de controle, NRs e matriz F x P x S.'],
  ['Camada 4', 'Base documental', 'PGR, PT, PET, APR, PAE, GCD e código de ética.'],
  ['Camada 5', 'Motor operacional', 'Checklist, validação, investigação, bloqueio e plano de ação.'],
  ['Camada 6', 'Resposta', 'Mensagem curta, contextual e pronta para uso em campo.']
];

const modules = [
  ['core/', ['orchestrator', 'intent_classifier', 'risk_engine', 'emergency_engine']],
  ['safety/', ['apr_engine', 'pt_engine', 'pet_engine', 'pgr_engine']],
  ['environmental/', ['spill_engine', 'waste_engine', 'contamination_engine']],
  ['investigation/', ['five_whys', 'ishikawa', 'root_cause']],
  ['document/', ['gd4_rules', 'validator', 'compliance']],
  ['vision/ + ai/', ['image_risk_detection', 'epi_detection', 'epc_detection', 'prompt_manager']]
];

const workflows = [
  ['Imagem recebida', 'Detecta riscos, desvios, EPC/EPI ausentes, impacto ambiental e acionamentos.'],
  ['Emergência', 'Interromper atividade, isolar, acionar liderança/TST, avaliar e responder.'],
  ['PGR/GRO', 'Exige atividade, função e risco para orientar controles e prioridade.'],
  ['Investigação', 'Conduz 5 Porquês, Ishikawa, causa raiz, ação corretiva e eficácia.'],
  ['Documental GCD', 'Validade, rastreabilidade, competência mensal, GD4 e análise centralizada.']
];

const roadmap = [
  ['Fase 1', 'Copiloto SST conversacional'],
  ['Fase 2', 'Leitura documental automática'],
  ['Fase 3', 'Análise por imagem'],
  ['Fase 4', 'Integração GD4'],
  ['Fase 5', 'Workflow completo de obra']
];

function listItems(items) {
  return items.map((item) => `<li>${item}</li>`).join('');
}

function renderApp() {
  document.querySelector('#root').innerHTML = `
    <header class="site-header" id="topo">
      <nav class="nav" aria-label="Navegação principal">
        <a class="brand" href="#topo" aria-label="Ir para o início">
          <span class="brand__mark">SMS</span>
          <span>
            <strong>Grupo Kallas</strong>
            <small>Safety Operations Agent</small>
          </span>
        </a>
        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu">
          Menu
        </button>
        <div class="nav__links" id="menu">
          <a href="#operacao">Operação</a>
          <a href="#arquitetura">Arquitetura</a>
          <a href="#modulos">Módulos</a>
          <a href="#workflow">Workflow</a>
          <a class="nav__cta" href="#demo">Ver demo</a>
        </div>
      </nav>

      <section class="hero">
        <div class="hero__content">
          <span class="eyebrow">SST + SGA para campo, obra e gestão documental</span>
          <h1>GPT operacional para Segurança, Meio Ambiente e resposta imediata em obras.</h1>
          <p>
            Estrutura pronta para transformar prompts, regras e fluxos do SMS – Grupo Kallas em
            serviços, engines, workflows, agentes especializados e automações de decisão.
          </p>
          <div class="hero__actions">
            <a class="button button--primary" href="#arquitetura">Explorar arquitetura</a>
            <a class="button button--secondary" href="#demo">Simular atendimento</a>
          </div>
          <ul class="hero__badges" aria-label="Bases técnicas">
            <li>NR-01 / GRO / PGR</li>
            <li>NR-18 / NR-33 / NR-35</li>
            <li>ISO 45001 + ISO 14001</li>
          </ul>
        </div>
        <aside class="hero-card" aria-label="Resumo executivo">
          <div class="status-pill">Modo chat operacional</div>
          <h2>Resposta padrão em campo</h2>
          <div class="chat-preview">
            <p><strong>Entrada:</strong> “vazamento de óleo perto da betoneira”</p>
            <p>⚠️ Isola a área agora.</p>
            <p>🛠️ Usa kit mitigação, contenção e bandeja.</p>
            <p>🚫 Não lavar para rede pluvial.</p>
            <p>📢 Aciona TST + liderança da frente.</p>
          </div>
        </aside>
      </section>
    </header>

    <main>
      <section class="section intro-grid" id="operacao">
        <article class="section__intro">
          <span class="eyebrow">Identidade do GPT</span>
          <h2>Atuação como copiloto QSMS em campo.</h2>
          <p>
            O agente foi desenhado para apoiar técnico de segurança, coordenação QSMS,
            documentação, emergência, investigação, PGR/GRO, PAE e conformidade GCD sem gerar
            documentos formais completos.
          </p>
        </article>
        <div class="feature-grid">
          <article class="feature-card">
            <span>01</span>
            <h3>Conversa operacional</h3>
            <p>Texto curto, estilo WhatsApp, direto ao ponto e sem juridiquês.</p>
          </article>
          <article class="feature-card">
            <span>02</span>
            <h3>Entrada inteligente</h3>
            <p>Classifica saudação, comando técnico, imagem, emergência, APR, PT, RNC e GCD.</p>
          </article>
          <article class="feature-card">
            <span>03</span>
            <h3>Bloqueio crítico</h3>
            <p>Risco grave aciona orientação de parada da atividade e isolamento imediato.</p>
          </article>
          <article class="feature-card">
            <span>04</span>
            <h3>Base técnica integrada</h3>
            <p>Combina SST, SGA, compliance, investigação e gestão documental centralizada.</p>
          </article>
        </div>
      </section>

      <section class="section dark-section" id="arquitetura">
        <div class="section__intro section__intro--center">
          <span class="eyebrow">Arquitetura recomendada</span>
          <h2>Seis camadas para transformar o GPT em produto.</h2>
          <p>
            Da entrada do usuário até a resposta operacional, cada camada tem uma função clara
            para permitir evolução em SaaS, app de obra ou auditor inteligente.
          </p>
        </div>
        <div class="architecture" aria-label="Camadas da arquitetura">
          ${architectureLayers
            .map(
              ([label, title, text]) => `
                <article>
                  <small>${label}</small>
                  <h3>${title}</h3>
                  <p>${text}</p>
                </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="section" id="modulos">
        <div class="section__intro">
          <span class="eyebrow">Módulos Codex</span>
          <h2>Organização sugerida para código, agentes e engines.</h2>
        </div>
        <div class="module-board">
          ${modules
            .map(
              ([title, items]) => `
                <article>
                  <h3>${title}</h3>
                  <ul>${listItems(items)}</ul>
                </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="section split" id="workflow">
        <div>
          <span class="eyebrow">Workflow operacional</span>
          <h2>Fluxos críticos já modelados.</h2>
          <p>
            O site organiza os blocos do GPT como jornadas práticas para uso em frente de serviço,
            central documental e suporte QSMS.
          </p>
        </div>
        <div class="workflow-list">
          ${workflows
            .map(
              ([title, text]) => `
                <article>
                  <strong>${title}</strong>
                  <p>${text}</p>
                </article>`
            )
            .join('')}
        </div>
      </section>

      <section class="section demo" id="demo">
        <div class="section__intro section__intro--center">
          <span class="eyebrow">Demo interativa</span>
          <h2>Simule o modo chat operacional.</h2>
          <p>Escolha uma ocorrência para visualizar uma resposta curta no padrão SMS – Grupo Kallas.</p>
        </div>
        <div class="demo__shell">
          <div class="demo__buttons" role="group" aria-label="Cenários de demonstração">
            <button type="button" data-scenario="altura">Atividade em altura</button>
            <button type="button" data-scenario="oleo">Vazamento de óleo</button>
            <button type="button" data-scenario="queda">Queda de material</button>
            <button type="button" data-scenario="menu">Menu inicial</button>
          </div>
          <div class="phone" aria-live="polite">
            <div class="phone__top">SMS – Grupo Kallas</div>
            <div class="phone__messages" id="demo-output"></div>
          </div>
        </div>
      </section>

      <section class="section roadmap">
        <div class="section__intro section__intro--center">
          <span class="eyebrow">Evolução</span>
          <h2>Roadmap de implantação.</h2>
        </div>
        <ol class="timeline">
          ${roadmap.map(([phase, text]) => `<li><strong>${phase}</strong><span>${text}</span></li>`).join('')}
        </ol>
      </section>
    </main>

    <footer class="footer">
      <p>SMS – Grupo Kallas • Estrutura técnica para Safety Operations Agent</p>
      <a href="#topo">Voltar ao topo</a>
    </footer>`;
}

function renderScenario(key) {
  const output = document.querySelector('#demo-output');
  const buttons = document.querySelectorAll('[data-scenario]');
  const scenario = scenarios[key] || scenarios.menu;

  output.innerHTML = '';

  const userMessage = document.createElement('div');
  userMessage.className = 'message message--user';
  userMessage.textContent = scenario.input;
  output.appendChild(userMessage);

  scenario.response.forEach((line) => {
    const botMessage = document.createElement('div');
    botMessage.className = 'message message--bot';
    botMessage.textContent = line;
    output.appendChild(botMessage);
  });

  buttons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.scenario === key);
  });
}

function bindInteractions() {
  const navToggle = document.querySelector('.nav__toggle');

  document.querySelectorAll('[data-scenario]').forEach((button) => {
    button.addEventListener('click', () => renderScenario(button.dataset.scenario));
  });

  navToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav__links a').forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

renderApp();
bindInteractions();
renderScenario('altura');
