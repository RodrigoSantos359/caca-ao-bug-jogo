// ---------- Dados enviados pelo servidor ----------
const dadosEl = document.getElementById('dados-mundo');
const DESAFIOS = JSON.parse(dadosEl.textContent);
const MUNDO_ID = Number(dadosEl.dataset.mundoId);
const NOME_MUNDO = dadosEl.dataset.nome;
const URL_VALIDAR = dadosEl.dataset.urlValidar;
const URL_MAPA = dadosEl.dataset.urlMapa;

// ---------- Elementos ----------
const palco = document.getElementById('palco');
const mundo = document.getElementById('mundo');
const robo = document.getElementById('robo');
const alerta = document.getElementById('alerta');
const tituloMundo = document.getElementById('titulo-mundo');
const dicaControle = document.getElementById('dica-controle');
const btnEsq = document.getElementById('btn-esq');
const btnDir = document.getElementById('btn-dir');

const fim = document.getElementById('fim');
const btnMapa = document.getElementById('btn-mapa');
const btnRepetir = document.getElementById('btn-repetir');
const contadorChips = document.getElementById('contador-chips');
const chipsNum = document.getElementById('chips-num');
const fimChips = document.getElementById('fim-chips');
const fimTitulo = document.getElementById('fim-titulo');
const fimTexto = document.getElementById('fim-texto');
const cronometro = document.getElementById('cronometro');
const perdaJanela = document.getElementById('perda-janela');
const btnSom = document.getElementById('btn-som');

const modal = document.getElementById('modal');
const tituloDesafio = document.getElementById('titulo-desafio');
const enunciado = document.getElementById('enunciado');
const editor = document.getElementById('editor');
const bandeja = document.getElementById('bandeja');
const feedback = document.getElementById('feedback');
const btnVerificar = document.getElementById('btn-verificar');
const btnLimpar = document.getElementById('btn-limpar');
const btnContinuar = document.getElementById('btn-continuar');

// ---------- Efeitos sonoros (gerados pelo navegador, sem arquivos de áudio) ----------
const Som = (function () {
    let ctx = null;
    let ruido = null;
    let ligado = true;
    let aquecido = false;
    try {
        ligado = localStorage.getItem('cacaAoBug.som') !== '0';
    } catch (erro) {
        // sem armazenamento: som ligado por padrão
    }

    // O navegador só libera o áudio depois de um clique ou tecla do jogador
    function iniciar() {
        // iPhone: faz o som tocar mesmo com a chave lateral no silencioso (iOS 17 ou mais novo)
        try {
            if (navigator.audioSession) navigator.audioSession.type = 'playback';
        } catch (erro) {
            // navegador sem essa opção
        }
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            ctx = new AC({ latencyHint: 'interactive' });
            const n = ctx.sampleRate;
            ruido = ctx.createBuffer(1, n, ctx.sampleRate);
            const dados = ruido.getChannelData(0);
            for (let i = 0; i < n; i++) dados[i] = Math.random() * 2 - 1;
        }
        if (ctx.state !== 'running') ctx.resume();
        if (!aquecido) {
            // Mantém a saída de áudio "acordada" com um ruído inaudível. Sem isso, em muitos aparelhos
            // (fone bluetooth, celular, notebook) a placa de som dorme depois de alguns segundos em
            // silêncio e o primeiro som seguinte atrasa ou sai cortado, o que acontecia nos mundos
            // com mais trechos sem som (Mundos 2 e 3).
            const tam = ctx.sampleRate;
            const manter = ctx.createBuffer(1, tam, ctx.sampleRate);
            const dm = manter.getChannelData(0);
            for (let i = 0; i < tam; i++) dm[i] = (Math.random() * 2 - 1) * 0.0004;
            const fonteManter = ctx.createBufferSource();
            fonteManter.buffer = manter;
            fonteManter.loop = true;
            fonteManter.connect(ctx.destination);
            fonteManter.start();
            // toca um instante de silêncio para "acordar" a placa de som: o primeiro som real não atrasa
            aquecido = true;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            g.gain.value = 0;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.05);
        }
    }

    // Nota simples: frequência (Hz), duração (s) e opções
    function tom(freq, dur, opcoes) {
        if (!ligado || !ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        const o = Object.assign({ tipo: 'sine', vol: 0.15, atraso: 0, fim: null }, opcoes || {});
        const t0 = ctx.currentTime + o.atraso;
        const osc = ctx.createOscillator();
        const ganho = ctx.createGain();
        osc.type = o.tipo;
        osc.frequency.setValueAtTime(freq, t0);
        if (o.fim) osc.frequency.exponentialRampToValueAtTime(o.fim, t0 + dur);
        ganho.gain.setValueAtTime(0.0001, t0);
        ganho.gain.exponentialRampToValueAtTime(o.vol, t0 + 0.004);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(ganho);
        ganho.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.03);
    }

    // Chiado filtrado (vento, quebra, estalo)
    function sopro(dur, opcoes) {
        if (!ligado || !ctx) return;
        const o = Object.assign({ vol: 0.2, atraso: 0, filtro: 1200, filtroFim: null }, opcoes || {});
        const t0 = ctx.currentTime + o.atraso;
        const fonte = ctx.createBufferSource();
        fonte.buffer = ruido;
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'bandpass';
        filtro.frequency.setValueAtTime(o.filtro, t0);
        if (o.filtroFim) filtro.frequency.exponentialRampToValueAtTime(o.filtroFim, t0 + dur);
        const ganho = ctx.createGain();
        ganho.gain.setValueAtTime(o.vol, t0);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        fonte.connect(filtro);
        filtro.connect(ganho);
        ganho.connect(ctx.destination);
        fonte.start(t0, Math.random() * 0.4);
        fonte.stop(t0 + dur + 0.03);
    }

    return {
        iniciar: iniciar,
        estaLigado: function () { return ligado; },
        estado: function () { return ctx ? ctx.state : 'sem'; },
        alternar: function () {
            ligado = !ligado;
            try {
                localStorage.setItem('cacaAoBug.som', ligado ? '1' : '0');
            } catch (erro) {
                // ignora
            }
            return ligado;
        },
        chip: function () {
            tom(988, 0.08, { tipo: 'square', vol: 0.08 });
            tom(1319, 0.18, { tipo: 'square', vol: 0.08, atraso: 0.06 });
        },
        peca: function () {
            tom(660, 0.05, { tipo: 'square', vol: 0.05 });
        },
        pulo: function () {
            tom(280, 0.2, { tipo: 'square', vol: 0.07, fim: 720 });
        },
        pouso: function () {
            tom(150, 0.08, { tipo: 'sine', vol: 0.18, fim: 70 });
            sopro(0.07, { vol: 0.07, filtro: 600 });
        },
        alerta: function () {
            tom(330, 0.25, { tipo: 'triangle', vol: 0.18, fim: 700 });
        },
        erro: function () {
            tom(180, 0.3, { tipo: 'sawtooth', vol: 0.1, fim: 100 });
        },
        acerto: function () {
            [523, 659, 784, 1047].forEach(function (f, i) {
                tom(f, 0.22, { tipo: 'triangle', vol: 0.14, atraso: i * 0.09 });
            });
        },
        desmanchar: function () {
            sopro(0.4, { vol: 0.2, filtro: 3200, filtroFim: 300, atraso: 0.3 });
            for (let i = 0; i < 8; i++) {
                tom(1000 - i * 90, 0.06, { tipo: 'square', vol: 0.05, atraso: 0.02 + i * 0.045 });
            }
        },
        ponte: function () {
            for (let i = 0; i < 8; i++) {
                tom(150 + i * 12, 0.09, { tipo: 'square', vol: 0.08, atraso: i * 0.07, fim: 90 });
                sopro(0.05, { vol: 0.08, filtro: 900, atraso: i * 0.07 });
            }
        },
        laser: function () {
            tom(900, 0.35, { tipo: 'sawtooth', vol: 0.09, fim: 120 });
            sopro(0.3, { vol: 0.12, filtro: 5000, filtroFim: 800 });
            [784, 1047, 1319].forEach(function (f, i) {
                tom(f, 0.2, { tipo: 'triangle', vol: 0.1, atraso: 0.35 + i * 0.1 });
            });
        },
        pavio: function () {
            sopro(0.9, { vol: 0.1, filtro: 6000, filtroFim: 3000 });
        },
        explosao: function () {
            sopro(1.1, { vol: 0.35, filtro: 1800, filtroFim: 100 });
            tom(90, 0.7, { tipo: 'sawtooth', vol: 0.25, fim: 28 });
        },
        lava: function () {
            sopro(1.4, { vol: 0.16, filtro: 3500, filtroFim: 600 });
            [600, 520, 440, 360].forEach(function (f, i) {
                tom(f, 0.18, { tipo: 'sine', vol: 0.06, atraso: 0.2 + i * 0.12 });
            });
        },
        portal: function () {
            tom(160, 1.1, { tipo: 'sine', vol: 0.15, fim: 900 });
            sopro(0.9, { vol: 0.1, filtro: 800, filtroFim: 5000 });
            [523, 659, 784, 1047, 1319].forEach(function (f, i) {
                tom(f, 0.3, { tipo: 'triangle', vol: 0.1, atraso: 0.6 + i * 0.1 });
            });
        },
        terminal: function () {
            [880, 880].forEach(function (f, i) {
                tom(f, 0.08, { tipo: 'square', vol: 0.07, atraso: i * 0.14 });
            });
            for (let i = 0; i < 14; i++) {
                tom(1400 + (i % 3) * 300, 0.03, { tipo: 'square', vol: 0.03, atraso: 0.4 + i * 0.12 });
            }
            [523, 659, 784, 1047].forEach(function (f, i) {
                tom(f, 0.22, { tipo: 'triangle', vol: 0.1, atraso: 2.3 + i * 0.09 });
            });
        },
        cabos: function () {
            sopro(0.5, { vol: 0.14, filtro: 6000, filtroFim: 400 });
            tom(520, 0.5, { tipo: 'sawtooth', vol: 0.07, fim: 90 });
            tom(300, 0.45, { tipo: 'square', vol: 0.06, atraso: 0.35, fim: 700 });
            [784, 1047, 1319].forEach(function (f, i) {
                tom(f, 0.2, { tipo: 'triangle', vol: 0.1, atraso: 0.9 + i * 0.1 });
            });
        },
        prensa: function () {
            sopro(0.9, { vol: 0.2, filtro: 2500, filtroFim: 500 });
            tom(80, 0.9, { tipo: 'sawtooth', vol: 0.12, atraso: 0.35, fim: 140 });
            [659, 784, 1047].forEach(function (f, i) {
                tom(f, 0.2, { tipo: 'triangle', vol: 0.1, atraso: 1.5 + i * 0.1 });
            });
        },
        tanque: function () {
            for (let i = 0; i < 14; i++) {
                tom(300 + Math.random() * 500, 0.06, { tipo: 'sine', vol: 0.06, atraso: i * 0.14 });
            }
            sopro(1.8, { vol: 0.12, filtro: 1500, filtroFim: 300, atraso: 0.2 });
            sopro(0.5, { vol: 0.12, filtro: 4000, filtroFim: 500, atraso: 2.4 });
            [523, 659, 784, 1047].forEach(function (f, i) {
                tom(f, 0.22, { tipo: 'triangle', vol: 0.1, atraso: 2.5 + i * 0.09 });
            });
        },
        plasma: function () {
            tom(200, 0.7, { tipo: 'sawtooth', vol: 0.1, fim: 1200 });
            tom(1200, 0.35, { tipo: 'sine', vol: 0.12, atraso: 0.65, fim: 60 });
            sopro(0.5, { vol: 0.16, filtro: 5000, filtroFim: 300, atraso: 0.6 });
            [659, 880, 1175].forEach(function (f, i) {
                tom(f, 0.22, { tipo: 'triangle', vol: 0.1, atraso: 1.1 + i * 0.1 });
            });
        },
        passo: function () {
            tom(150 + Math.random() * 40, 0.06, { tipo: 'triangle', vol: 0.04, fim: 70 });
        },
        farfalhar: function () {
            sopro(0.3, { vol: 0.08, filtro: 3200, filtroFim: 1400 });
            sopro(0.2, { vol: 0.06, filtro: 2400, filtroFim: 1800, atraso: 0.18 });
        },
        pop: function () {
            tom(220, 0.12, { tipo: 'square', vol: 0.1, fim: 520 });
            sopro(0.18, { vol: 0.12, filtro: 1800, filtroFim: 400 });
            tom(740, 0.1, { tipo: 'triangle', vol: 0.08, atraso: 0.1 });
        },
        bonus: function () {
            [784, 988, 1175, 1568].forEach(function (f, i) {
                tom(f, 0.12, { tipo: 'square', vol: 0.06, atraso: i * 0.07 });
            });
        },
        surpresa: function () {
            sopro(0.45, { vol: 0.16, filtro: 2500, filtroFim: 200 });
            tom(110, 0.3, { tipo: 'sine', vol: 0.3, atraso: 0.4, fim: 45 });
        },
        fim: function () {
            [523, 659, 784, 659, 784, 1047].forEach(function (f, i) {
                tom(f, 0.24, { tipo: 'triangle', vol: 0.15, atraso: i * 0.12 });
            });
        }
    };
})();

['keydown', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach(function (nome) {
    document.addEventListener(nome, Som.iniciar);
});

// ---------- Progresso (guardado só enquanto a aba do jogo estiver aberta) ----------
// sessionStorage: o progresso some quando o jogador fecha a aba, mas continua valendo ao ir do mapa
// para um mundo e voltar. Para salvar de vez no navegador, troque por: window.localStorage
const ARMAZEM_PROGRESSO = window.sessionStorage;
const CHAVE_PROGRESSO = 'cacaAoBug.progresso';

function lerProgresso() {
    try {
        const p = JSON.parse(ARMAZEM_PROGRESSO.getItem(CHAVE_PROGRESSO));
        return (p && typeof p === 'object') ? p : {};
    } catch (erro) {
        return {};
    }
}

function salvarProgresso(concluidos, completo) {
    try {
        const p = lerProgresso();
        if (!p.mundos || typeof p.mundos !== 'object') p.mundos = {};
        // quem já concluiu o mundo não perde o desbloqueio do próximo ao jogar de novo
        const antes = p.mundos[MUNDO_ID];
        const jaCompleto = !!(antes && antes.completo);
        p.mundos[MUNDO_ID] = { concluidos: concluidos, completo: completo || jaCompleto, chips: chipsColetados, bonus: chipsDeBonus, perdidos: chipsPerdidos };
        ARMAZEM_PROGRESSO.setItem(CHAVE_PROGRESSO, JSON.stringify(p));
    } catch (erro) {
        // Sem armazenamento disponível: o jogo funciona, só não salva.
    }
}

// Zera os bugs e chips do mundo (para jogar de novo), mas mantém o próximo mundo liberado
function apagarProgressoDoMundo() {
    try {
        const p = lerProgresso();
        if (p.mundos) {
            const antes = p.mundos[MUNDO_ID];
            if (antes && antes.completo) p.mundos[MUNDO_ID] = { concluidos: [], completo: true, chips: [], bonus: 0, perdidos: 0 };
            else delete p.mundos[MUNDO_ID];
        }
        ARMAZEM_PROGRESSO.setItem(CHAVE_PROGRESSO, JSON.stringify(p));
    } catch (erro) {
        // ignora
    }
}

// Só dá para jogar um mundo depois de concluir o anterior (o endereço ?livre=1 libera, para testes)
(function bloquearMundoTrancado() {
    if (MUNDO_ID <= 1 || /[?&]livre\b/.test(window.location.search)) return;
    const anterior = (lerProgresso().mundos || {})[MUNDO_ID - 1];
    if (!(anterior && anterior.completo)) window.location.replace(URL_MAPA);
})();

const idsValidos = DESAFIOS.map(function (d) { return d.id; });
const salvo = ((lerProgresso().mundos || {})[MUNDO_ID] || {}).concluidos;
const concluidos = Array.isArray(salvo)
    ? salvo.filter(function (id) { return idsValidos.includes(id); })
    : [];

// Chips já coletados (guardados junto com o progresso)
const salvoChips = ((lerProgresso().mundos || {})[MUNDO_ID] || {}).chips;
const chipsColetados = Array.isArray(salvoChips) ? salvoChips.filter(Number.isInteger) : [];

// ---------- Regras de pontuação ----------
// Para passar de mundo é preciso juntar PORCENTAGEM_META dos chips possíveis (os do cenário + o bônus típico, +3, de cada bug).
// Responder o desafio rápido dá chips de bônus: até 45 s +5, até 90 s +3, depois +1 (no Mundo 1: +3, +2, +1).
const PORCENTAGEM_META = 0.6;
// O Mundo 1 é mais curto (menos chips no cenário), então o bônus dele é menor para não pesar mais que o cenário.
const BONUS_POR_MUNDO = { 1: [3, 2] };           // [até 45 s, até 90 s]; depois disso sempre +1
const BONUS_VALORES = BONUS_POR_MUNDO[MUNDO_ID] || [5, 3];
const BONUS_FAIXAS = [{ ate: 45, chips: BONUS_VALORES[0] }, { ate: 90, chips: BONUS_VALORES[1] }];
const BONUS_MINIMO = 1;
const BONUS_MAX = BONUS_FAIXAS[0].chips;
const BONUS_TIPICO = BONUS_FAIXAS[1].chips;   // a meta conta com o bônus de quem responde sem pressa
const salvoBonus = ((lerProgresso().mundos || {})[MUNDO_ID] || {}).bonus;
let chipsDeBonus = Number.isInteger(salvoBonus) && salvoBonus > 0 ? salvoBonus : 0;
// Cada resposta errada na janela do desafio custa chips
const PENALIDADE_ERRO = 1;
const salvoPerdidos = ((lerProgresso().mundos || {})[MUNDO_ID] || {}).perdidos;
let chipsPerdidos = Number.isInteger(salvoPerdidos) && salvoPerdidos > 0 ? salvoPerdidos : 0;
function bonusPorTempo(segundos) {
    for (let i = 0; i < BONUS_FAIXAS.length; i++) {
        if (segundos <= BONUS_FAIXAS[i].ate) return BONUS_FAIXAS[i].chips;
    }
    return BONUS_MINIMO;
}

// ---------- Montagem do cenário ----------
// Posições em "unidades": 1 unidade = 1% da largura do palco.
const N = DESAFIOS.length;

// ---------- Cenário do mundo ----------
// O mundo é uma sequência de imagens (trechos) emendadas da esquerda para a direita.
//   arquivo:   imagem dentro de static/ (em todas, o chão fica a 70% da altura)
//   proporcao: largura / altura da imagem
//   bugs:      os bugs do trecho, da esquerda para a direita. Cada bug tem:
//      x         posição no trecho (0 = borda esquerda, 1 = borda direita)
//      ponte     (opcional) recorte da ponte que fica desmontada até o bug ser derrotado
//      surpresa  (opcional) o bug fica escondido e despenca quando o robô se aproxima
//      esconde   (opcional) 'moita' | 'cogumelo' | 'caixote' (enfeites em que o robô encosta) ou 'bloco' (em que ele pula):
//                o bug se esconde ali e salta para fora quando o robô chega perto
// Para trocar o cenário ou montar o de outro mundo, edite esta lista.
// Atenção: o total de bugs precisa ser pelo menos o número de desafios do mundo.
const CENARIOS = {
    1: [
        { arquivo: 'floresta_sem_pontes.jpg', proporcao: 1776 / 896, bugs: [
            { x: 0.33,   ponte: { arquivo: 'ponte_f1.png', x: 0.28322, y: 0.64732, w: 0.09403, h: 0.10379, prof: 1.55 } },
            { x: 0.7508, esconde: 'moita', ponte: { arquivo: 'ponte_f2.png', x: 0.70439, y: 0.64955, w: 0.09347, h: 0.10268, prof: 1.45 } }
        ] },
        { arquivo: 'grutas_sem_pontes.jpg', proporcao: 1920 / 1006, bugs: [
            { x: 0.37, surpresa: true },
            { x: 0.6919, esconde: 'bloco', ponte: { arquivo: 'ponte_g1.png', x: 0.61979, y: 0.63917, w: 0.14479, h: 0.1173, prof: 1.85 } }
        ] },
        { arquivo: 'pantano_sem_pontes.jpg', proporcao: 1800 / 1120, bugs: [
            { x: 0.6417, ponte: { arquivo: 'ponte_p1.png', x: 0.56889, y: 0.65804, w: 0.14611, h: 0.09464, prof: 1.6 } }
        ] }
    ],
    // Mundo 2: Caverna das Decisões (sem pontes: cada bug protege um obstáculo animado).
    // Os trechos "_esp" são o mesmo cenário espelhado, o que emenda sem corte e alonga a caminhada.
    // Os bugs ficam bem distantes (cerca de 100 unidades), com blocos e chips pelo caminho.
    2: [
        { arquivo: 'caverna_cristais.jpg',     proporcao: 1730 / 1100, bugs: [] },
        { arquivo: 'caverna_cristais_esp.jpg', proporcao: 1730 / 1100, bugs: [
            { x: 0.278, objeto: { tipo: 'laser' } }
        ] },
        { arquivo: 'caverna_escura.jpg',       proporcao: 2230 / 1089, bugs: [
            { x: 0.384, esconde: 'cogumelo', objeto: { tipo: 'tnt' } }
        ] },
        { arquivo: 'caverna_escura_esp.jpg',   proporcao: 2230 / 1089, bugs: [
            { x: 0.28, surpresa: true }
        ] },
        { arquivo: 'caverna_cristais.jpg',     proporcao: 1730 / 1100, bugs: [
            { x: 0.228, esconde: 'bloco', objeto: { tipo: 'lava', dx: 4 } }
        ] },
        { arquivo: 'caverna_escura.jpg',       proporcao: 2230 / 1089, bugs: [
            { x: 0.39, objeto: { tipo: 'portal', fimDoMundo: true } }
        ] }
    ],
    // Mundo 3: Laboratório de Funções. Estação e sala de máquinas, com versões espelhadas ("_esp")
    // para emendar sem corte. Cada bug protege uma máquina animada; ~100 unidades entre eles.
    3: [
        { arquivo: 'lab_estacao.jpg',       proporcao: 1920 / 960, bugs: [] },
        { arquivo: 'lab_maquinas.jpg',      proporcao: 1920 / 992, bugs: [
            { x: 0.28, objeto: { tipo: 'cabos' } }
        ] },
        { arquivo: 'lab_maquinas_esp.jpg',  proporcao: 1920 / 992, bugs: [
            { x: 0.276, esconde: 'caixote', objeto: { tipo: 'prensa' } }
        ] },
        { arquivo: 'lab_estacao_esp.jpg',   proporcao: 1920 / 960, bugs: [
            { x: 0.215, surpresa: true }
        ] },
        { arquivo: 'lab_estacao.jpg',       proporcao: 1920 / 960, bugs: [
            { x: 0.175, objeto: { tipo: 'tanque' } }
        ] },
        { arquivo: 'lab_maquinas.jpg',      proporcao: 1920 / 992, bugs: [
            { x: 0.186, esconde: 'bloco', objeto: { tipo: 'plasma' } }
        ] }
    ]
};
// Tema visual de cada mundo (classe aplicada ao palco; veja o CSS). O Mundo 2 já tem cenário próprio.
const TEMAS = {};
const SOBREPOSICAO = 8;          // unidades de mistura suave entre um trecho e o seguinte
const URL_ESTATICOS = mundo.dataset.estaticos;

// Largura de cada trecho em unidades (1 unidade = 1% da largura do palco)
const trechos = [];
let inicioTrecho = 0;
(CENARIOS[MUNDO_ID] || CENARIOS[1]).forEach(function (t) {
    const largura = 100 * t.proporcao / (1680 / 944);
    trechos.push({ arquivo: t.arquivo, bugs: t.bugs, largura: largura, inicio: inicioTrecho });
    inicioTrecho += largura - SOBREPOSICAO;
});
const LARGURA_MUNDO = inicioTrecho + SOBREPOSICAO;

mundo.style.width = 'calc(' + LARGURA_MUNDO.toFixed(3) + ' * 1cqw)';
mundo.style.setProperty('--ov', SOBREPOSICAO);

const fragmento = document.createDocumentFragment();
trechos.forEach(function (t, i) {
    const tile = document.createElement('div');
    tile.className = 'tile' + (i > 0 ? ' mescla' : '');
    tile.style.width = 'calc(' + t.largura.toFixed(3) + ' * 1cqw)';
    tile.style.backgroundImage = "url('" + URL_ESTATICOS + t.arquivo + "')";
    if (i > 0) tile.style.marginLeft = 'calc(' + (-SOBREPOSICAO) + ' * 1cqw)';
    fragmento.appendChild(tile);
});
mundo.prepend(fragmento);
if (TEMAS[MUNDO_ID]) palco.classList.add(TEMAS[MUNDO_ID]);

// Ponte desmontada: o recorte é dividido em fatias que "caem" no lugar quando ela é reconstruída
const FATIAS_PONTE = 8;

function criarPonte(p, trecho) {
    const el = document.createElement('div');
    el.className = 'ponte';
    el.style.left = 'calc(' + (trecho.inicio + p.x * trecho.largura).toFixed(3) + ' * 1cqw)';
    el.style.width = 'calc(' + (p.w * trecho.largura).toFixed(3) + ' * 1cqw)';
    el.style.top = (p.y * 100).toFixed(3) + '%';
    el.style.height = (p.h * 100).toFixed(3) + '%';
    const url = "url('" + URL_ESTATICOS + p.arquivo + "')";

    const inteira = document.createElement('div');
    inteira.className = 'ponte-inteira';
    inteira.style.backgroundImage = url;
    el.appendChild(inteira);

    const fatias = document.createElement('div');
    fatias.className = 'ponte-fatias';
    for (let i = 0; i < FATIAS_PONTE; i++) {
        const f = document.createElement('div');
        f.className = 'fatia';
        f.style.backgroundImage = url;
        f.style.backgroundSize = (FATIAS_PONTE * 100) + '% 100%';
        f.style.backgroundPosition = (i * 100 / (FATIAS_PONTE - 1)) + '% 0';
        f.style.setProperty('--i', i);
        f.style.setProperty('--giro', ((Math.random() - 0.5) * 24).toFixed(1) + 'deg');
        fatias.appendChild(f);
    }
    el.appendChild(fatias);
    mundo.appendChild(el);
    return el;
}

function construirPonte(el) {
    if (el.dataset.tipo) { abrirObjeto(el); return; }
    el.classList.add('construindo');
    Som.ponte();
    setTimeout(function () {
        el.classList.add('pronta');
    }, 1200);
}


// ---------- Obstáculos de caverna (Mundo 2) ----------
// Cada bug protege um obstáculo animado, que é resolvido quando o bug é derrotado:
//   laser  - campo de força que se desliga        tnt    - parede de dinamite que explode
//   lava   - rio de lava que esfria e vira rocha   portal - portal que acende (saída do mundo)
let contadorObjetos = 0;
// Tempo (ms) que o robô espera depois de resolver o bug, para a animação do obstáculo terminar
const ESPERA_OBJETO = { tnt: 2900, cabos: 2000, prensa: 2400, tanque: 3300, plasma: 1800 };

// Solta partículas (faíscas, fumaça, estilhaços) a partir de um ponto do obstáculo (x e y em %)
function particulas(el, n, o) {
    for (let i = 0; i < n; i++) {
        const p = document.createElement('span');
        p.className = 'part' + (o.fumaca ? ' fumaca' : '');
        const ang = Math.random() * Math.PI * 2;
        const dist = (o.dist || 100) * (0.4 + Math.random() * 0.8);
        p.style.setProperty('--dx', (Math.cos(ang) * dist * (o.largura || 1)).toFixed(0) + 'px');
        p.style.setProperty('--dy', (Math.sin(ang) * dist * (o.altura || 1) + (o.sobe || 0)).toFixed(0) + 'px');
        p.style.setProperty('--s', ((o.tam || 8) * (0.6 + Math.random() * 0.8)).toFixed(1) + 'px');
        p.style.setProperty('--c', o.cores[i % o.cores.length]);
        p.style.setProperty('--dur', (o.dur || 1) + 's');
        p.style.left = (o.x + (Math.random() - 0.5) * (o.espalha || 0)) + '%';
        p.style.top = (o.y + (Math.random() - 0.5) * (o.espalhaY || 0)) + '%';
        el.appendChild(p);
        setTimeout(function () { p.remove(); }, ((o.dur || 1) + 0.5) * 1000);
    }
}

const OBJETOS_HTML = {
    laser: function (id) {
        let feixes = '', arcos = '', emissores = '';
        [78, 128, 178, 228].forEach(function (y, i) {
            feixes += '<line class="halo" x1="52" y1="' + y + '" x2="168" y2="' + y + '"/><line class="nucleo-feixe" x1="52" y1="' + y + '" x2="168" y2="' + y + '"/>';
            arcos += '<polyline points="52,' + y + ' 70,' + (y - 9) + ' 88,' + (y + 8) + ' 108,' + (y - 8) + ' 128,' + (y + 8) + ' 148,' + (y - 7) + ' 168,' + y + '"/>';
            emissores += '<circle cx="50" cy="' + y + '" r="8"/><circle cx="170" cy="' + y + '" r="8"/>';
        });
        return '<svg viewBox="0 0 220 290" aria-hidden="true"><defs>' +
            '<linearGradient id="lm' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b4bdd2"/><stop offset=".5" stop-color="#707a98"/><stop offset="1" stop-color="#363c55"/></linearGradient>' +
            '<pattern id="ls' + id + '" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="18" fill="#ffd23f"/><rect x="9" width="9" height="18" fill="#1b1d2b"/></pattern></defs>' +
            '<ellipse cx="110" cy="283" rx="104" ry="7" fill="#000" opacity=".3"/>' +
            '<rect class="campo" x="50" y="56" width="120" height="224" fill="#ff3b3b"/>' +
            '<g class="feixes">' + feixes + '</g>' +
            '<g class="arcos" fill="none" stroke="#fff0f0" stroke-width="2.5" stroke-linejoin="round">' + arcos + '</g>' +
            '<g stroke="#10131f" stroke-width="5" stroke-linejoin="round">' +
              '<rect x="8" y="56" width="42" height="224" rx="9" fill="url(#lm' + id + ')"/><rect x="170" y="56" width="42" height="224" rx="9" fill="url(#lm' + id + ')"/>' +
              '<rect x="8" y="238" width="42" height="42" rx="6" fill="url(#ls' + id + ')"/><rect x="170" y="238" width="42" height="42" rx="6" fill="url(#ls' + id + ')"/>' +
              '<circle class="lampada" cx="29" cy="44" r="11"/><circle class="lampada" cx="191" cy="44" r="11"/>' +
            '</g>' +
            '<g class="emissores" stroke="#10131f" stroke-width="3" fill="#ff7b7b">' + emissores + '</g>' +
            '<g class="placa"><rect x="68" y="6" width="84" height="36" rx="8" fill="#12172a" stroke="#7a86ad" stroke-width="3"/>' +
            '<text class="t403" x="110" y="32" text-anchor="middle" font-family="Consolas,monospace" font-weight="900" font-size="23" fill="#ff6b6b">403</text>' +
            '<text class="t200" x="110" y="32" text-anchor="middle" font-family="Consolas,monospace" font-weight="900" font-size="23" fill="#4dffa0">200</text></g></svg>';
    },
    tnt: function (id) {
        function rocha(d, claro, dx, dy, r) {
            return '<g class="rocha" style="--dx:' + dx + 'px;--dy:' + dy + 'px;--r:' + r + 'deg">' +
                '<path d="' + d + '" fill="url(#rg' + id + ')" stroke="#1d1410" stroke-width="5" stroke-linejoin="round"/>' +
                '<path d="' + claro + '" fill="#d2a874" opacity=".55"/></g>';
        }
        function barril(x, y, w, h) {
            return '<g class="barril" stroke="#1d0f0c" stroke-width="4" stroke-linejoin="round">' +
                '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="#d63b2f"/>' +
                '<rect x="' + x + '" y="' + (y + 8) + '" width="' + w + '" height="9" fill="#8f1f1a"/><rect x="' + x + '" y="' + (y + h - 17) + '" width="' + w + '" height="9" fill="#8f1f1a"/>' +
                '<rect x="' + (x + 7) + '" y="' + (y + h / 2 - 12) + '" width="' + (w - 14) + '" height="24" rx="4" fill="#f4e8c8"/>' +
                '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 7) + '" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="17" fill="#b3261e" stroke="none">TNT</text></g>';
        }
        return '<svg viewBox="0 0 260 250" aria-hidden="true"><defs><linearGradient id="rg' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b08a62"/><stop offset="1" stop-color="#5b4430"/></linearGradient></defs>' +
            '<ellipse cx="130" cy="244" rx="124" ry="7" fill="#000" opacity=".3"/>' +
            rocha('M16 244Q4 172 48 142Q94 120 126 152Q146 194 140 244Z', 'M30 172Q40 150 72 146Q50 160 46 184Z', -150, -10, -240) +
            rocha('M118 244Q110 162 158 132Q214 112 240 158Q258 204 250 244Z', 'M150 160Q168 140 204 136Q174 150 164 172Z', 160, -20, 250) +
            rocha('M58 152Q68 92 120 80Q172 74 190 122Q198 150 180 170Q120 184 58 152Z', 'M84 112Q100 94 130 92Q108 102 98 124Z', -40, -120, -200) +
            rocha('M130 122Q140 72 180 64Q222 64 232 106Q236 130 212 144Q165 152 130 122Z', 'M160 90Q176 76 202 78Q180 86 172 102Z', 60, -130, 220) +
            rocha('M0 244Q2 217 24 212Q48 214 54 244Z', '', -120, -30, -260) + rocha('M206 244Q208 216 230 210Q252 212 258 244Z', '', 130, -30, 260) +
            barril(92, 176, 58, 68) + barril(152, 190, 52, 54) +
            '<path class="pavio" d="M20 232Q40 214 52 192Q72 152 98 178" fill="none" stroke="#efdcab" stroke-width="5" stroke-linecap="round" pathLength="100"/>' +
            '<g class="fogo"><circle r="12" fill="#ff9a1f" opacity=".5"/><circle r="6" fill="#ffe27a"/><circle r="3" fill="#fff"/>' +
            '<animateMotion class="mov-pavio" dur=".9s" begin="indefinite" fill="freeze" path="M20 232Q40 214 52 192Q72 152 98 178"/></g>' +
            '<circle class="flash" cx="130" cy="175" r="30" fill="#fff3b0"/></svg>';
    },
    lava: function (id) {
        const bolhas = [[60, 70, 6], [130, 84, 8], [200, 66, 5], [270, 88, 7], [340, 72, 6], [100, 98, 4], [310, 100, 5]].map(function (b, i) {
            return '<circle class="bolha" cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" style="--d:' + (1.6 + i * 0.37).toFixed(2) + 's"/>';
        }).join('');
        const pool = 'M16 52Q70 32 132 46T270 44T406 52L404 104Q300 128 210 120Q112 128 18 104Z';
        return '<div class="brilho-lava"></div>' +
            '<svg viewBox="0 0 420 140" aria-hidden="true"><defs>' +
            '<linearGradient id="lv' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff09a"/><stop offset=".3" stop-color="#ffb52e"/><stop offset=".65" stop-color="#ff6a1a"/><stop offset="1" stop-color="#c0271a"/></linearGradient>' +
            '<linearGradient id="ob' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a5a82"/><stop offset="1" stop-color="#1e1830"/></linearGradient></defs>' +
            '<path d="M4 46Q60 18 130 34T270 30T416 46L418 110Q300 140 210 130Q110 140 2 110Z" fill="#1a1020" stroke="#0b0710" stroke-width="7" stroke-linejoin="round"/>' +
            '<path class="lava-pool" d="' + pool + '" fill="url(#lv' + id + ')"/>' +
            '<path class="obs-pool" d="' + pool + '" fill="url(#ob' + id + ')" stroke="#0b0710" stroke-width="3"/>' +
            '<g class="ondas" fill="none" stroke="#fff3a6" stroke-width="5" stroke-linecap="round" opacity=".85"><path d="M30 64Q70 54 110 64T190 64T270 64T350 64T400 64"/><path d="M40 90Q90 80 140 90T240 90T340 90" stroke="#ffd25a" stroke-width="4"/></g>' +
            '<g class="bolhas" fill="#fff3a6" stroke="#ff8a1f" stroke-width="2">' + bolhas + '</g>' +
            '<g class="rachaduras" fill="none" stroke="#ff8a1f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M40 70L90 80L120 66L170 92L210 70"/><path d="M230 74L280 96L320 70L380 84"/><path d="M110 98L150 110L200 100"/></g></svg>';
    },
    portal: function (id) {
        let runas = '';
        for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2;
            runas += '<rect class="runa" x="-4" y="-9" width="8" height="18" rx="3" transform="translate(' + (115 + 96 * Math.cos(a)).toFixed(1) + ' ' + (150 + 128 * Math.sin(a)).toFixed(1) + ') rotate(' + ((a * 180 / Math.PI) + 90).toFixed(0) + ')"/>';
        }
        return '<div class="portal-luz"></div>' +
            '<div class="portal-vortice"><div class="giro"></div><div class="nucleo"></div></div>' +
            '<svg viewBox="0 0 230 300" aria-hidden="true">' +
            '<ellipse cx="115" cy="292" rx="100" ry="8" fill="#000" opacity=".3"/>' +
            '<ellipse cx="115" cy="150" rx="96" ry="128" fill="none" stroke="#10131f" stroke-width="32"/>' +
            '<ellipse cx="115" cy="150" rx="96" ry="128" fill="none" stroke="#6b7399" stroke-width="23"/>' +
            '<ellipse cx="112" cy="147" rx="96" ry="128" fill="none" stroke="#aab3dc" stroke-width="5" opacity=".6"/>' +
            '<g stroke="#10131f" stroke-width="3" fill="#2a3050">' + runas + '</g></svg>';
    },
    // ---- Laboratório de Funções (Mundo 3) ----
    cabos: function (id) {
        function cabo(cls, d, x) {
            return '<g class="' + cls + '"><path d="' + d + '" fill="none" stroke="#10131f" stroke-width="24" stroke-linecap="round"/>' +
                '<path d="' + d + '" fill="none" stroke="#ff8a1f" stroke-width="16" stroke-linecap="round"/>' +
                '<path d="' + d + '" fill="none" stroke="#ffe27a" stroke-width="16" stroke-dasharray="9 24"/>' +
                '<rect x="' + (x - 10) + '" y="214" width="20" height="28" rx="4" fill="#e3b06a" stroke="#10131f" stroke-width="4"/></g>';
        }
        return '<svg viewBox="0 0 200 300" aria-hidden="true">' +
            '<ellipse cx="100" cy="292" rx="92" ry="7" fill="#000" opacity=".3"/>' +
            '<g class="cabos-g">' + cabo('cabo-a', 'M62 -400 L62 -60 C62 60 92 120 78 214', 78) + cabo('cabo-b', 'M138 -400 L138 -60 C138 60 108 120 122 214', 122) + '</g>' +
            '<g class="arcos">' +
              '<polyline class="arco" points="86,244 96,262 82,270 98,284 90,290"/>' +
              '<polyline class="arco" points="114,244 104,260 120,272 102,284 112,290"/>' +
              '<polyline class="arco" points="88,236 100,226 94,244 108,230 100,242 114,236"/>' +
              '<polyline class="arco" points="92,244 78,262 110,266 70,284"/>' +
            '</g>' +
            '<ellipse cx="100" cy="290" rx="46" ry="5" fill="#2a1d12" opacity=".55"/></svg>';
    },
    prensa: function (id) {
        return '<svg viewBox="0 0 240 300" aria-hidden="true"><defs>' +
            '<linearGradient id="pa' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c3cbe0"/><stop offset=".5" stop-color="#7a86a8"/><stop offset="1" stop-color="#3d4560"/></linearGradient>' +
            '<pattern id="pp' + id + '" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="11" height="22" fill="#ffd23f"/><rect x="11" width="11" height="22" fill="#1b1d2b"/></pattern></defs>' +
            '<ellipse cx="120" cy="292" rx="108" ry="8" fill="#000" opacity=".3"/>' +
            '<g class="mov" stroke="#10131f" stroke-width="5" stroke-linejoin="round">' +
              '<rect x="44" y="-1200" width="22" height="1320" fill="url(#pa' + id + ')"/><rect x="174" y="-1200" width="22" height="1320" fill="url(#pa' + id + ')"/>' +
              '<rect x="14" y="84" width="212" height="28" rx="9" fill="#4a5470"/>' +
              '<rect x="24" y="106" width="192" height="180" rx="10" fill="url(#pa' + id + ')"/>' +
              '<rect x="24" y="226" width="192" height="36" fill="url(#pp' + id + ')"/>' +
              '<g fill="#2a3050" stroke-width="3"><circle cx="40" cy="122" r="5"/><circle cx="200" cy="122" r="5"/><circle cx="40" cy="272" r="5"/><circle cx="200" cy="272" r="5"/></g>' +
              '<rect x="64" y="128" width="112" height="64" rx="9" fill="#12172a" stroke="#7a86ad" stroke-width="3"/>' +
              '<text class="t-bloq" x="120" y="167" text-anchor="middle" font-family="Consolas,monospace" font-weight="900" font-size="19" fill="#ff6b6b">TRAVADO</text>' +
              '<text class="t-livre" x="120" y="167" text-anchor="middle" font-family="Consolas,monospace" font-weight="900" font-size="22" fill="#4dffa0">LIVRE</text>' +
              '<circle class="lampada-p" cx="120" cy="206" r="10"/>' +
            '</g></svg>';
    },
    tanque: function (id) {
        let bolhas = '';
        [[62, 250, 7], [98, 262, 5], [134, 246, 8], [166, 258, 6], [80, 236, 5], [150, 232, 6]].forEach(function (b, i) {
            bolhas += '<circle class="bolha-t" cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" style="--d:' + (1.5 + i * 0.4).toFixed(1) + 's"/>';
        });
        return '<svg viewBox="0 0 220 300" aria-hidden="true"><defs>' +
            '<linearGradient id="tg' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6ff5a"/><stop offset=".5" stop-color="#8dff3a"/><stop offset="1" stop-color="#1fbf5a"/></linearGradient>' +
            '<linearGradient id="tv' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset=".35" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#bfe8ff" stop-opacity=".3"/></linearGradient></defs>' +
            '<ellipse cx="110" cy="292" rx="100" ry="8" fill="#000" opacity=".3"/>' +
            '<ellipse class="poca" cx="110" cy="284" rx="96" ry="9" fill="#8dff3a" opacity=".9"/>' +
            '<g class="goo"><rect x="32" y="52" width="156" height="220" rx="12" fill="url(#tg' + id + ')"/>' +
              '<path d="M32 58Q58 46 84 58T136 58T188 56L188 70L32 70Z" fill="#f4ffa0"/></g>' +
            '<g class="bolhas-t" fill="#eaffb0" stroke="#3a8f20" stroke-width="2">' + bolhas + '</g>' +
            '<g class="vidro-g">' +
              '<rect x="26" y="40" width="168" height="232" rx="22" fill="url(#tv' + id + ')" stroke="#d7efff" stroke-width="5"/>' +
              '<rect x="42" y="62" width="10" height="170" rx="5" fill="#fff" opacity=".55"/>' +
              '<rect x="14" y="16" width="192" height="32" rx="12" fill="#5a6584" stroke="#10131f" stroke-width="5"/>' +
              '<rect x="70" y="140" width="80" height="58" rx="8" fill="#12172a" stroke="#10131f" stroke-width="4"/>' +
              '<path d="M110 148L140 190L80 190Z" fill="#ffd23f" stroke="#10131f" stroke-width="3" stroke-linejoin="round"/>' +
              '<rect x="107" y="160" width="6" height="16" rx="2" fill="#10131f"/><circle cx="110" cy="183" r="3.5" fill="#10131f"/></g>' +
            '<rect x="6" y="268" width="208" height="24" rx="8" fill="#3a4254" stroke="#10131f" stroke-width="5"/></svg>';
    },
    plasma: function (id) {
        let raios = '';
        [[0, -62, 0, -118], [60, -22, 108, -40], [-60, -22, -108, -40], [44, 46, 90, 100], [-44, 46, -90, 100]].forEach(function (r) {
            const mx = (r[0] + r[2]) / 2, my = (r[1] + r[3]) / 2;
            raios += '<polyline class="raio" points="' + (120 + r[0]) + ',' + (140 + r[1]) + ' ' + (120 + mx + 10) + ',' + (140 + my - 8) + ' ' + (120 + mx - 8) + ',' + (140 + my + 8) + ' ' + (120 + r[2]) + ',' + (140 + r[3]) + '"/>';
        });
        return '<svg viewBox="0 0 240 260" aria-hidden="true"><defs>' +
            '<radialGradient id="po' + id + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#ff9cf8"/><stop offset=".7" stop-color="#b13bff"/><stop offset="1" stop-color="#4a1590"/></radialGradient></defs>' +
            '<ellipse cx="120" cy="254" rx="104" ry="7" fill="#000" opacity=".3"/>' +
            '<ellipse class="onda" cx="120" cy="140" rx="70" ry="70" fill="none" stroke="#ff9cf8" stroke-width="8"/>' +
            '<g class="raios">' + raios + '</g>' +
            '<g class="orbe"><circle cx="120" cy="140" r="62" fill="url(#po' + id + ')"/>' +
              '<g class="nucleo-p"><circle cx="120" cy="140" r="40" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="26 18" opacity=".8"/></g>' +
              '<circle cx="104" cy="122" r="12" fill="#fff" opacity=".55"/></g>' +
            '<g stroke="#10131f" stroke-width="5" stroke-linejoin="round">' +
              '<rect x="6" y="96" width="34" height="156" rx="9" fill="#5a6584"/><rect x="200" y="96" width="34" height="156" rx="9" fill="#5a6584"/>' +
              '<rect x="6" y="224" width="34" height="28" rx="6" fill="#2b3140"/><rect x="200" y="224" width="34" height="28" rx="6" fill="#2b3140"/>' +
              '<circle class="luz-p" cx="23" cy="84" r="11"/><circle class="luz-p" cx="217" cy="84" r="11"/></g></svg>';
    },
    // Terminal de Deploy: monitor retrô que "compila" o mundo e leva o robô para a próxima fase
    terminal: function (id) {
        const linhas = [
            '$ python deploy.py',
            'for bug in bugs: fix(bug)',
            'Compilando... 100%',
            '✔ Build concluído',
            '>>> proximo_mundo()'
        ];
        const html = linhas.map(function (t, i) {
            return '<div class="term-linha' + (i === linhas.length - 1 ? ' final' : '') + '" style="--ch:' + t.length + ';--i:' + i +
                ';animation-timing-function:steps(' + t.length + ',end)">' + t + '</div>';
        }).join('');
        return '<div class="term-luz"></div>' +
            '<svg viewBox="0 0 240 300" aria-hidden="true">' +
            '<ellipse cx="120" cy="292" rx="96" ry="8" fill="#000" opacity=".3"/>' +
            '<rect x="58" y="272" width="124" height="18" rx="7" fill="#2b3140" stroke="#10131f" stroke-width="5"/>' +
            '<rect x="100" y="232" width="40" height="44" fill="#3a4254" stroke="#10131f" stroke-width="5"/>' +
            '<rect x="6" y="6" width="228" height="234" rx="18" fill="#4a5368" stroke="#10131f" stroke-width="7"/>' +
            '<rect x="12" y="11" width="216" height="6" rx="3" fill="#aab3dc" opacity=".45"/>' +
            '<rect x="16" y="20" width="208" height="206" rx="10" fill="#161a28"/>' +
            '<text x="24" y="236" font-size="9" font-family="monospace" font-weight="bold" fill="#aab3dc">DEPLOY</text>' +
            '<circle class="led" cx="206" cy="233" r="4"/></svg>' +
            '<div class="term-tela"><div class="term-scan"></div>' +
            '<div class="term-linha idle">&gt; aguardando<span class="cursor">_</span></div>' + html + '</div>';
    }
};

function criarObjeto(tipo, xMundo) {
    const el = document.createElement('div');
    el.className = 'objeto objeto-' + tipo;
    el.dataset.tipo = tipo;
    el.style.setProperty('--wx', xMundo.toFixed(2));
    el.innerHTML = OBJETOS_HTML[tipo](contadorObjetos++);
    mundo.appendChild(el);
    return el;
}

function tremerTela() {
    palco.classList.remove('tremor');
    void palco.offsetWidth;
    palco.classList.add('tremor');
    setTimeout(function () { palco.classList.remove('tremor'); }, 400);
}

function abrirObjeto(el) {
    const tipo = el.dataset.tipo;
    el.classList.add('aberto');
    if (tipo === 'laser') {
        Som.laser();
        particulas(el, 18, { cores: ['#ffe27a', '#ffffff', '#ff9a1f'], x: 50, y: 45, espalha: 60, espalhaY: 50, dist: 90, tam: 7, dur: 0.9 });
    } else if (tipo === 'tnt') {
        Som.pavio();
        const mov = el.querySelector('.mov-pavio');
        if (mov && mov.beginElement) mov.beginElement();
        setTimeout(function () {
            el.classList.add('explodiu');
            Som.explosao();
            tremerTela();
            particulas(el, 16, { cores: ['#ffe27a', '#ff9a1f', '#ff5a14'], x: 50, y: 62, espalha: 30, dist: 150, tam: 16, dur: 0.8 });
            particulas(el, 14, { cores: ['rgba(60,50,60,.75)', 'rgba(110,100,110,.7)'], x: 50, y: 62, espalha: 60, dist: 70, sobe: -90, tam: 46, dur: 1.5, fumaca: true });
        }, 900);
    } else if (tipo === 'lava') {
        Som.lava();
        particulas(el, 14, { cores: ['rgba(255,255,255,.75)', 'rgba(205,215,235,.65)'], x: 50, y: 40, espalha: 80, dist: 40, sobe: -150, tam: 30, dur: 1.9, fumaca: true });
    } else if (tipo === 'cabos') {
        Som.cabos();
        particulas(el, 20, { cores: ['#e8fbff', '#38e1ff', '#ffe27a'], x: 50, y: 82, espalha: 30, dist: 100, tam: 7, dur: 0.9 });
    } else if (tipo === 'prensa') {
        Som.prensa();
        [0.35, 0.6, 0.85].forEach(function (a, i) {
            setTimeout(function () {
                particulas(el, 8, { cores: ['rgba(235,245,255,.85)', 'rgba(190,210,235,.7)'], x: 20 + i * 30, y: 88, espalha: 25, dist: 40, sobe: -80, tam: 34, dur: 1.4, fumaca: true });
            }, a * 1000);
        });
    } else if (tipo === 'tanque') {
        Som.tanque();
        setTimeout(function () {
            particulas(el, 18, { cores: ['#e6ff5a', '#8dff3a', '#ffffff'], x: 50, y: 60, espalha: 50, espalhaY: 60, dist: 100, tam: 8, dur: 1 });
        }, 2400);
    } else if (tipo === 'plasma') {
        Som.plasma();
        setTimeout(function () {
            particulas(el, 22, { cores: ['#ff9cf8', '#ffffff', '#b13bff', '#38e1ff'], x: 50, y: 54, espalha: 10, dist: 150, tam: 9, dur: 1 });
        }, 650);
    } else if (tipo === 'terminal') {
        Som.terminal();
        setTimeout(function () {
            particulas(el, 24, { cores: ['#5dff8a', '#c9ffd9', '#ffffff'], x: 50, y: 40, espalha: 30, dist: 120, tam: 8, dur: 1.1 });
        }, 2300);
    } else if (tipo === 'portal') {
        Som.portal();
        setTimeout(function () {
            particulas(el, 22, { cores: ['#00e5ff', '#ff3df2', '#ffffff', '#7b2ff7'], x: 50, y: 50, espalha: 20, dist: 130, tam: 9, dur: 1.2 });
        }, 500);
    }
}

// Posição e características de todos os bugs do mundo, da esquerda para a direita
const modelosBugs = [];
trechos.forEach(function (t) {
    t.bugs.forEach(function (b) {
        modelosBugs.push({
            x: t.inicio + b.x * t.largura,
            ponte: b.ponte || null,
            objeto: b.objeto || null,
            surpresa: !!b.surpresa,
            esconde: b.esconde || null,
            trecho: t
        });
    });
});

// Cada bug tem uma cor diferente (arquivos em static/)
const BUG_IMAGENS = ['bug.png', 'bug_laranja.png', 'bug_vermelho.png', 'bug_verde.png', 'bug_rosa.png'];

// Pontes que o robô atravessa: o tabuleiro é curvo, então os pés descem no meio e sobem nas pontas
// (prof = quanto o meio afunda, em unidades; já inclui a margem transparente embaixo da imagem do robô)
const pontesAndar = [];

// Um bug para cada desafio, na ordem
const bugs = DESAFIOS.map(function (desafio, i) {
    const modelo = modelosBugs[i] || { x: LARGURA_MUNDO - 30, ponte: null, surpresa: false, esconde: null, trecho: null };
    const xBug = modelo.x;

    const el = document.createElement('div');
    el.className = 'bug';
    el.style.setProperty('--wx', xBug);

    const corpo = document.createElement('div');
    corpo.className = 'bug-corpo';
    const img = document.createElement('img');
    img.src = URL_ESTATICOS + BUG_IMAGENS[(i + (MUNDO_ID - 1) * 2) % BUG_IMAGENS.length];   // cada mundo começa numa cor
    img.alt = 'Bug no caminho';
    corpo.appendChild(img);
    el.appendChild(corpo);
    mundo.appendChild(el);

    let ponteEl = (modelo.ponte && modelo.trecho) ? criarPonte(modelo.ponte, modelo.trecho) : null;
    if (modelo.objeto) ponteEl = criarObjeto(modelo.objeto.tipo, modelo.objeto.fimDoMundo ? LARGURA_MUNDO - 9 : xBug + (modelo.objeto.dx === undefined ? 8 : modelo.objeto.dx));
    if (ponteEl && modelo.ponte) {
        const iniPonte = modelo.trecho.inicio + modelo.ponte.x * modelo.trecho.largura;
        pontesAndar.push({
            ini: iniPonte,
            fim: iniPonte + modelo.ponte.w * modelo.trecho.largura,
            prof: modelo.ponte.prof || 1.1,
            desce: modelo.ponte.desce || 0   // quanto o tabuleiro fica abaixo do chão nas pontas
        });
    }

    const vivo = !concluidos.includes(desafio.id);
    if (!vivo) {
        el.style.display = 'none';
        if (ponteEl) ponteEl.classList.add(modelo.objeto ? 'aberto-fixo' : 'pronta');   // já aberto/reconstruído em jogos salvos
    } else if (modelo.surpresa || modelo.esconde) {
        el.classList.add('oculto');
    }

    return {
        id: desafio.id, desafio: desafio, x: xBug, parada: xBug - 16, el: el, vivo: vivo,
        ponte: ponteEl, objeto: !!modelo.objeto, surpresa: modelo.surpresa, revelado: !modelo.surpresa && !modelo.esconde,
        esconde: modelo.esconde, esconderijo: null
    };
});

function proximoIndice() {
    return bugs.findIndex(function (b) { return b.vivo; });
}

function atualizarTopo() {
    tituloMundo.textContent = NOME_MUNDO + ' · Bugs derrotados: ' + concluidos.length + '/' + N;
    atualizarChips();
}

// ---------- Estado do jogo ----------
const VELOCIDADE = 20;           // unidades por segundo
const X_INICIAL = 5;
const X_MINIMO = 5;
// Mundos com um objeto final (ex.: Terminal de Deploy no Mundo 1) param o robô antes dele
const OBJETO_FINAL = { 1: 'terminal', 3: 'terminal' }[MUNDO_ID] || null;
const objetoFinalEl = OBJETO_FINAL ? criarObjeto(OBJETO_FINAL, LARGURA_MUNDO - 10) : null;
const X_FINAL = LARGURA_MUNDO - (OBJETO_FINAL ? 24 : 8);
const POSICAO_NA_TELA = 35;      // onde o robô fica na tela (em unidades)

let estado = 'andando';          // andando | desafio | fim
let movendo = 0;                 // -1, 0 ou 1
let direcaoOlhar = 1;
let indiceAtual = -1;
let desafioAtual = null;
let ultimoTempo = null;
let dicaInicialAtiva = concluidos.length === 0;
let timerDica = null;

const indiceInicial = proximoIndice();
let x;
if (indiceInicial === -1) {
    x = X_FINAL;
} else if (indiceInicial === 0) {
    x = X_INICIAL;
} else {
    x = bugs[indiceInicial - 1].parada;
}

// ---------- Pulo e blocos de código ----------
const GRAVIDADE = 237.5;         // unidades/s²
const VEL_PULO = 95;             // unidades/s (o pulo chega a 19 unidades de altura)
const MEIA_LARGURA_ROBO = 1.6;   // metade da largura do corpo do robô
const LARGURA_BLOCO = 5.5;
// Caminhada livre antes do primeiro bloco, em unidades (1 unidade = 1% da largura da tela).
// 90 unidades ≈ 30 cm num notebook comum. Aumente para andar mais, diminua para o bloco vir antes.
const DISTANCIAS_PRIMEIRO_BLOCO = { 1: 90, 2: 40, 3: 40 };   // por mundo (a partir do Mundo 2 o aluno já sabe pular)
const DISTANCIA_PRIMEIRO_BLOCO = DISTANCIAS_PRIMEIRO_BLOCO[MUNDO_ID] || 90;
const PCT_POR_UNIDADE = 1.78;    // 1 unidade na vertical = 1,78% da altura do palco

let jy = 0;                      // altura dos pés do robô acima do chão (unidades)
let vy = 0;                      // velocidade vertical
let noChao = true;
let chaoAtual = 0;               // altura da superfície sob o robô (0 = chão, ou o topo de um bloco)
let jaPulou = false;
try {
    jaPulou = localStorage.getItem('cacaAoBug.pulou') === '1';
} catch (erro) {
    // ignora
}
let dicaPuloMostrada = false;

// Blocos entre um bug e o seguinte (nunca em cima de pontes nem do ponto onde o robô enfrenta o bug)
const obstaculos = [];
(function gerarObstaculos() {
    // Símbolos dos blocos de cada mundo (no Mundo 2, palavras e operadores das decisões)
    const MODELOS_BLOCOS = {
        1: [
            { h: 5,   simbolo: '{ }', cor: 'azul' },
            { h: 5,   simbolo: 'if',  cor: 'amarelo' },
            { h: 6.5, simbolo: '[ ]', cor: 'verde' },
            { h: 5,   simbolo: '==',  cor: 'vermelho' },
            { h: 6.5, simbolo: '( )', cor: 'azul' }
        ],
        2: [
            { h: 5,   simbolo: 'if',   cor: 'azul' },
            { h: 5,   simbolo: '>=',   cor: 'amarelo' },
            { h: 6.5, simbolo: 'else', cor: 'verde' },
            { h: 5,   simbolo: '!=',   cor: 'vermelho' },
            { h: 6.5, simbolo: 'and',  cor: 'azul' }
        ],
        3: [
            { h: 5,   simbolo: 'def',    cor: 'azul' },
            { h: 5,   simbolo: '( )',    cor: 'amarelo' },
            { h: 6.5, simbolo: 'return', cor: 'verde' },
            { h: 5,   simbolo: ':',      cor: 'vermelho' },
            { h: 6.5, simbolo: 'n',      cor: 'azul' }
        ]
    };
    const modelos = MODELOS_BLOCOS[MUNDO_ID] || MODELOS_BLOCOS[1];
    let n = 0;
    for (let i = 0; i <= bugs.length; i++) {
        let ini;
        if (i === 0) {
            ini = X_INICIAL + 5;
        } else {
            ini = bugs[i - 1].objeto ? bugs[i - 1].x + 20 : (bugs[i - 1].ponte ? bugs[i - 1].x + 12 : bugs[i - 1].x + 6);
        }
        const fim = i < bugs.length ? bugs[i].parada - (i === 0 ? 6 : 9) : X_FINAL - 9;
        const tam = fim - ini;
        if (tam >= (i === 0 ? 4 : 8)) {
            // trechos longos recebem mais blocos (um a cada ~30 unidades)
            const longo = MUNDO_ID > 1;   // o Mundo 1 mantém o ritmo original
            const qtd = tam >= 40 ? (longo ? Math.max(2, Math.min(5, Math.round(tam / 30))) : 2) : 1;
            for (let g = 0; g < qtd; g++) {
                const pos = ini + tam * (qtd === 1 ? 0.5 : (longo ? (g + 0.5) / qtd : (g === 0 ? 0.3 : 0.75)));
                if (pos - X_INICIAL < DISTANCIA_PRIMEIRO_BLOCO) continue;   // ainda é a caminhada livre
                const m = modelos[n % modelos.length];
                n++;
                obstaculos.push({ x: pos, w: LARGURA_BLOCO, h: m.h, simbolo: m.simbolo, cor: m.cor });
                // de vez em quando, dois blocos juntos (uma "escadinha") para variar o pulo
                if (longo && qtd >= 3 && n % 3 === 0 && pos + 12 < fim) {
                    const m2 = modelos[n % modelos.length];
                    n++;
                    obstaculos.push({ x: pos + LARGURA_BLOCO + 3, w: LARGURA_BLOCO, h: m2.h + 1.5, simbolo: m2.simbolo, cor: m2.cor });
                }
            }
        }
    }
})();

// Esconderijos dos bugs surpresa: o bug fica atrás de um enfeite (moita, cogumelo, caixote) ou de um bloco
const DECORACOES_SVG = {
    moita: '<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="84" rx="52" ry="6" fill="rgba(0,0,0,.3)"/><circle cx="30" cy="58" r="26" fill="#2f8f3a"/><circle cx="62" cy="46" r="32" fill="#37a844"/><circle cx="92" cy="60" r="24" fill="#2f8f3a"/><circle cx="46" cy="40" r="14" fill="#4cc65a" opacity=".7"/><circle cx="78" cy="34" r="10" fill="#4cc65a" opacity=".6"/><circle cx="26" cy="52" r="3.5" fill="#ff5c7a"/><circle cx="88" cy="50" r="3.5" fill="#ffd84d"/><circle cx="60" cy="62" r="3.5" fill="#ff5c7a"/></svg>',
    cogumelo: '<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="94" rx="50" ry="5" fill="rgba(0,0,0,.35)"/><rect x="50" y="52" width="20" height="40" rx="9" fill="#d9c8ff"/><path d="M6 56 C6 18 40 6 60 6 C82 6 114 18 114 56 C114 62 100 64 60 64 C20 64 6 62 6 56Z" fill="#7b4fd6"/><circle cx="34" cy="34" r="8" fill="#c9b3ff"/><circle cx="68" cy="24" r="6" fill="#c9b3ff"/><circle cx="90" cy="42" r="7" fill="#c9b3ff"/><circle cx="58" cy="46" r="4" fill="#c9b3ff"/><path d="M6 56 C6 18 40 6 60 6 C82 6 114 18 114 56" fill="none" stroke="#a98bff" stroke-width="3" opacity=".7"/></svg>',
    caixote: '<svg viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="55" cy="95" rx="48" ry="5" fill="rgba(0,0,0,.35)"/><rect x="8" y="14" width="94" height="78" rx="6" fill="#5b6b7b" stroke="#222d38" stroke-width="5"/><rect x="8" y="14" width="94" height="14" rx="4" fill="#7d8fa1"/><path d="M14 34 L96 88 M96 34 L14 88" stroke="#3d4a58" stroke-width="7"/><circle cx="18" cy="22" r="3" fill="#222d38"/><circle cx="92" cy="22" r="3" fill="#222d38"/><rect x="40" y="46" width="30" height="18" rx="3" fill="#ffd84d" stroke="#222d38" stroke-width="3"/><text x="55" y="60" text-anchor="middle" font-family="Consolas,monospace" font-weight="900" font-size="13" fill="#222d38">01</text></svg>'
};
(function criarEsconderijos() {
    bugs.forEach(function (b) {
        if (!b.esconde) return;
        let ex = b.parada - 7;
        const e = { x: ex, bloco: b.esconde === 'bloco', el: null, raio: 3.5 };
        // remove blocos e chips que estariam em cima do esconderijo
        for (let i = obstaculos.length - 1; i >= 0; i--) {
            if (Math.abs(obstaculos[i].x - ex) < 11) obstaculos.splice(i, 1);
        }
        if (e.bloco) {
            const modelos = [{ h: 5, simbolo: '?', cor: 'amarelo' }];
            const m = modelos[0];
            const o = { x: ex, w: LARGURA_BLOCO, h: m.h, simbolo: m.simbolo, cor: m.cor, esconde: true };
            obstaculos.push(o);
            e.obstaculo = o;
            e.raio = 5.2;
        } else {
            e.decor = b.esconde;
        }
        b.esconderijo = e;
    });
    obstaculos.sort(function (a, b) { return a.x - b.x; });
})();

obstaculos.forEach(function (o) {
    const el = document.createElement('div');
    el.className = 'bloco ' + o.cor;
    o.el = el;
    el.style.setProperty('--wx', o.x.toFixed(2));
    el.style.setProperty('--bw', o.w);
    el.style.setProperty('--bh', o.h);
    el.textContent = o.simbolo;
    // palavras compridas (return, else) diminuem a fonte para caber dentro do bloco
    if (o.simbolo.length > 3) el.style.fontSize = Math.min(2, (o.w * 0.8) / (o.simbolo.length * 0.62)).toFixed(2) + 'cqw';
    mundo.appendChild(el);
});

// Esconderijos decorativos (moita, cogumelo, caixote) e ligação com os blocos escondedores
bugs.forEach(function (b) {
    const e = b.esconderijo;
    if (!e) return;
    if (e.obstaculo) {
        e.el = e.obstaculo.el;
        if (!b.vivo) e.el.classList.add('rachado');
        return;
    }
    const el = document.createElement('div');
    el.className = 'esconderijo ' + e.decor;
    el.style.setProperty('--wx', e.x.toFixed(2));
    el.innerHTML = DECORACOES_SVG[e.decor] || '';
    mundo.appendChild(el);
    e.el = el;
});

// Anda na horizontal sem atravessar blocos (só passa se estiver por cima deles)
function moverHorizontal(novoX, sentido) {
    obstaculos.forEach(function (o) {
        if (jy >= o.h - 0.4) return;
        const esq = o.x - o.w / 2;
        const dir = o.x + o.w / 2;
        if (sentido > 0 && x + MEIA_LARGURA_ROBO <= esq + 0.01 && novoX + MEIA_LARGURA_ROBO > esq) {
            novoX = esq - MEIA_LARGURA_ROBO;
        } else if (sentido < 0 && x - MEIA_LARGURA_ROBO >= dir - 0.01 && novoX - MEIA_LARGURA_ROBO < dir) {
            novoX = dir + MEIA_LARGURA_ROBO;
        }
    });
    return novoX;
}

// Gravidade, pulo e pouso (roda sempre, para o robô cair mesmo com a janela do desafio aberta)
function atualizarFisica(dt) {
    chaoAtual = 0;
    pontesAndar.forEach(function (p) {
        if (x > p.ini && x < p.fim) {
            const t = (x - p.ini) / (p.fim - p.ini);
            // 0 nas pontas, desce com uma rampa curta até o tabuleiro e afunda mais no meio
            const rampa = Math.min(1, t / 0.12, (1 - t) / 0.12);
            const suave = rampa * rampa * (3 - 2 * rampa);
            chaoAtual = Math.min(chaoAtual, -(p.desce * suave + p.prof * 4 * t * (1 - t)));
        }
    });
    obstaculos.forEach(function (o) {
        if (Math.abs(x - o.x) < o.w / 2 + MEIA_LARGURA_ROBO * 0.6 && jy >= o.h - 0.5) {
            chaoAtual = Math.max(chaoAtual, o.h);
        }
    });
    const estavaNoAr = !noChao;
    // descendo a curva da ponte, o robô acompanha o tabuleiro sem "cair"
    if (noChao && jy > chaoAtual && jy - chaoAtual < 0.6) jy = chaoAtual;
    vy -= GRAVIDADE * dt;
    jy += vy * dt;
    if (jy <= chaoAtual) {
        const velocidadeQueda = vy;
        jy = chaoAtual;
        vy = 0;
        noChao = true;
        if (estavaNoAr && velocidadeQueda < -12) {
            Som.pouso();
            robo.classList.remove('pouso');
            void robo.offsetWidth;
            robo.classList.add('pouso');
        }
    } else {
        noChao = false;
    }
}

function pular() {
    if (estado !== 'andando' || !noChao) return;
    vy = VEL_PULO;
    noChao = false;
    Som.pulo();
    if (!jaPulou) {
        jaPulou = true;
        try {
            localStorage.setItem('cacaAoBug.pulou', '1');
        } catch (erro) {
            // ignora
        }
    }
}

// Soltar a tecla cedo faz um pulo mais curto (como no Mario)
function cortarPulo() {
    if (vy > 30) vy *= 0.5;
}

// ---------- Chips coletáveis ----------
// Grupos de chips em arco entre um bug e o seguinte (nunca dentro de um buraco)
const chips = [];
(function gerarChips() {
    let segIni = X_INICIAL + 6;
    for (let i = 0; i <= bugs.length; i++) {
        const segFim = i < bugs.length ? bugs[i].parada - 3 : X_FINAL - 4;
        const tam = segFim - segIni;
        if (tam >= 10) {
            const longo = true;
            // O Mundo 1 tem trechos curtos entre os bugs: grupos menores e mais seguidos para ter chips suficientes
            const grupos = MUNDO_ID === 1 ? Math.max(1, Math.round(tam / 13)) : (tam >= 45 ? Math.max(2, Math.min(5, Math.round(tam / 28))) : 1);
            const porGrupo = MUNDO_ID === 1 ? 5 : Math.max(3, Math.min(6, Math.round(tam / (grupos * 4.5))));
            for (let g = 0; g < grupos; g++) {
                const centro = segIni + tam * (grupos === 1 ? 0.5 : (longo ? (g + 0.5) / grupos : (g === 0 ? 0.3 : 0.72)));
                for (let k = 0; k < porGrupo; k++) {
                    const meio = (porGrupo - 1) / 2;
                    const arco = 1 - Math.pow((k - meio) / Math.max(meio, 1), 2);   // 0 nas pontas, 1 no centro
                    chips.push({ x: centro + (k - meio) * (MUNDO_ID === 1 ? 2.9 : 3.6), y: 43 + arco * 6, coletado: false, el: null });
                }
            }
        }
        if (i < bugs.length) segIni = bugs[i].x + 10;
    }
})();

// Chips que não ficam dentro de blocos; sobre cada bloco, um arco de chips que só se pega pulando
(function ajustarChipsComBlocos() {
    for (let i = chips.length - 1; i >= 0; i--) {
        if (obstaculos.some(function (o) { return Math.abs(chips[i].x - o.x) < 9; })) chips.splice(i, 1);
        else if (bugs.some(function (b) { return b.esconderijo && Math.abs(chips[i].x - b.esconderijo.x) < 6; })) chips.splice(i, 1);
    }
    obstaculos.forEach(function (o) {
        const topo = 30 + o.h * PCT_POR_UNIDADE;
        [[-3.8, 14], [0, 18], [3.8, 14]].forEach(function (p) {
            chips.push({ x: o.x + p[0], y: topo + p[1], coletado: false, el: null });
        });
    });
    chips.sort(function (a, b) { return a.x - b.x; });
})();

chips.forEach(function (c, i) {
    const el = document.createElement('div');
    el.className = 'chip';
    el.style.setProperty('--wx', c.x.toFixed(2));
    el.style.setProperty('--by', c.y.toFixed(1));
    const moeda = document.createElement('div');
    moeda.className = 'chip-moeda';
    moeda.textContent = '1';
    moeda.style.setProperty('--atraso-chip', (-(i % 5) * 0.3).toFixed(1) + 's');
    el.appendChild(moeda);
    mundo.appendChild(el);
    c.el = el;
    if (chipsColetados.includes(i)) {
        c.coletado = true;
        el.style.display = 'none';
    }
});

function pontosChips() {
    return Math.max(0, chipsColetados.length + chipsDeBonus - chipsPerdidos);
}
// Meta do mundo: 60% do total "típico" (chips do cenário + bônus de +3 por bug), com dois limites de justiça:
//  - quem responde tudo rápido ainda precisa de pelo menos 15% dos chips do cenário;
//  - quem responde tudo devagar nunca precisa de mais de 80% deles (sempre dá para passar).
function metaChips() {
    const c = chips.length;
    const bruta = Math.ceil(PORCENTAGEM_META * (c + N * BONUS_TIPICO));
    const piso = N * BONUS_MAX + Math.ceil(0.15 * c);
    const teto = N * BONUS_MINIMO + Math.floor(0.8 * c);
    return Math.max(piso, Math.min(bruta, teto));
}
function atualizarChips() {
    chipsNum.textContent = pontosChips() + '/' + metaChips();
    contadorChips.classList.toggle('meta-ok', pontosChips() >= metaChips());
    contadorChips.title = 'Chips: ' + chipsColetados.length + ' do cenário + ' + chipsDeBonus + ' de bônus - ' + chipsPerdidos + ' perdidos por erros. Meta do mundo: ' + metaChips();
}
function pulsarContador() {
    contadorChips.classList.remove('pulsa');
    void contadorChips.offsetWidth;
    contadorChips.classList.add('pulsa');
}

// Só marca o mundo como concluído ao chegar ao fim com a meta de chips
function persistir() {
    salvarProgresso(concluidos, false);
}

// Ao pegar chips, o salvamento espera um instante (evita travadinhas e atraso do som)
let timerSalvar = null;
function persistirDepois() {
    clearTimeout(timerSalvar);
    timerSalvar = setTimeout(persistir, 400);
}
window.addEventListener('pagehide', function () {
    if (timerSalvar !== null) { clearTimeout(timerSalvar); timerSalvar = null; persistir(); }
});

function coletarChips() {
    chips.forEach(function (c, i) {
        if (c.coletado || Math.abs(x - c.x) > 2.6) return;
        const pes = 30 + jy * PCT_POR_UNIDADE;     // pés do robô, em % da altura do palco
        const centro = c.y + 2;
        if (centro < pes - 3 || centro > pes + 23) return;
        c.coletado = true;
        chipsColetados.push(i);
        Som.chip();                    // o som vem primeiro, antes de qualquer mexida na tela
        c.el.classList.add('coletado');
        setTimeout(function () {
            c.el.style.display = 'none';
        }, 500);
        atualizarChips();
        pulsarContador();
        persistirDepois();
    });
}

function mostrarChipsFim() {
    fimChips.textContent = 'Chips: ' + chipsColetados.length + ' do cenário + ' + chipsDeBonus + ' de bônus' + (chipsPerdidos ? ' − ' + chipsPerdidos + ' por erros' : '') + ' = ' + pontosChips() + ' (meta: ' + metaChips() + ')';
}

// Fim do mundo: sem a meta de chips, o jogador precisa recomeçar o mundo
function mostrarFimDoMundo() {
    const faltam = metaChips() - pontosChips();
    fim.hidden = false;
    dicaControle.classList.add('oculta');
    mostrarChipsFim();
    if (faltam > 0) {
        fimTitulo.textContent = 'Faltaram ' + faltam + (faltam === 1 ? ' chip!' : ' chips!');
        fimTexto.textContent = 'Você chegou ao fim, mas precisa de ' + metaChips() + ' chips para passar de mundo. Recolha os chips do cenário e responda os desafios rápido para ganhar bônus. Vamos recomeçar!';
        btnRepetir.textContent = 'RECOMEÇAR O MUNDO';
        fim.classList.add('falhou');
        Som.erro();
        btnRepetir.focus();
    } else {
        fimTitulo.textContent = NOME_MUNDO + ' concluída!';
        fim.classList.remove('falhou');
        salvarProgresso(concluidos, true);
        Som.fim();
        btnMapa.focus();
    }
}

function alvoCamera() {
    return Math.max(0, Math.min(LARGURA_MUNDO - 100, x - POSICAO_NA_TELA));
}
let camera = alvoCamera();

function mostrarDica(texto, duracaoMs) {
    dicaControle.textContent = texto;
    dicaControle.classList.remove('oculta');
    clearTimeout(timerDica);
    if (duracaoMs) {
        timerDica = setTimeout(function () {
            dicaControle.classList.add('oculta');
        }, duracaoMs);
    }
}

atualizarTopo();

if (indiceInicial === -1) {
    estado = 'fim';
    mostrarFimDoMundo();
} else if (concluidos.length > 0) {
    mostrarDica('Seu progresso foi carregado. Siga em frente →', 3500);
} else {
    mostrarDica('Meta do mundo: ' + metaChips() + ' chips. Colete chips e resolva os bugs rápido!', 6000);
}

// ---------- Só desenha o que está perto da câmera ----------
// Chips e máquinas animadas fora da tela ficam escondidos: o mundo é comprido e isso deixa o jogo leve
const itensDaCena = [];
chips.forEach(function (c) { itensDaCena.push({ el: c.el, x: c.x, folga: 4, chip: c }); });
mundo.querySelectorAll('.objeto').forEach(function (el) {
    itensDaCena.push({ el: el, x: parseFloat(el.style.getPropertyValue('--wx')) || 0, folga: 14, chip: null });
});
let cameraVisiveis = -999;
function atualizarVisiveis(forcar) {
    if (!forcar && Math.abs(camera - cameraVisiveis) < 4) return;
    cameraVisiveis = camera;
    const ini = camera - 30;
    const fim = camera + 130;
    itensDaCena.forEach(function (it) {
        if (it.chip && it.chip.coletado) return;
        const fora = it.x + it.folga < ini || it.x - it.folga > fim;
        if (fora !== it.fora) {
            it.fora = fora;
            it.el.classList.toggle('fora', fora);
        }
    });
}

// ---------- Movimento do robô e da câmera ----------
let tempoPasso = 0;
function loop(tempo) {
    if (ultimoTempo === null) ultimoTempo = tempo;
    const dt = Math.min((tempo - ultimoTempo) / 1000, 0.05);
    ultimoTempo = tempo;

    let andou = false;

    if (estado === 'andando' && movendo !== 0) {
        direcaoOlhar = movendo;
        x = moverHorizontal(x + movendo * VELOCIDADE * dt, movendo);
        andou = true;

        if (dicaInicialAtiva) {
            dicaInicialAtiva = false;
            dicaControle.classList.add('oculta');
        }

        if (x < X_MINIMO) x = X_MINIMO;

        const alvo = proximoIndice();
        const limite = alvo === -1 ? X_FINAL : bugs[alvo].parada;
        if (x >= limite) {
            x = limite;
            andou = false;
            // só começa o encontro quando o robô está com os pés no chão
            if (noChao) {
                if (alvo === -1) {
                    terminarMundo();
                } else {
                    encontrarBug(alvo);
                }
            }
        }

        // Dica do pulo, enquanto o jogador ainda não pulou
        if (!jaPulou && !dicaPuloMostrada && estado === 'andando') {
            const proximoBloco = obstaculos.find(function (o) { return o.x > x; });
            if (proximoBloco && proximoBloco.x - x < 12) {
                dicaPuloMostrada = true;
                mostrarDica(TOQUE ? 'Toque em ⤒ para pular o bloco' : 'Aperte ESPAÇO (ou ↑) para pular o bloco', 5000);
            }
        }
    }

    atualizarFisica(dt);
    // passos leves enquanto o robô caminha no chão
    if (andou && noChao) {
        tempoPasso += dt;
        if (tempoPasso >= 0.3) { tempoPasso = 0; Som.passo(); }
    } else {
        tempoPasso = 0.15;
    }
    if (estado !== 'fim') coletarChips();

    // Bug surpresa: despenca quando o robô chega perto
    const proximo = proximoIndice();
    if (proximo !== -1) {
        const b = bugs[proximo];
        if (b.surpresa && !b.revelado && b.x - x <= 36) revelarBug(b);
        if (b.esconderijo && !b.revelado) {
            const dist = Math.abs(x - b.esconderijo.x);
            if (dist <= b.esconderijo.raio) revelarEscondido(b);
            else {
                const perto = dist <= 16;
                if (perto !== !!b.esconderijo.suspeito) {
                    b.esconderijo.suspeito = perto;
                    b.esconderijo.el.classList.toggle('suspeito', perto);
                    if (perto) Som.farfalhar();   // o esconderijo balança e faz barulho de folhas ou metal
                }
            }
        }
    }

    // A câmera acompanha o robô com um pequeno atraso suave
    camera += (alvoCamera() - camera) * Math.min(1, dt * 8);
    mundo.style.transform = 'translateX(calc(' + camera.toFixed(3) + ' * -1cqw))';
    atualizarVisiveis(false);

    robo.style.setProperty('--wx', x.toFixed(3));
    alerta.style.setProperty('--wx', x.toFixed(3));
    robo.style.setProperty('--dir', direcaoOlhar);
    robo.style.setProperty('--jy', jy.toFixed(3));
    robo.style.setProperty('--sy', chaoAtual.toFixed(3));
    robo.classList.toggle('andando', andou && noChao);
    robo.classList.toggle('pulando', !noChao);

    requestAnimationFrame(loop);
}
atualizarVisiveis(true);

// Pré-carrega e decodifica as imagens antes de começar: sem tela preta no meio do caminho
const imagensNaMemoria = [];
function precarregar(urls) {
    return Promise.all(urls.map(function (u) {
        return new Promise(function (resolve) {
            const im = new Image();
            imagensNaMemoria.push(im);        // mantém a imagem decodificada na memória
            im.onload = function () {
                (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(resolve);
            };
            im.onerror = resolve;
            im.src = u;
        });
    }));
}
(function iniciarQuandoPronto() {
    const telaCarregando = document.getElementById('carregando');
    // o aviso só aparece se o carregamento demorar (em conexão rápida ninguém chega a vê-lo)
    const timerAviso = setTimeout(function () {
        if (telaCarregando) telaCarregando.hidden = false;
    }, 500);
    const urls = [];
    trechos.forEach(function (t) {
        const u = URL_ESTATICOS + t.arquivo;
        if (urls.indexOf(u) === -1) urls.push(u);
    });
    BUG_IMAGENS.concat(['robo.png']).forEach(function (n) { urls.push(URL_ESTATICOS + n); });
    let comecou = false;
    function comecar() {
        if (comecou) return;
        comecou = true;
        clearTimeout(timerAviso);
        document.body.classList.remove('preparando');
        if (telaCarregando && !telaCarregando.hidden) {
            telaCarregando.classList.add('pronto');
            setTimeout(function () { telaCarregando.hidden = true; }, 400);
        }
        ultimoTempo = null;
        requestAnimationFrame(loop);
    }
    Promise.race([precarregar(urls), new Promise(function (r) { setTimeout(r, 12000); })]).then(comecar);
})();

// ---------- Controles ----------
const TOQUE = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

function teclaDePulo(tecla) {
    return tecla === ' ' || tecla === 'arrowup' || tecla === 'w';
}

document.addEventListener('keydown', function (e) {
    if (estado !== 'andando') return;
    const tecla = e.key.toLowerCase();
    if (tecla === 'arrowright' || tecla === 'd') {
        movendo = 1;
        e.preventDefault();
    } else if (tecla === 'arrowleft' || tecla === 'a') {
        movendo = -1;
        e.preventDefault();
    } else if (teclaDePulo(tecla)) {
        e.preventDefault();
        if (!e.repeat) pular();
    }
});

document.addEventListener('keyup', function (e) {
    const tecla = e.key.toLowerCase();
    if (teclaDePulo(tecla)) cortarPulo();
    if ((tecla === 'arrowright' || tecla === 'd') && movendo === 1) movendo = 0;
    if ((tecla === 'arrowleft' || tecla === 'a') && movendo === -1) movendo = 0;
});

function ligarBotaoAndar(botao, sentido) {
    botao.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        movendo = sentido;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (nome) {
        botao.addEventListener(nome, function () {
            if (movendo === sentido) movendo = 0;
        });
    });
}
ligarBotaoAndar(btnEsq, -1);
ligarBotaoAndar(btnDir, 1);

const btnPular = document.getElementById('btn-pular');
btnPular.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    pular();
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(function (nome) {
    btnPular.addEventListener(nome, cortarPulo);
});

// ---------- Encontro com um bug ----------
function encontrarBug(indice) {
    estado = 'desafio';
    movendo = 0;
    indiceAtual = indice;
    desafioAtual = bugs[indice].desafio;
    alerta.classList.add('ativo');
    Som.alerta();

    const b = bugs[indice];
    if (!b.revelado && b.esconderijo) revelarEscondido(b);   // por garantia: o bug sempre aparece antes do desafio
    setTimeout(function () {
        montarDesafio(desafioAtual);
        modal.hidden = false;
        iniciarCronometro();
        // o foco vai para a janela (e não para a 1ª peça, que parecia "selecionada")
        const janela = document.querySelector('.monitor');
        if (janela) janela.focus({ preventScroll: true });
    }, 500);
}

// O bug estava escondido num enfeite ou bloco: estoura e salta até o seu lugar
function revelarEscondido(b) {
    if (b.revelado) return;
    b.revelado = true;
    const e = b.esconderijo;
    Som.pop();
    e.el.classList.remove('suspeito');
    e.el.classList.add(e.bloco ? 'rachado' : 'estoura');
    particulas(e.el, 12, {
        cores: e.bloco ? ['#ffe27a', '#ffffff', '#ff9a1f'] : ['#7be08a', '#ffffff', '#ffd84d'],
        x: 50, y: 30, espalha: 60, espalhaY: 20, dist: 70, tam: 7, dur: 0.8, sobe: -30
    });
    b.el.style.setProperty('--dx', (e.x - b.x).toFixed(2));
    b.el.classList.remove('oculto');
    b.el.classList.add('salta');
    setTimeout(function () { b.el.classList.remove('salta'); }, 1000);
}

function revelarBug(b) {
    b.revelado = true;
    Som.surpresa();
    b.el.classList.remove('oculto');
    b.el.classList.add('cai');
    setTimeout(function () {
        palco.classList.add('tremor');
    }, 420);
    setTimeout(function () {
        b.el.classList.remove('cai');
        palco.classList.remove('tremor');
    }, 850);
}

// O bug "desmancha": dá um glitch, quebra em pedaços e solta 0s e 1s
function desmancharBug(b) {
    const corpo = b.el.querySelector('.bug-corpo');
    const img = corpo.querySelector('img');
    b.el.classList.add('glitch');
    Som.desmanchar();

    setTimeout(function () {
        b.el.classList.remove('glitch');

        const COLUNAS = 9;
        const LINHAS = 7;
        const camada = document.createElement('div');
        camada.className = 'fragmentos';
        for (let l = 0; l < LINHAS; l++) {
            for (let c = 0; c < COLUNAS; c++) {
                const f = document.createElement('div');
                f.className = 'fragmento';
                f.style.left = (c * 100 / COLUNAS) + '%';
                f.style.top = (l * 100 / LINHAS) + '%';
                f.style.width = (100 / COLUNAS + 0.6) + '%';
                f.style.height = (100 / LINHAS + 0.6) + '%';
                f.style.backgroundImage = 'url("' + img.src + '")';
                f.style.backgroundSize = (COLUNAS * 100) + '% ' + (LINHAS * 100) + '%';
                f.style.backgroundPosition = (c * 100 / (COLUNAS - 1)) + '% ' + (l * 100 / (LINHAS - 1)) + '%';
                f.style.setProperty('--dx', ((Math.random() - 0.5) * 16).toFixed(2) + 'cqw');
                f.style.setProperty('--dy', (-2 - Math.random() * 12).toFixed(2) + 'cqw');
                f.style.setProperty('--giro', ((Math.random() - 0.5) * 540).toFixed(0) + 'deg');
                f.style.transitionDelay = Math.round(Math.random() * 250) + 'ms';
                camada.appendChild(f);
            }
        }
        corpo.appendChild(camada);
        img.style.visibility = 'hidden';

        for (let i = 0; i < 16; i++) {
            const bit = document.createElement('span');
            bit.className = 'bit';
            bit.textContent = Math.random() < 0.5 ? '0' : '1';
            bit.style.setProperty('--bx', (10 + Math.random() * 80).toFixed(0) + '%');
            bit.style.setProperty('--atraso', Math.round(Math.random() * 450) + 'ms');
            b.el.appendChild(bit);
        }

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                camada.classList.add('voando');
            });
        });
        setTimeout(function () {
            b.el.style.display = 'none';
        }, 1400);
    }, 320);
}

function terminarMundo() {
    estado = 'fim';
    movendo = 0;
    const portal = mundo.querySelector('.objeto-portal.aberto, .objeto-portal.aberto-fixo');
    function mostrarFim() {
        mostrarFimDoMundo();
    }
    if (pontosChips() < metaChips()) {
        // sem a meta de chips o portal/terminal não abre: vai direto para o aviso
        setTimeout(mostrarFim, 500);
    } else if (objetoFinalEl) {
        // o terminal "compila" e o robô entra na tela
        abrirObjeto(objetoFinalEl);
        setTimeout(function () { robo.classList.add('entrando-terminal'); }, 2600);
        setTimeout(mostrarFim, 3900);
    } else if (portal) {
        robo.classList.add('entrando');    // o robô é sugado pelo portal
        setTimeout(mostrarFim, 1100);
    } else {
        mostrarFim();
    }
}

btnMapa.addEventListener('click', function () {
    window.location.href = URL_MAPA;
});

btnRepetir.addEventListener('click', function () {
    apagarProgressoDoMundo();
    window.location.reload();
});

// ---------- Cronômetro do desafio (quanto mais rápido, mais chips de bônus) ----------
let inicioDesafio = 0;
let timerCrono = null;
let bonusPendente = 0;
function segundosDesafio() {
    return (performance.now() - inicioDesafio) / 1000;
}
function atualizarCronometro() {
    const s = Math.floor(segundosDesafio());
    const b = bonusPorTempo(segundosDesafio());
    const mm = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    cronometro.textContent = '⏱ ' + mm + ':' + ss + '  ⚡+' + b;
    cronometro.className = 'cronometro ' + (b >= BONUS_MAX ? 'ouro' : (b > BONUS_MINIMO ? 'prata' : 'bronze'));
}
function iniciarCronometro() {
    inicioDesafio = performance.now();
    bonusPendente = 0;
    atualizarCronometro();
    clearInterval(timerCrono);
    timerCrono = setInterval(atualizarCronometro, 250);
}
function pararCronometro() {
    clearInterval(timerCrono);
    timerCrono = null;
}

// ---------- Janela do desafio ----------
let lacuna = null;
let pecaEncaixada = null;
let desafioResolvido = false;   // depois do acerto, a janela fica travada até fechar
let verificando = false;        // evita dois cliques seguidos em VERIFICAR
let timerContinuar = null;

// Acertou: trava peças, lacuna e botões para não dar para trocar a resposta
function travarDesafio() {
    desafioResolvido = true;
    bandeja.classList.add('bloqueada');
    bandeja.querySelectorAll('.peca').forEach(function (p) {
        p.disabled = true;
        p.draggable = false;
    });
    btnVerificar.disabled = true;
    btnLimpar.disabled = true;
}

function mostrarFeedback(texto, tipo) {
    feedback.textContent = texto;
    feedback.className = 'feedback visivel ' + tipo;
}

function esconderFeedback() {
    feedback.textContent = '';
    feedback.className = 'feedback';
}

function encaixar(valor) {
    if (desafioResolvido) return;
    Som.peca();
    pecaEncaixada = valor;
    lacuna.textContent = valor;
    lacuna.className = 'lacuna preenchida';
    marcarPecaEscolhida(valor);
    esconderFeedback();
}

// A peça escolhida fica verde na bandeja (e vermelha se estiver errada)
function marcarPecaEscolhida(valor, errada) {
    bandeja.querySelectorAll('.peca').forEach(function (p) {
        const e = valor !== null && p.dataset.valor === valor;
        p.classList.toggle('escolhida', e && !errada);
        p.classList.toggle('errada', e && !!errada);
    });
}

function limpar() {
    if (desafioResolvido) return;
    pecaEncaixada = null;
    lacuna.textContent = '';
    lacuna.className = 'lacuna';
    marcarPecaEscolhida(null);
    esconderFeedback();
}

function ligarLacuna(el) {
    el.addEventListener('dragover', function (e) {
        e.preventDefault();
        el.classList.add('sobre');
    });
    el.addEventListener('dragleave', function () {
        el.classList.remove('sobre');
    });
    el.addEventListener('drop', function (e) {
        e.preventDefault();
        el.classList.remove('sobre');
        if (desafioResolvido) return;
        encaixar(e.dataTransfer.getData('text/plain'));
    });
}

function criarPeca(valor) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'peca';
    botao.draggable = true;
    botao.dataset.valor = valor;
    botao.textContent = valor;

    botao.addEventListener('dragstart', function (e) {
        if (desafioResolvido) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', valor);
        e.dataTransfer.effectAllowed = 'copy';
    });

    // Clicar na peça também encaixa (celular e teclado)
    botao.addEventListener('click', function () {
        encaixar(valor);
    });
    return botao;
}

function montarDesafio(d) {
    tituloDesafio.textContent = d.titulo;
    document.getElementById('nome-arquivo').textContent = 'bug_' + String(d.fase).padStart(2, '0') + '.py';
    enunciado.textContent = d.enunciado;

    editor.textContent = '';
    d.codigo.forEach(function (linha, i) {
        const partes = linha.split('___');
        editor.appendChild(document.createTextNode(partes[0]));
        if (partes.length > 1) {
            lacuna = document.createElement('span');
            lacuna.className = 'lacuna';
            lacuna.setAttribute('aria-label', 'Lacuna para encaixar a peça');
            ligarLacuna(lacuna);
            editor.appendChild(lacuna);
            editor.appendChild(document.createTextNode(partes.slice(1).join('___')));
        }
        if (i < d.codigo.length - 1) {
            editor.appendChild(document.createTextNode('\n'));
        }
    });

    bandeja.textContent = '';
    d.pecas.forEach(function (valor) {
        bandeja.appendChild(criarPeca(valor));
    });

    pecaEncaixada = null;
    desafioResolvido = false;
    verificando = false;
    clearTimeout(timerContinuar);
    bandeja.classList.remove('bloqueada');
    btnVerificar.disabled = false;
    btnLimpar.disabled = false;
    esconderFeedback();
    btnVerificar.hidden = false;
    btnLimpar.hidden = false;
    btnContinuar.hidden = true;
    btnContinuar.classList.remove('auto');
}

btnVerificar.addEventListener('click', async function () {
    if (desafioResolvido || verificando) return;
    if (pecaEncaixada === null) {
        mostrarFeedback('Arraste uma peça para a lacuna antes de verificar.', 'erro');
        return;
    }

    verificando = true;
    try {
        const resposta = await fetch(URL_VALIDAR, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: desafioAtual.id, resposta: pecaEncaixada })
        });
        const dados = await resposta.json();

        if (dados.sucesso) {
            lacuna.className = 'lacuna preenchida acerto';
            pararCronometro();
            bonusPendente = bonusPorTempo(segundosDesafio());
            mostrarFeedback(dados.mensagem + '  ⚡ +' + bonusPendente + (bonusPendente === 1 ? ' chip' : ' chips') + ' de bônus!', 'ok');
            Som.acerto();
            travarDesafio();
            btnVerificar.hidden = true;
            btnLimpar.hidden = true;
            btnContinuar.hidden = false;
            // a janela fecha sozinha depois de dar tempo de ler a explicação (o botão adianta)
            const espera = Math.min(7000, Math.max(3500, 2500 + dados.mensagem.length * 35));
            btnContinuar.style.setProperty('--auto', espera + 'ms');
            btnContinuar.classList.remove('auto');
            void btnContinuar.offsetWidth;
            btnContinuar.classList.add('auto');
            btnContinuar.focus();
            clearTimeout(timerContinuar);
            timerContinuar = setTimeout(function () { btnContinuar.click(); }, espera);
        } else {
            lacuna.className = 'lacuna preenchida erro';
            marcarPecaEscolhida(pecaEncaixada, true);
            mostrarFeedback(dados.mensagem, 'erro');
            Som.erro();
            // errar custa chips (nunca deixa o total abaixo de zero)
            const perda = Math.min(PENALIDADE_ERRO, pontosChips());
            if (perda > 0) {
                chipsPerdidos += perda;
                atualizarChips();
                pulsarContador();
                salvarProgresso(concluidos, false);
                const voo = document.createElement('span');
                voo.className = 'bonus-flutuante perda';
                voo.textContent = '-' + perda;
                contadorChips.appendChild(voo);
                setTimeout(function () { voo.remove(); }, 1600);
                // aviso na barra da janela (fora da caixa que explica a resposta)
                perdaJanela.textContent = '−' + perda + (perda === 1 ? ' chip' : ' chips');
                perdaJanela.classList.remove('mostra');
                void perdaJanela.offsetWidth;
                perdaJanela.classList.add('mostra');
            }
            // o bug reage ao erro
            const el = bugs[indiceAtual].el;
            el.classList.remove('tremer');
            void el.offsetWidth;
            el.classList.add('tremer');
        }
    } catch (erro) {
        mostrarFeedback('Não foi possível falar com o servidor. Tente de novo em instantes.', 'erro');
    }
    verificando = false;
});

btnLimpar.addEventListener('click', limpar);

// Acertou: o bug é derrotado, o progresso é salvo e o robô segue em frente
btnContinuar.addEventListener('click', function () {
    clearTimeout(timerContinuar);
    if (modal.hidden || !desafioResolvido) return;   // só continua depois de um acerto confirmado
    modal.hidden = true;

    const b = bugs[indiceAtual];
    b.vivo = false;
    alerta.classList.remove('ativo');
    desmancharBug(b);
    if (b.ponte) {
        setTimeout(function () {
            construirPonte(b.ponte);
        }, 900);
    }

    if (!concluidos.includes(b.id)) concluidos.push(b.id);
    const completo = proximoIndice() === -1;
    const ganhou = bonusPendente;
    chipsDeBonus += ganhou;
    bonusPendente = 0;
    salvarProgresso(concluidos, false);   // o mundo só é concluído ao chegar ao fim com a meta de chips
    atualizarTopo();
    if (ganhou > 0) {
        Som.bonus();
        pulsarContador();
        const voo = document.createElement('span');
        voo.className = 'bonus-flutuante';
        voo.textContent = '+' + ganhou;
        contadorChips.appendChild(voo);
        setTimeout(function () { voo.remove(); }, 1600);
    }

    // Espera o bug se desmanchar e a ponte ser reconstruída antes de seguir
    estado = 'aguardando';
    setTimeout(function () {
        estado = 'andando';
        if (completo) {
            const faltam = metaChips() - pontosChips();
            mostrarDica(faltam > 0
                ? 'Último bug derrotado! Faltam ' + faltam + ' chips para a meta: pegue os que sobraram →'
                : 'Último bug derrotado! Meta de chips alcançada. Siga até o fim →', 5000);
        } else {
            mostrarDica(b.objeto ? 'Caminho aberto! Siga em frente →' : (b.ponte ? 'Ponte reconstruída! Siga em frente →' : 'Caminho livre! Siga em frente →'), 3500);
        }
    }, b.objeto ? (ESPERA_OBJETO[b.ponte.dataset.tipo] || 2300) : (b.ponte ? 2100 : 1100));
});


// O navegador pode suspender o áudio com a aba em segundo plano: retoma ao voltar
document.addEventListener('visibilitychange', function () {
    if (!document.hidden) Som.iniciar();
});

// Celular: o navegador só libera o áudio depois de um toque. Segurar ◀ ▶ ou ⤒ não conta até soltar,
// então, se o som ainda não estiver ligado, avisa uma vez.
(function avisoDeSom() {
    let avisou = false;
    setInterval(function () {
        if (avisou || !TOQUE || estado !== 'andando' || !Som.estaLigado()) return;
        if (Som.estado() === 'running') { avisou = true; return; }
        avisou = true;
        mostrarDica('Toque na tela para ativar o som', 4500);
    }, 1500);
})();

// ---------- Botão de som ----------
function atualizarBotaoSom() {
    const ligado = Som.estaLigado();
    btnSom.textContent = ligado ? '🔊' : '🔇';
    btnSom.setAttribute('aria-label', ligado ? 'Som ligado' : 'Som desligado');
}
btnSom.addEventListener('click', function () {
    Som.alternar();
    atualizarBotaoSom();
    btnSom.blur();   // para a tecla de espaço ou as setas não acionarem o botão sem querer
});
atualizarBotaoSom();


// ---------- Celular (Android / iOS) ----------
(function celular() {
    const toque = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    // Dica de controle com os botões da tela, em vez do teclado
    if (toque) {
        const dica = document.getElementById('dica-controle');
        if (dica) dica.textContent = 'Use ◀ ▶ para andar e ⤒ para pular';
    }

    // Segurar um botão não abre o menu de "salvar imagem / copiar" do navegador
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest && e.target.closest('.controles, .palco, .peca')) e.preventDefault();
    });

    // Tela cheia (Android/Chrome e iPad; o iPhone não permite e o botão fica escondido)
    const btnTela = document.getElementById('btn-tela-cheia');
    const raiz = document.documentElement;
    const pedirTela = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
    if (toque && btnTela && pedirTela) {
        btnTela.hidden = false;
        btnTela.addEventListener('click', function () {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                (document.exitFullscreen || document.webkitExitFullscreen).call(document);
                return;
            }
            const promessa = pedirTela.call(raiz);
            const travar = function () {
                if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {});
            };
            if (promessa && promessa.then) promessa.then(travar).catch(function () {}); else travar();
        });
    }
})();