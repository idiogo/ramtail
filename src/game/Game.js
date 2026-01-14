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
        this.foodCount = 0;         // Quantidade de comidas consumidas
        this.carrotGiven = false;   // Se a cenoura garantida já apareceu

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
        this.carrotGiven = false;
        this.state = GAME_STATES.PLAYING;

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

        // Marca se a cenoura garantida foi dada (entre 80-120 pontos)
        if (this.food.isCarrot() && this.score >= 80 && this.score <= 120) {
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
     * @returns {Object} - Estado com foodCount, score e carrotGiven
     */
    getGameState() {
        return {
            foodCount: this.foodCount,
            score: this.score,
            carrotGiven: this.carrotGiven
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
