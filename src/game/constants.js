/**
 * Constantes do jogo LambTail
 * Define todas as configurações e valores fixos utilizados no jogo
 */

// Tamanho do canvas e grid
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;
export const CELL_SIZE = 20;

// Calcula o número de células no grid
export const GRID_WIDTH = CANVAS_WIDTH / CELL_SIZE;
export const GRID_HEIGHT = CANVAS_HEIGHT / CELL_SIZE;

// Velocidade do jogo (milissegundos entre cada movimento)
export const GAME_SPEED = 150;

// Direções possíveis de movimento
export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Mapeamento de teclas para direções
export const KEY_BINDINGS = {
    'ArrowUp': 'UP',
    'ArrowDown': 'DOWN',
    'ArrowLeft': 'LEFT',
    'ArrowRight': 'RIGHT',
    'w': 'UP',
    'W': 'UP',
    's': 'DOWN',
    'S': 'DOWN',
    'a': 'LEFT',
    'A': 'LEFT',
    'd': 'RIGHT',
    'D': 'RIGHT'
};

// Tipos de comida
export const FOOD_TYPES = {
    GRASS: {
        name: 'capim',
        growthAmount: 1,
        color: '#228B22',  // Verde floresta
        emoji: '🌿'
    },
    CORN: {
        name: 'milho',
        growthAmount: 2,
        color: '#FFD700',  // Dourado
        emoji: '🌽'
    },
    CARROT: {
        name: 'cenoura',
        growthAmount: 10,
        color: '#FF6B35',  // Laranja
        emoji: '🥕'
    }
};

// Probabilidades de comida
// Capim: 88%, Milho: 10%, Cenoura: 2%
export const CORN_PROBABILITY = 10;
export const CARROT_PROBABILITY = 2;

// Cores do jogo
export const COLORS = {
    BACKGROUND: '#90EE90',      // Verde claro (pastagem)
    GRID: '#7CCD7C',            // Verde mais escuro para grid
    LAMB_HEAD: '#F5F5DC',       // Bege (cor de lã)
    LAMB_BODY: '#FFFAF0',       // Branco floral
    LAMB_TAIL: '#E8E8E8',       // Cinza claro
    LAMB_FACE: '#FFB6C1',       // Rosa claro (focinho)
    TEXT: '#2F4F4F',            // Cinza escuro
    GAME_OVER: '#8B0000'        // Vermelho escuro
};
