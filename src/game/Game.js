/**
 * Módulo Principal do Jogo (Game)
 * Orquestra todos os componentes e gerencia o loop do jogo
 */

import { GAME_SPEED } from './constants.js';
import { Lamb } from './Lamb.js';
import { Food } from './Food.js';
import { Renderer } from '../render/Renderer.js';
import { InputHandler } from '../input/InputHandler.js';

// Estados possíveis do jogo
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

export class Game {
    /**
     * Inicializa o jogo
     * @param {HTMLCanvasElement} canvas - Elemento canvas do HTML
     */
    constructor(canvas) {
        // Obtém o contexto 2D do canvas
        this.ctx = canvas.getContext('2d');

        // Inicializa os componentes do jogo
        this.renderer = new Renderer(this.ctx);
        this.lamb = new Lamb();
        this.food = new Food();

        // Estado inicial
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.gameLoop = null;

        // Contadores para regras especiais de comida
        this.foodCount = 0;           // Quantidade de comidas consumidas
        this.cornGiven = false;       // Se o milho garantido já apareceu
        this.cornTargetIndex = 0;     // Em qual item (0-2) o milho garantido aparece
        this.carrotGiven = false;     // Se a cenoura garantida já apareceu
        this.carrotTargetScore = 80;  // Em qual pontuação a cenoura garantida aparece

        // Configura o handler de input com os callbacks
        this.inputHandler = new InputHandler(
            this.handleDirectionChange.bind(this),
            this.handleStart.bind(this),
            this.handlePause.bind(this)
        );

        // Renderiza a tela inicial
        this.renderer.desenharTelaInicial();
    }

    /**
     * Callback para mudança de direção
     * @param {Object} direction - Nova direção
     */
    handleDirectionChange(direction) {
        if (this.state === GAME_STATES.PLAYING) {
            this.lamb.setDirection(direction);
        }
    }

    /**
     * Callback para iniciar/reiniciar o jogo
     */
    handleStart() {
        if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.GAME_OVER) {
            this.iniciarJogo();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.continuarJogo();
        }
    }

    /**
     * Callback para pausar o jogo
     */
    handlePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.pausarJogo();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.continuarJogo();
        }
    }

    /**
     * Inicia uma nova partida
     */
    iniciarJogo() {
        // Reseta o estado
        this.lamb.reset();
        this.score = 0;
        this.foodCount = 0;
        this.state = GAME_STATES.PLAYING;

        // Define aleatoriamente em qual dos 3 primeiros itens o milho aparece (0, 1 ou 2)
        this.cornGiven = false;
        this.cornTargetIndex = Math.floor(Math.random() * 3);

        // Define aleatoriamente em qual pontuação (80-120) a cenoura aparece
        this.carrotGiven = false;
        this.carrotTargetScore = 80 + Math.floor(Math.random() * 41); // 80 a 120

        // Gera a primeira comida (passa o estado do jogo)
        this.food.spawn(this.lamb.getAllPositions(), this.getGameState());

        // Inicia o loop do jogo
        this.startGameLoop();
    }

    /**
     * Pausa o jogo
     */
    pausarJogo() {
        this.state = GAME_STATES.PAUSED;
        this.stopGameLoop();
        this.mostrarPausa();
    }

    /**
     * Continua o jogo após pausa
     */
    continuarJogo() {
        this.state = GAME_STATES.PLAYING;
        this.startGameLoop();
    }

    /**
     * Finaliza o jogo (game over)
     */
    finalizarJogo() {
        this.state = GAME_STATES.GAME_OVER;
        this.stopGameLoop();
        this.renderer.desenharGameOver(this.score);
    }

    /**
     * Inicia o loop principal do jogo
     */
    startGameLoop() {
        // Para qualquer loop existente
        this.stopGameLoop();

        // Inicia novo loop
        this.gameLoop = setInterval(() => {
            this.update();
            this.render();
        }, GAME_SPEED);
    }

    /**
     * Para o loop do jogo
     */
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    /**
     * Atualiza a lógica do jogo (chamado a cada frame)
     */
    update() {
        if (this.state !== GAME_STATES.PLAYING) return;

        // Move o carneiro
        this.lamb.move();

        // Verifica colisões
        if (this.lamb.hasCollided()) {
            this.finalizarJogo();
            return;
        }

        // Verifica se comeu a comida
        if (this.lamb.isHeadAt(this.food.position)) {
            this.comerComida();
        }
    }

    /**
     * Processa quando o carneiro come a comida
     */
    comerComida() {
        // Obtém quanto o rabo deve crescer
        const crescimento = this.food.getGrowthAmount();

        // Aumenta o rabo do carneiro
        this.lamb.grow(crescimento);

        // Marca se o milho garantido foi dado (nos 3 primeiros itens)
        if (this.food.isCorn() && this.foodCount < 3) {
            this.cornGiven = true;
        }

        // Marca se a cenoura garantida foi dada
        if (this.food.isCarrot() && !this.carrotGiven) {
            this.carrotGiven = true;
        }

        // Atualiza a pontuação baseado no tipo de comida
        if (this.food.isCarrot()) {
            this.score += 100;  // Cenoura: muito rara, muitos pontos
        } else if (this.food.isCorn()) {
            this.score += 20;   // Milho: raro
        } else {
            this.score += 10;   // Capim: comum
        }

        // Incrementa contador de comidas consumidas
        this.foodCount++;

        // Gera nova comida em posição que não esteja ocupada
        this.food.spawn(this.lamb.getAllPositions(), this.getGameState());
    }

    /**
     * Retorna o estado atual do jogo para as regras de comida
     * @returns {Object} - Estado do jogo para determinar tipo de comida
     */
    getGameState() {
        return {
            foodCount: this.foodCount,
            score: this.score,
            cornGiven: this.cornGiven,
            cornTargetIndex: this.cornTargetIndex,
            carrotGiven: this.carrotGiven,
            carrotTargetScore: this.carrotTargetScore
        };
    }

    /**
     * Renderiza o jogo (chamado a cada frame)
     */
    render() {
        // Limpa e desenha o fundo
        this.renderer.clear();

        // Desenha a comida
        this.renderer.desenharComida(this.food);

        // Desenha o carneiro
        this.renderer.desenharCarneiro(this.lamb);

        // Desenha a pontuação
        this.renderer.desenharPontuacao(this.score);
    }

    /**
     * Mostra a tela de pausa
     */
    mostrarPausa() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, 600, 600);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⏸️ PAUSADO ⏸️', 300, 280);

        this.ctx.font = '18px Arial';
        this.ctx.fillText('Pressione ESPAÇO ou P para continuar', 300, 330);
    }

    /**
     * Retorna o estado atual do jogo
     * @returns {string} - Estado atual
     */
    getState() {
        return this.state;
    }

    /**
     * Retorna a pontuação atual
     * @returns {number} - Pontuação
     */
    getScore() {
        return this.score;
    }
}
