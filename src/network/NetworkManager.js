/**
 * Gerenciador de Rede (NetworkManager)
 * Responsável pela comunicação WebSocket com o servidor multiplayer
 */

export class NetworkManager {
    /**
     * Inicializa o gerenciador de rede
     * @param {string} roomId - ID da sala
     * @param {Object} callbacks - Callbacks para eventos de rede
     */
    constructor(roomId, callbacks = {}) {
        this.roomId = roomId;
        this.callbacks = callbacks;
        this.ws = null;
        this.playerId = null;
        this.connected = false;
        this.otherPlayers = new Map(); // Armazena dados dos outros jogadores

        this.connect();
    }

    /**
     * Conecta ao servidor WebSocket
     */
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const url = `${protocol}//${host}?room=${this.roomId}`;

        console.log(`Conectando ao servidor: ${url}`);

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Conectado ao servidor!');
            this.connected = true;
            if (this.callbacks.onConnect) {
                this.callbacks.onConnect();
            }
        };

        this.ws.onclose = () => {
            console.log('Desconectado do servidor');
            this.connected = false;
            if (this.callbacks.onDisconnect) {
                this.callbacks.onDisconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('Erro na conexão:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data));
        };
    }

    /**
     * Processa mensagens recebidas do servidor
     * @param {Object} message - Mensagem recebida
     */
    handleMessage(message) {
        switch (message.type) {
            case 'room_state':
                // Estado inicial da sala
                this.playerId = message.playerId;
                console.log(`Seu ID: ${this.playerId}`);

                // Carrega outros jogadores
                Object.entries(message.players).forEach(([id, data]) => {
                    if (id !== this.playerId) {
                        this.otherPlayers.set(id, data);
                    }
                });

                if (this.callbacks.onRoomState) {
                    this.callbacks.onRoomState(message);
                }
                break;

            case 'player_joined':
                console.log(`Jogador ${message.playerId} entrou na sala`);
                this.otherPlayers.set(message.playerId, {
                    head: null,
                    tail: [],
                    direction: { x: 1, y: 0 },
                    score: 0,
                    color: message.color
                });

                if (this.callbacks.onPlayerJoined) {
                    this.callbacks.onPlayerJoined(message);
                }
                break;

            case 'player_left':
                console.log(`Jogador ${message.playerId} saiu da sala`);
                this.otherPlayers.delete(message.playerId);

                if (this.callbacks.onPlayerLeft) {
                    this.callbacks.onPlayerLeft(message);
                }
                break;

            case 'player_moved':
                // Atualiza posição de outro jogador
                const player = this.otherPlayers.get(message.playerId);
                if (player) {
                    player.head = message.head;
                    player.tail = message.tail;
                    player.direction = message.direction;
                }

                if (this.callbacks.onPlayerMoved) {
                    this.callbacks.onPlayerMoved(message);
                }
                break;

            case 'food_eaten':
                if (this.callbacks.onFoodEaten) {
                    this.callbacks.onFoodEaten(message);
                }
                break;

            case 'player_died':
                const deadPlayer = this.otherPlayers.get(message.playerId);
                if (deadPlayer) {
                    deadPlayer.head = null;
                    deadPlayer.tail = [];
                }

                if (this.callbacks.onPlayerDied) {
                    this.callbacks.onPlayerDied(message);
                }
                break;

            case 'player_restarted':
                if (this.callbacks.onPlayerRestarted) {
                    this.callbacks.onPlayerRestarted(message);
                }
                break;
        }
    }

    /**
     * Envia atualização de posição para o servidor
     * @param {Object} head - Posição da cabeça
     * @param {Array} tail - Array de segmentos do rabo
     * @param {Object} direction - Direção atual
     */
    sendPosition(head, tail, direction) {
        if (!this.connected) return;

        this.send({
            type: 'update_position',
            head,
            tail,
            direction
        });
    }

    /**
     * Tenta comer a comida (servidor valida quem pegou primeiro)
     * @param {Object} position - Posição da comida
     */
    tryEatFood(position) {
        if (!this.connected) return;

        this.send({
            type: 'try_eat_food',
            position
        });
    }

    /**
     * Notifica que o jogador morreu
     */
    sendDeath() {
        if (!this.connected) return;

        this.send({
            type: 'player_died'
        });
    }

    /**
     * Notifica que o jogador reiniciou
     */
    sendRestart() {
        if (!this.connected) return;

        this.send({
            type: 'restart'
        });
    }

    /**
     * Envia mensagem para o servidor
     * @param {Object} message - Mensagem a enviar
     */
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    /**
     * Retorna os dados dos outros jogadores
     * @returns {Map} - Mapa de jogadores
     */
    getOtherPlayers() {
        return this.otherPlayers;
    }

    /**
     * Verifica se está conectado
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }

    /**
     * Desconecta do servidor
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
