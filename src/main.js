/**
 * Ponto de Entrada do Jogo RamTail
 * Inicializa o jogo quando a página carrega
 * Suporta modo single player e multiplayer via query string
 */

import { Game } from './game/Game.js';
import { NetworkManager } from './network/NetworkManager.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants.js';

/**
 * Obtém o ID da sala da query string
 * @returns {string|null} - ID da sala ou null se não houver
 */
function getRoomId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
}

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

    // Verifica se há uma sala na query string
    const roomId = getRoomId();

    if (roomId) {
        // Modo multiplayer
        console.log(`🎮 Entrando na sala multiplayer: ${roomId}`);

        const network = new NetworkManager(roomId, {
            onConnect: () => {
                console.log('✅ Conectado ao servidor!');
            },
            onDisconnect: () => {
                console.log('❌ Desconectado do servidor');
            },
            onError: (error) => {
                console.error('Erro de conexão:', error);
                alert('Erro ao conectar ao servidor multiplayer. Verifique se o servidor está rodando.');
            }
        });

        // Cria o jogo em modo multiplayer
        const game = new Game(canvas, network);
        window.ramTailGame = game;

        console.log('🐑 RamTail Multiplayer iniciado!');
        console.log(`📋 Compartilhe este link para jogar com amigos: ${window.location.href}`);
    } else {
        // Modo single player
        const game = new Game(canvas);
        window.ramTailGame = game;

        console.log('🐑 RamTail Single Player iniciado!');
        console.log('💡 Dica: Adicione ?room=NOME_DA_SALA na URL para jogar multiplayer');
    }
}

// Aguarda o DOM carregar antes de inicializar
document.addEventListener('DOMContentLoaded', init);
