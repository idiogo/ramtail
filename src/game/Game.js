/**
 * Módulo Principal do Jogo (Game)
 * Orquestra todos os componentes e gerencia o loop do jogo
 * Suporta modo single player e multiplayer
 */

import { GAME_SPEED, FOOD_TYPES, ANIMAL_EMOJIS, dimensions } from './constants.js';
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
     * @param {NetworkManager} network - Gerenciador de rede (opcional, para multiplayer)
     */
    constructor(canvas, network = null) {
        // Referência ao canvas para click handling
        this.canvas = canvas;

        // Obtém o contexto 2D do canvas
        this.ctx = canvas.getContext('2d');

        // Modo multiplayer
        this.network = network;
        this.isMultiplayer = network !== null;
        this.playerId = null;
        this.playerColor = '#FFFFFF';

        // Inicializa os componentes do jogo
        this.renderer = new Renderer(this.ctx);
        this.lamb = new Lamb();
        this.food = new Food();

        // Estado inicial
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.gameLoop = null;

        // Controle de velocidade/aceleração
        this.isAccelerating = false;
        this.currentSpeed = GAME_SPEED;

        // Seleção de emoji
        this.selectedEmojiIndex = 0;
        this.emojiPositions = []; // Para detecção de clique

        // Contadores para regras especiais de comida (modo single player)
        this.foodCount = 0;
        this.cornGiven = false;
        this.cornTargetIndex = 0;
        this.carrotGiven = false;
        this.carrotTargetScore = 80;

        // Configura o handler de input com os callbacks
        this.inputHandler = new InputHandler(
            this.handleDirectionChange.bind(this),
            this.handleStart.bind(this),
            this.handlePause.bind(this),
            this.handleEmojiNavigation.bind(this),
            this.handleAccelerationChange.bind(this)
        );

        // Configura o click handler no canvas
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

        // Se multiplayer, configura callbacks de rede
        if (this.isMultiplayer) {
            this.setupNetworkCallbacks();
        }

        // Renderiza a tela inicial e guarda posições dos emojis
        this.emojiPositions = this.renderer.desenharTelaInicial(this.isMultiplayer, this.selectedEmojiIndex);
    }

    /**
     * Configura callbacks para eventos de rede
     */
    setupNetworkCallbacks() {
        this.network.callbacks = {
            onRoomState: (message) => {
                this.playerId = message.playerId;

                // Define a cor do jogador
                const myData = message.players[this.playerId];
                if (myData) {
                    this.playerColor = myData.color;
                }

                // Configura a comida inicial do servidor
                if (message.food) {
                    this.setFoodFromServer(message.food);
                }
            },

            onFoodEaten: (message) => {
                const { eatenBy, foodType, newFood } = message;

                // Se EU comi a comida
                if (eatenBy === this.playerId) {
                    this.processarComidaLocal(foodType);
                }

                // Atualiza para a nova comida
                this.setFoodFromServer(newFood);
            },

            onPlayerJoined: (message) => {
                console.log(`Novo jogador: ${message.playerId}`);
            },

            onPlayerLeft: (message) => {
                console.log(`Jogador saiu: ${message.playerId}`);
            },

            onPlayerDied: (message) => {
                console.log(`Jogador morreu: ${message.playerId}`);
            }
        };
    }

    /**
     * Define a comida a partir dos dados do servidor
     * @param {Object} serverFood - Dados da comida {position, type}
     */
    setFoodFromServer(serverFood) {
        this.food.position = serverFood.position;
        this.food.type = FOOD_TYPES[serverFood.type] || FOOD_TYPES.GRASS;
    }

    /**
     * Processa o crescimento local quando o jogador come
     * @param {string} foodType - Tipo da comida (GRASS, CORN, CARROT)
     */
    processarComidaLocal(foodType) {
        const foodData = FOOD_TYPES[foodType] || FOOD_TYPES.GRASS;

        // Aumenta o rabo do carneiro
        this.lamb.grow(foodData.growthAmount);

        // Atualiza a pontuação
        if (foodType === 'CARROT') {
            this.score += 100;
        } else if (foodType === 'CORN') {
            this.score += 20;
        } else {
            this.score += 10;
        }
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
     * Callback para navegação de emoji (← →)
     * @param {number} direction - -1 para esquerda, 1 para direita
     */
    handleEmojiNavigation(direction) {
        // Só funciona no menu e game over
        if (this.state !== GAME_STATES.MENU && this.state !== GAME_STATES.GAME_OVER) {
            return;
        }

        const totalEmojis = ANIMAL_EMOJIS.length;
        this.selectedEmojiIndex = (this.selectedEmojiIndex + direction + totalEmojis) % totalEmojis;

        // Atualiza a tela
        this.atualizarTelaSelecao();

        // Sincroniza com servidor se multiplayer
        this.sincronizarEmoji();
    }

    /**
     * Callback para clique no canvas
     * @param {MouseEvent} event - Evento de clique
     */
    handleCanvasClick(event) {
        // Só funciona no menu e game over
        if (this.state !== GAME_STATES.MENU && this.state !== GAME_STATES.GAME_OVER) {
            return;
        }

        // Calcula posição do clique relativa ao canvas
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Verifica se clicou em algum emoji
        for (const pos of this.emojiPositions) {
            if (clickX >= pos.x && clickX <= pos.x + pos.width &&
                clickY >= pos.y && clickY <= pos.y + pos.height) {
                this.selectedEmojiIndex = pos.index;
                this.atualizarTelaSelecao();
                this.sincronizarEmoji();
                break;
            }
        }
    }

    /**
     * Atualiza a tela de seleção (menu ou game over)
     */
    atualizarTelaSelecao() {
        if (this.state === GAME_STATES.MENU) {
            this.emojiPositions = this.renderer.desenharTelaInicial(this.isMultiplayer, this.selectedEmojiIndex);
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this.emojiPositions = this.renderer.desenharGameOverComSeletor(this.score, this.selectedEmojiIndex);
        }
    }

    /**
     * Sincroniza emoji escolhido com o servidor (multiplayer)
     */
    sincronizarEmoji() {
        if (this.isMultiplayer && this.network) {
            const selectedEmoji = ANIMAL_EMOJIS[this.selectedEmojiIndex].emoji;
            this.network.sendEmoji(selectedEmoji);
        }
    }

    /**
     * Retorna o emoji atualmente selecionado
     * @returns {string} - Emoji selecionado
     */
    getSelectedEmoji() {
        return ANIMAL_EMOJIS[this.selectedEmojiIndex].emoji;
    }

    /**
     * Callback para mudança de aceleração
     * @param {boolean} accelerating - true se está acelerando
     */
    handleAccelerationChange(accelerating) {
        // Só funciona durante o jogo
        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        this.isAccelerating = accelerating;

        // Reinicia o loop com a nova velocidade
        this.restartGameLoopWithSpeed();
    }

    /**
     * Reinicia o game loop com a velocidade atual
     */
    restartGameLoopWithSpeed() {
        if (this.state !== GAME_STATES.PLAYING) return;

        // Para o loop atual
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Calcula a nova velocidade (2x mais rápido se acelerando)
        this.currentSpeed = this.isAccelerating ? GAME_SPEED / 2 : GAME_SPEED;

        // Reinicia com a nova velocidade
        this.gameLoop = setInterval(() => {
            this.update();
            this.render();
        }, this.currentSpeed);
    }

    /**
     * Inicia uma nova partida
     */
    iniciarJogo() {
        // Reseta o estado
        this.lamb.reset();
        this.score = 0;
        this.foodCount = 0;
        this.isAccelerating = false;
        this.currentSpeed = GAME_SPEED;
        this.state = GAME_STATES.PLAYING;

        // Modo single player: configura regras de comida
        if (!this.isMultiplayer) {
            this.cornGiven = false;
            this.cornTargetIndex = Math.floor(Math.random() * 3);
            this.carrotGiven = false;
            this.carrotTargetScore = 80 + Math.floor(Math.random() * 41);

            // Gera a primeira comida
            this.food.spawn(this.lamb.getAllPositions(), this.getGameState());
        } else {
            // Multiplayer: notifica servidor do restart
            this.network.sendRestart();
        }

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

        if (this.isMultiplayer) {
            this.network.sendDeath();
        }

        // Usa tela de game over com seletor de emoji
        this.emojiPositions = this.renderer.desenharGameOverComSeletor(this.score, this.selectedEmojiIndex);
    }

    /**
     * Inicia o loop principal do jogo
     */
    startGameLoop() {
        this.stopGameLoop();

        this.gameLoop = setInterval(() => {
            this.update();
            this.render();
        }, this.currentSpeed);
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

        // Verifica colisões com paredes e próprio rabo
        if (this.lamb.hasCollided()) {
            this.finalizarJogo();
            return;
        }

        // Verifica colisão com outros jogadores (multiplayer)
        if (this.isMultiplayer) {
            const otherPlayers = this.network.getOtherPlayers();
            const collidedWithId = this.lamb.checkCollisionWithPlayers(otherPlayers);

            if (collidedWithId) {
                // Colidiu com outro jogador - morre!
                console.log(`💀 Você colidiu com o jogador ${collidedWithId}!`);
                this.finalizarJogo();
                return;
            }
        }

        // Envia posição para o servidor (multiplayer)
        if (this.isMultiplayer) {
            this.network.sendPosition(
                this.lamb.head,
                this.lamb.tail,
                this.lamb.direction
            );
        }

        // Verifica se comeu a comida
        if (this.lamb.isHeadAt(this.food.position)) {
            if (this.isMultiplayer) {
                // Multiplayer: envia tentativa ao servidor (ele decide quem pegou primeiro)
                this.network.tryEatFood(this.food.position);
            } else {
                // Single player: processa localmente
                this.comerComida();
            }
        }
    }

    /**
     * Processa quando o carneiro come a comida (modo single player)
     */
    comerComida() {
        const crescimento = this.food.getGrowthAmount();
        this.lamb.grow(crescimento);

        // Marca se o milho garantido foi dado
        if (this.food.isCorn() && this.foodCount < 3) {
            this.cornGiven = true;
        }

        // Marca se a cenoura garantida foi dada
        if (this.food.isCarrot() && !this.carrotGiven) {
            this.carrotGiven = true;
        }

        // Atualiza a pontuação
        if (this.food.isCarrot()) {
            this.score += 100;
        } else if (this.food.isCorn()) {
            this.score += 20;
        } else {
            this.score += 10;
        }

        this.foodCount++;

        // Gera nova comida
        this.food.spawn(this.lamb.getAllPositions(), this.getGameState());
    }

    /**
     * Retorna o estado atual do jogo para as regras de comida
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

        // Desenha outros jogadores (multiplayer)
        if (this.isMultiplayer) {
            this.renderizarOutrosJogadores();
        }

        // Desenha o carneiro local com o emoji selecionado
        this.renderer.desenharCarneiro(this.lamb, this.getSelectedEmoji());

        // Desenha a pontuação
        this.renderer.desenharPontuacao(this.score);

        // Mostra indicador multiplayer
        if (this.isMultiplayer) {
            this.renderer.desenharIndicadorMultiplayer(
                this.network.getOtherPlayers().size + 1
            );
        }
    }

    /**
     * Renderiza os outros jogadores (multiplayer)
     */
    renderizarOutrosJogadores() {
        const otherPlayers = this.network.getOtherPlayers();

        otherPlayers.forEach((player, playerId) => {
            if (player.head && player.tail) {
                this.renderer.desenharJogadorRemoto(
                    player.head,
                    player.tail,
                    player.color,
                    player.emoji || '🐏'
                );
            }
        });
    }

    /**
     * Mostra a tela de pausa
     */
    mostrarPausa() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, dimensions.canvasWidth, dimensions.canvasHeight);

        const centerX = dimensions.canvasWidth / 2;
        const centerY = dimensions.canvasHeight / 2;

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⏸️ PAUSADO ⏸️', centerX, centerY - 20);

        this.ctx.font = '18px Arial';
        this.ctx.fillText('Pressione ESPAÇO ou P para continuar', centerX, centerY + 30);
    }

    /**
     * Retorna o estado atual do jogo
     */
    getState() {
        return this.state;
    }

    /**
     * Retorna a pontuação atual
     */
    getScore() {
        return this.score;
    }

    /**
     * Chamado quando a janela é redimensionada
     * Re-renderiza a tela atual
     */
    onResize() {
        // Re-renderiza baseado no estado atual
        const GAME_STATES = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAME_OVER: 'gameOver'
        };

        switch (this.state) {
            case GAME_STATES.MENU:
                this.emojiPositions = this.renderer.desenharTelaInicial(this.isMultiplayer, this.selectedEmojiIndex);
                break;
            case GAME_STATES.PLAYING:
                this.render();
                break;
            case GAME_STATES.PAUSED:
                this.render();
                this.mostrarPausa();
                break;
            case GAME_STATES.GAME_OVER:
                this.emojiPositions = this.renderer.desenharGameOverComSeletor(this.score, this.selectedEmojiIndex);
                break;
        }
    }
}
