/**
 * Módulo do Carneiro (Lamb)
 * Gerencia o estado e comportamento do carneiro no jogo
 */

import { DIRECTIONS, GRID_WIDTH, GRID_HEIGHT } from './constants.js';

export class Lamb {
    constructor() {
        this.reset();
    }

    /**
     * Reinicia o carneiro para o estado inicial
     */
    reset() {
        // Posição inicial no centro do grid
        const startX = Math.floor(GRID_WIDTH / 2);
        const startY = Math.floor(GRID_HEIGHT / 2);

        // A cabeça do carneiro (posição fixa, só muda de direção)
        this.head = { x: startX, y: startY };

        // O rabo do carneiro (array de segmentos que cresce)
        // Começa com 3 segmentos atrás da cabeça
        this.tail = [
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY },
            { x: startX - 3, y: startY }
        ];

        // Direção inicial: movendo para a direita
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;

        // Quantidade de segmentos a crescer (buffer de crescimento)
        this.growthPending = 0;
    }

    /**
     * Define a próxima direção de movimento
     * Impede movimento na direção oposta (não pode dar ré)
     * @param {Object} newDirection - Nova direção {x, y}
     */
    setDirection(newDirection) {
        // Verifica se não é a direção oposta
        const isOpposite = (
            this.direction.x + newDirection.x === 0 &&
            this.direction.y + newDirection.y === 0
        );

        if (!isOpposite) {
            this.nextDirection = newDirection;
        }
    }

    /**
     * Move o carneiro na direção atual
     * @returns {boolean} - true se o movimento foi válido
     */
    move() {
        // Atualiza a direção
        this.direction = this.nextDirection;

        // Guarda a posição anterior da cabeça
        const previousHead = { ...this.head };

        // Move a cabeça na direção atual
        this.head.x += this.direction.x;
        this.head.y += this.direction.y;

        // Adiciona a posição anterior ao início do rabo
        this.tail.unshift(previousHead);

        // Se não há crescimento pendente, remove o último segmento
        if (this.growthPending > 0) {
            this.growthPending--;
        } else {
            this.tail.pop();
        }

        return true;
    }

    /**
     * Adiciona segmentos ao rabo (quando come capim/milho)
     * @param {number} amount - Quantidade de segmentos a adicionar
     */
    grow(amount) {
        this.growthPending += amount;
    }

    /**
     * Verifica colisão com as paredes
     * @returns {boolean} - true se colidiu com parede
     */
    checkWallCollision() {
        return (
            this.head.x < 0 ||
            this.head.x >= GRID_WIDTH ||
            this.head.y < 0 ||
            this.head.y >= GRID_HEIGHT
        );
    }

    /**
     * Verifica colisão com o próprio rabo
     * @returns {boolean} - true se colidiu com o rabo
     */
    checkSelfCollision() {
        return this.tail.some(segment =>
            segment.x === this.head.x && segment.y === this.head.y
        );
    }

    /**
     * Verifica se o carneiro colidiu com algo
     * @returns {boolean} - true se houve alguma colisão
     */
    hasCollided() {
        return this.checkWallCollision() || this.checkSelfCollision();
    }

    /**
     * Verifica se a cabeça está em uma determinada posição
     * @param {Object} position - Posição {x, y} a verificar
     * @returns {boolean} - true se a cabeça está na posição
     */
    isHeadAt(position) {
        return this.head.x === position.x && this.head.y === position.y;
    }

    /**
     * Retorna todas as posições ocupadas pelo carneiro
     * @returns {Array} - Array de posições {x, y}
     */
    getAllPositions() {
        return [this.head, ...this.tail];
    }

    /**
     * Retorna o tamanho total do carneiro (cabeça + rabo)
     * @returns {number} - Tamanho total
     */
    getSize() {
        return 1 + this.tail.length;
    }
}
