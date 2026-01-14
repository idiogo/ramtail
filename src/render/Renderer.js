/**
 * Módulo de Renderização (Renderer)
 * Responsável por desenhar todos os elementos visuais no canvas
 */

import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CELL_SIZE,
    GRID_WIDTH,
    GRID_HEIGHT,
    COLORS
} from '../game/constants.js';

export class Renderer {
    /**
     * Inicializa o renderer com o contexto do canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto 2D do canvas
     */
    constructor(ctx) {
        this.ctx = ctx;

        // Carrega a imagem da cabeça do carneiro
        this.ramHeadImage = new Image();
        this.ramHeadImage.src = 'assets/ram-head.png';
        this.imageLoaded = false;
        this.ramHeadImage.onload = () => {
            this.imageLoaded = true;
        };
    }

    /**
     * Limpa o canvas e desenha o fundo
     */
    clear() {
        // Preenche o fundo com cor de pastagem
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Desenha o grid para melhor visualização
        this.desenharGrid();
    }

    /**
     * Desenha o grid do jogo
     */
    desenharGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 0.5;

        // Linhas verticais
        for (let x = 0; x <= GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        // Linhas horizontais
        for (let y = 0; y <= GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha o carneiro completo (cabeça + rabo)
     * @param {Object} lamb - Objeto do carneiro
     */
    desenharCarneiro(lamb) {
        // Desenha o rabo primeiro (fica "atrás" da cabeça)
        this.desenharRabo(lamb.tail);

        // Desenha a cabeça por cima
        this.desenharCabeca(lamb.head, lamb.direction);
    }

    /**
     * Desenha a cabeça do carneiro usando imagem
     * @param {Object} head - Posição da cabeça {x, y}
     */
    desenharCabeca(head) {
        const x = head.x * CELL_SIZE;
        const y = head.y * CELL_SIZE;

        // Tamanho da cabeça (um pouco maior que a célula para destaque)
        const headSize = CELL_SIZE * 1.8;
        const offset = (headSize - CELL_SIZE) / 2;

        if (this.imageLoaded) {
            // Desenha a imagem centralizada na célula
            this.ctx.drawImage(
                this.ramHeadImage,
                x - offset,
                y - offset,
                headSize,
                headSize
            );
        } else {
            // Fallback para emoji enquanto imagem carrega
            this.ctx.font = `${CELL_SIZE}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🐏', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
        }
    }

    /**
     * Desenha o rabo do carneiro
     * @param {Array} tail - Array de segmentos do rabo
     */
    desenharRabo(tail) {
        tail.forEach((segment, index) => {
            const x = segment.x * CELL_SIZE;
            const y = segment.y * CELL_SIZE;
            const padding = 3;

            // Gradiente de cor - mais claro conforme vai para o final
            const intensity = Math.min(255, 200 + index * 2);
            this.ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity - 10})`;

            // Desenha segmento como círculo para parecer mais fofo
            this.ctx.beginPath();
            this.ctx.arc(
                x + CELL_SIZE / 2,
                y + CELL_SIZE / 2,
                CELL_SIZE / 2 - padding,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Contorno suave
            this.ctx.strokeStyle = '#D3D3D3';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    /**
     * Desenha a comida (capim ou milho)
     * @param {Object} food - Objeto da comida
     */
    desenharComida(food) {
        const x = food.position.x * CELL_SIZE;
        const y = food.position.y * CELL_SIZE;

        // Usa emoji para representar a comida
        this.ctx.font = `${CELL_SIZE - 4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.fillText(
            food.type.emoji,
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 2
        );
    }

    /**
     * Desenha a pontuação
     * @param {number} score - Pontuação atual
     */
    desenharPontuacao(score) {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Pontos: ${score}`, 10, 10);
    }

    /**
     * Desenha a tela de game over
     * @param {number} score - Pontuação final
     */
    desenharGameOver(score) {
        // Fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Texto "Game Over"
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('FIM DE JOGO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

        // Emoji de carneiro triste
        this.ctx.font = '60px Arial';
        this.ctx.fillText('🐑💔', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        // Pontuação final
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Pontuação Final: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);

        // Instruções para reiniciar
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Pressione ESPAÇO para jogar novamente', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
    }

    /**
     * Desenha um jogador remoto (multiplayer)
     * @param {Object} head - Posição da cabeça
     * @param {Array} tail - Array de segmentos do rabo
     * @param {string} color - Cor do jogador
     */
    desenharJogadorRemoto(head, tail, color) {
        // Desenha o rabo com a cor do jogador
        tail.forEach((segment, index) => {
            const x = segment.x * CELL_SIZE;
            const y = segment.y * CELL_SIZE;
            const padding = 3;

            // Usa a cor do jogador com opacidade
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.7;

            this.ctx.beginPath();
            this.ctx.arc(
                x + CELL_SIZE / 2,
                y + CELL_SIZE / 2,
                CELL_SIZE / 2 - padding,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Contorno
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.globalAlpha = 1;
        });

        // Desenha a cabeça do jogador remoto (emoji com cor)
        const x = head.x * CELL_SIZE;
        const y = head.y * CELL_SIZE;

        // Círculo colorido de fundo
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 2,
            CELL_SIZE / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Emoji por cima
        this.ctx.font = `${CELL_SIZE - 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🐏', x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    }

    /**
     * Desenha indicador de jogadores online (multiplayer)
     * @param {number} playerCount - Número de jogadores na sala
     */
    desenharIndicadorMultiplayer(playerCount) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(CANVAS_WIDTH - 120, 5, 115, 30);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`👥 ${playerCount} jogador${playerCount > 1 ? 'es' : ''}`, CANVAS_WIDTH - 10, 12);
    }

    /**
     * Desenha a tela inicial
     * @param {boolean} isMultiplayer - Se está em modo multiplayer
     */
    desenharTelaInicial(isMultiplayer = false) {
        this.clear();

        // Título
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🐑 RamTail 🐑', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);

        // Subtítulo
        this.ctx.font = '20px Arial';
        if (isMultiplayer) {
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.fillText('👥 Modo Multiplayer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
            this.ctx.fillStyle = COLORS.TEXT;
        } else {
            this.ctx.fillText('O Carneiro Faminto!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
        }

        // Instruções
        this.ctx.font = '16px Arial';
        this.ctx.fillText('🌿 Capim = +1 segmento', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
        this.ctx.fillText('🌽 Milho = +2 segmentos (raro!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        this.ctx.fillText('🥕 Cenoura = +10 segmentos (muito rara!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45);

        // Controles
        this.ctx.fillText('Use as SETAS ou WASD para mover', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 85);

        // Dica multiplayer
        if (isMultiplayer) {
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.fillText('Quem pegar a comida primeiro, ganha!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 115);
            this.ctx.fillStyle = COLORS.TEXT;
        }

        // Começar
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Pressione ESPAÇO para começar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 155);
    }
}
