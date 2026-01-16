/**
 * Constantes do jogo RamTail
 * Define todas as configurações e valores fixos utilizados no jogo
 */

// Tamanho fixo das células
export const CELL_SIZE = 20;

// Objeto com dimensões dinâmicas (atualizadas pelo main.js)
export const dimensions = {
    canvasWidth: 600,
    canvasHeight: 600,
    gridWidth: 30,
    gridHeight: 30
};

// Função para atualizar dimensões baseado no tamanho da janela
export function updateDimensions(width, height) {
    // Arredonda para múltiplo de CELL_SIZE para grid perfeito
    dimensions.canvasWidth = Math.floor(width / CELL_SIZE) * CELL_SIZE;
    dimensions.canvasHeight = Math.floor(height / CELL_SIZE) * CELL_SIZE;
    dimensions.gridWidth = dimensions.canvasWidth / CELL_SIZE;
    dimensions.gridHeight = dimensions.canvasHeight / CELL_SIZE;
}


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

// Emojis de animais disponíveis para escolha
export const ANIMAL_EMOJIS = [
    { emoji: '🐏', name: 'Carneiro' },
    { emoji: '🐑', name: 'Ovelha' },
    { emoji: '🐺', name: 'Lobo' },
    { emoji: '🦊', name: 'Raposa' },
    { emoji: '🐻', name: 'Urso' },
    { emoji: '🐼', name: 'Panda' },
    { emoji: '🦁', name: 'Leão' },
    { emoji: '🐯', name: 'Tigre' },
    { emoji: '🐮', name: 'Vaca' },
    { emoji: '🐷', name: 'Porco' },
    { emoji: '🐸', name: 'Sapo' },
    { emoji: '🐲', name: 'Dragão' }
];

// Cores do jogo (novo design)
export const COLORS = {
    BACKGROUND: '#7BC96F',      // Verde claro (canvas)
    BACKGROUND_LIGHT: '#8FD882', // Verde mais claro
    GRID: 'rgba(107, 181, 96, 0.4)', // Grid sutil
    LAMB_HEAD: '#F5F5DC',       // Bege (cor de lã)
    LAMB_BODY: '#FFFAF0',       // Branco floral
    LAMB_TAIL: '#E8E8E8',       // Cinza claro
    LAMB_FACE: '#FFB6C1',       // Rosa claro (focinho)
    TEXT: '#2D5229',            // Verde escuro
    TEXT_LIGHT: '#FFFFFF',      // Branco
    TEXT_MUTED: 'rgba(45, 82, 41, 0.7)', // Verde escuro semi-transparente
    BUTTON: '#4A8C3F',          // Verde botao
    BUTTON_HOVER: '#5AA04D',    // Verde botao hover
    HIGHLIGHT: '#FFD93D',       // Amarelo destaque
    HIGHLIGHT_ORANGE: '#FF9500', // Laranja destaque
    BADGE_BG: '#FFFFFF',        // Fundo badge
    EMOJI_BG: '#6BB560',        // Fundo emoji
    EMOJI_SELECTED: '#FFEB3B',  // Borda emoji selecionado
    GAME_OVER: '#8B0000'        // Vermelho escuro
};
