/**
 * Módulo de Comida (Food)
 * Gerencia a geração e estado da comida no jogo (capim, milho e cenoura)
 */

import { GRID_WIDTH, GRID_HEIGHT, FOOD_TYPES, CORN_PROBABILITY, CARROT_PROBABILITY } from './constants.js';

export class Food {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.type = FOOD_TYPES.GRASS;
    }

    /**
     * Gera uma nova comida em posição aleatória
     * Evita posições ocupadas pelo carneiro
     * @param {Array} occupiedPositions - Posições ocupadas pelo carneiro
     * @param {Object} gameState - Estado do jogo para regras especiais
     * @param {number} gameState.foodCount - Quantidade de comidas já consumidas
     * @param {number} gameState.score - Pontuação atual
     * @param {boolean} gameState.carrotGiven - Se a cenoura garantida já foi dada
     */
    spawn(occupiedPositions = [], gameState = {}) {
        // Define o tipo de comida baseado nas regras especiais
        this.type = this.determinarTipoComidaComRegras(gameState);

        // Gera posição aleatória que não esteja ocupada
        this.position = this.gerarPosicaoValida(occupiedPositions);
    }

    /**
     * Determina o tipo de comida aplicando regras especiais de progressão
     * - Milho garantido nos 3 primeiros itens
     * - Cenoura garantida entre 80 e 120 pontos (uma vez só)
     * - Depois, probabilidades padrão
     * @param {Object} gameState - Estado do jogo
     * @returns {Object} - Tipo de comida
     */
    determinarTipoComidaComRegras(gameState) {
        const { foodCount = 0, score = 0, carrotGiven = false } = gameState;

        // Regra 1: Milho garantido nos 3 primeiros itens
        if (foodCount < 3) {
            return FOOD_TYPES.CORN;
        }

        // Regra 2: Cenoura garantida entre 80 e 120 pontos (apenas uma vez)
        if (score >= 80 && score <= 120 && !carrotGiven) {
            return FOOD_TYPES.CARROT;
        }

        // Probabilidades padrão
        return this.determinarTipoComidaAleatorio();
    }

    /**
     * Determina o tipo de comida baseado na probabilidade padrão
     * Cenoura: 2%, Milho: 10%, Capim: 88%
     * @returns {Object} - Tipo de comida (GRASS, CORN ou CARROT)
     */
    determinarTipoComidaAleatorio() {
        // Gera número aleatório de 1 a 100
        const numeroAleatorio = Math.floor(Math.random() * 100) + 1;

        // Cenoura: números de 1 a 2 (2% de chance)
        if (numeroAleatorio <= CARROT_PROBABILITY) {
            return FOOD_TYPES.CARROT;
        }

        // Milho: números de 3 a 12 (10% de chance)
        if (numeroAleatorio <= CARROT_PROBABILITY + CORN_PROBABILITY) {
            return FOOD_TYPES.CORN;
        }

        // Capim: números de 13 a 100 (88% de chance)
        return FOOD_TYPES.GRASS;
    }

    /**
     * Gera uma posição válida que não está ocupada
     * @param {Array} occupiedPositions - Posições a evitar
     * @returns {Object} - Posição {x, y} válida
     */
    gerarPosicaoValida(occupiedPositions) {
        let newPosition;
        let isValid = false;

        // Tenta gerar posição até encontrar uma válida
        while (!isValid) {
            newPosition = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };

            // Verifica se a posição não está ocupada
            isValid = !this.posicaoOcupada(newPosition, occupiedPositions);
        }

        return newPosition;
    }

    /**
     * Verifica se uma posição está ocupada
     * @param {Object} position - Posição a verificar
     * @param {Array} occupiedPositions - Lista de posições ocupadas
     * @returns {boolean} - true se está ocupada
     */
    posicaoOcupada(position, occupiedPositions) {
        return occupiedPositions.some(
            pos => pos.x === position.x && pos.y === position.y
        );
    }

    /**
     * Retorna a quantidade de crescimento que esta comida proporciona
     * @returns {number} - Quantidade de segmentos a crescer
     */
    getGrowthAmount() {
        return this.type.growthAmount;
    }

    /**
     * Verifica se a comida está em uma determinada posição
     * @param {Object} position - Posição a verificar
     * @returns {boolean} - true se a comida está na posição
     */
    isAt(position) {
        return this.position.x === position.x && this.position.y === position.y;
    }

    /**
     * Retorna se a comida atual é milho
     * @returns {boolean} - true se é milho
     */
    isCorn() {
        return this.type === FOOD_TYPES.CORN;
    }

    /**
     * Retorna se a comida atual é capim
     * @returns {boolean} - true se é capim
     */
    isGrass() {
        return this.type === FOOD_TYPES.GRASS;
    }

    /**
     * Retorna se a comida atual é cenoura
     * @returns {boolean} - true se é cenoura
     */
    isCarrot() {
        return this.type === FOOD_TYPES.CARROT;
    }
}
