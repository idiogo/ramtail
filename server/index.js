/**
 * Servidor WebSocket para RamTail Multiplayer
 * Gerencia salas de jogo e sincronização entre jogadores
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Armazena as salas de jogo ativas
// Estrutura: { roomId: { players: Map<playerId, playerData>, food: {position, type}, gameState } }
const rooms = new Map();

// Cria servidor HTTP para servir arquivos estáticos
const server = http.createServer((req, res) => {
    // Remove query string da URL para obter o caminho do arquivo
    const urlWithoutQuery = req.url.split('?')[0];

    // Serve arquivos estáticos do diretório raiz
    let filePath = urlWithoutQuery === '/' ? '/index.html' : urlWithoutQuery;
    filePath = path.join(__dirname, '..', filePath);

    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif'
    };

    const contentType = contentTypes[extname] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found: ' + filePath);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Cria servidor WebSocket
const wss = new WebSocket.Server({ server });

/**
 * Gera um ID único para o jogador
 */
function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Gera uma posição aleatória para comida
 */
function generateFoodPosition(gridWidth, gridHeight, occupiedPositions = []) {
    let position;
    let isValid = false;

    while (!isValid) {
        position = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };

        isValid = !occupiedPositions.some(
            pos => pos.x === position.x && pos.y === position.y
        );
    }

    return position;
}

/**
 * Determina o tipo de comida baseado nas regras
 */
function determineFoodType(gameState) {
    const { foodCount, score, cornGiven, cornTargetIndex, carrotGiven, carrotTargetScore } = gameState;

    // Milho garantido uma vez nos 3 primeiros
    if (foodCount < 3 && foodCount === cornTargetIndex && !cornGiven) {
        return 'CORN';
    }

    // Cenoura garantida uma vez entre 80-120 pontos
    if (score >= carrotTargetScore && !carrotGiven) {
        return 'CARROT';
    }

    // Probabilidades padrão
    const rand = Math.floor(Math.random() * 100) + 1;
    if (rand <= 2) return 'CARROT';
    if (rand <= 12) return 'CORN';
    return 'GRASS';
}

/**
 * Cria ou obtém uma sala
 */
function getOrCreateRoom(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            players: new Map(),
            food: null,
            gameState: {
                foodCount: 0,
                score: 0,
                cornGiven: false,
                cornTargetIndex: Math.floor(Math.random() * 3),
                carrotGiven: false,
                carrotTargetScore: 80 + Math.floor(Math.random() * 41)
            },
            gridWidth: 30,
            gridHeight: 30
        });
    }
    return rooms.get(roomId);
}

/**
 * Gera nova comida para a sala
 */
function spawnFood(room) {
    // Coleta todas as posições ocupadas por todos os jogadores
    const occupiedPositions = [];
    room.players.forEach(player => {
        if (player.head) occupiedPositions.push(player.head);
        if (player.tail) occupiedPositions.push(...player.tail);
    });

    const position = generateFoodPosition(room.gridWidth, room.gridHeight, occupiedPositions);
    const type = determineFoodType(room.gameState);

    room.food = { position, type };

    return room.food;
}

/**
 * Envia mensagem para todos os jogadores de uma sala
 */
function broadcastToRoom(roomId, message, excludePlayerId = null) {
    const room = rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(message);
    room.players.forEach((player, playerId) => {
        if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(data);
        }
    });
}

/**
 * Envia estado completo da sala para um jogador
 */
function sendRoomState(ws, roomId, playerId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const players = {};
    room.players.forEach((player, id) => {
        players[id] = {
            head: player.head,
            tail: player.tail,
            direction: player.direction,
            score: player.score,
            color: player.color
        };
    });

    ws.send(JSON.stringify({
        type: 'room_state',
        playerId,
        players,
        food: room.food
    }));
}

// Gerencia conexões WebSocket
wss.on('connection', (ws, req) => {
    // Extrai roomId da URL (?room=xxx)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room') || 'default';
    const playerId = generatePlayerId();

    console.log(`Jogador ${playerId} conectou na sala ${roomId}`);

    // Obtém ou cria a sala
    const room = getOrCreateRoom(roomId);

    // Cores para diferenciar jogadores
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const playerColor = colors[room.players.size % colors.length];

    // Adiciona jogador à sala
    room.players.set(playerId, {
        ws,
        head: null,
        tail: [],
        direction: { x: 1, y: 0 },
        score: 0,
        color: playerColor
    });

    // Se é o primeiro jogador, gera a comida
    if (room.players.size === 1 || !room.food) {
        spawnFood(room);
    }

    // Envia estado inicial para o jogador
    sendRoomState(ws, roomId, playerId);

    // Notifica outros jogadores
    broadcastToRoom(roomId, {
        type: 'player_joined',
        playerId,
        color: playerColor
    }, playerId);

    // Gerencia mensagens do cliente
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            const player = room.players.get(playerId);

            switch (message.type) {
                case 'update_position':
                    // Atualiza posição do jogador
                    player.head = message.head;
                    player.tail = message.tail;
                    player.direction = message.direction;

                    // Broadcast para outros jogadores
                    broadcastToRoom(roomId, {
                        type: 'player_moved',
                        playerId,
                        head: message.head,
                        tail: message.tail,
                        direction: message.direction
                    }, playerId);
                    break;

                case 'try_eat_food':
                    // Verifica se a comida ainda existe na posição
                    if (room.food &&
                        room.food.position.x === message.position.x &&
                        room.food.position.y === message.position.y) {

                        // Este jogador pegou a comida primeiro!
                        const foodType = room.food.type;

                        // Atualiza estado da sala
                        room.gameState.foodCount++;
                        if (foodType === 'CORN' && room.gameState.foodCount <= 3) {
                            room.gameState.cornGiven = true;
                        }
                        if (foodType === 'CARROT') {
                            room.gameState.carrotGiven = true;
                        }

                        // Gera nova comida
                        const newFood = spawnFood(room);

                        // Notifica todos os jogadores
                        broadcastToRoom(roomId, {
                            type: 'food_eaten',
                            eatenBy: playerId,
                            foodType,
                            newFood
                        });

                        // Também envia para quem comeu
                        ws.send(JSON.stringify({
                            type: 'food_eaten',
                            eatenBy: playerId,
                            foodType,
                            newFood
                        }));
                    }
                    break;

                case 'player_died':
                    // Jogador morreu
                    player.head = null;
                    player.tail = [];

                    broadcastToRoom(roomId, {
                        type: 'player_died',
                        playerId
                    }, playerId);
                    break;

                case 'restart':
                    // Jogador reiniciou
                    player.score = 0;

                    broadcastToRoom(roomId, {
                        type: 'player_restarted',
                        playerId
                    }, playerId);
                    break;
            }
        } catch (err) {
            console.error('Erro ao processar mensagem:', err);
        }
    });

    // Gerencia desconexão
    ws.on('close', () => {
        console.log(`Jogador ${playerId} desconectou da sala ${roomId}`);

        room.players.delete(playerId);

        // Notifica outros jogadores
        broadcastToRoom(roomId, {
            type: 'player_left',
            playerId
        });

        // Remove sala se vazia
        if (room.players.size === 0) {
            rooms.delete(roomId);
            console.log(`Sala ${roomId} removida (vazia)`);
        }
    });
});

// Inicia servidor
server.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║     🐏 RamTail Server Multiplayer 🐏      ║
    ╠═══════════════════════════════════════════╣
    ║  Servidor rodando em:                     ║
    ║  http://localhost:${PORT}                    ║
    ║                                           ║
    ║  Para jogar com amigos, acesse:           ║
    ║  http://localhost:${PORT}?room=NOME_DA_SALA  ║
    ╚═══════════════════════════════════════════╝
    `);
});
