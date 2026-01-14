/**
 * Ponto de Entrada do Jogo RamTail
 * Inicializa o jogo quando a página carrega
 */

import { Game } from './game/Game.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants.js';

/**
 * Função de inicialização principal
 * Executada quando o DOM está completamente carregado
 */
function init() {
    // Obtém o canvas do DOM
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error('Canvas não encontrado! Verifique se o elemento com id "gameCanvas" existe.');
        return;
    }

    // Configura as dimensões do canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Cria e inicia o jogo
    const game = new Game(canvas);

    // Expõe o jogo globalmente para debug (opcional)
    window.ramTailGame = game;

    console.log('🐑 RamTail iniciado com sucesso!');
}

// Aguarda o DOM carregar antes de inicializar
document.addEventListener('DOMContentLoaded', init);
