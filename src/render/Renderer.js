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
     * Desenha a cabeça do carneiro
     * @param {Object} head - Posição da cabeça {x, y}
     * @param {Object} direction - Direção atual do movimento
     */
    desenharCabeca(head, direction) {
        const x = head.x * CELL_SIZE;
        const y = head.y * CELL_SIZE;
        const padding = 2;

        // Corpo da cabeça (círculo principal - lã)
        this.ctx.fillStyle = COLORS.LAMB_HEAD;
        this.ctx.beginPath();
        this.ctx.arc(
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 2,
            CELL_SIZE / 2 - padding,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Contorno da cabeça
        this.ctx.strokeStyle = '#8B8B83';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Desenha o focinho na direção do movimento
        this.desenharFocinho(x, y, direction);

        // Desenha os olhos
        this.desenharOlhos(x, y, direction);

        // Desenha as orelhas
        this.desenharOrelhas(x, y, direction);
    }

    /**
     * Desenha o focinho do carneiro
     * @param {number} x - Posição X do canvas
     * @param {number} y - Posição Y do canvas
     * @param {Object} direction - Direção do movimento
     */
    desenharFocinho(x, y, direction) {
        this.ctx.fillStyle = COLORS.LAMB_FACE;

        const centerX = x + CELL_SIZE / 2;
        const centerY = y + CELL_SIZE / 2;
        const offset = CELL_SIZE / 4;

        let focinhoX = centerX + direction.x * offset;
        let focinhoY = centerY + direction.y * offset;

        // Focinho oval
        this.ctx.beginPath();
        this.ctx.ellipse(focinhoX, focinhoY, 4, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Desenha os olhos do carneiro
     * @param {number} x - Posição X do canvas
     * @param {number} y - Posição Y do canvas
     * @param {Object} direction - Direção do movimento
     */
    desenharOlhos(x, y, direction) {
        const centerX = x + CELL_SIZE / 2;
        const centerY = y + CELL_SIZE / 2;

        // Posiciona os olhos baseado na direção
        let olho1X, olho1Y, olho2X, olho2Y;

        if (direction.x !== 0) {
            // Movendo horizontalmente
            olho1X = centerX;
            olho1Y = centerY - 4;
            olho2X = centerX;
            olho2Y = centerY + 4;
        } else {
            // Movendo verticalmente
            olho1X = centerX - 4;
            olho1Y = centerY;
            olho2X = centerX + 4;
            olho2Y = centerY;
        }

        // Desenha os olhos
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(olho1X, olho1Y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(olho2X, olho2Y, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Desenha as orelhas do carneiro
     * @param {number} x - Posição X do canvas
     * @param {number} y - Posição Y do canvas
     * @param {Object} direction - Direção do movimento
     */
    desenharOrelhas(x, y, direction) {
        const centerX = x + CELL_SIZE / 2;
        const centerY = y + CELL_SIZE / 2;

        this.ctx.fillStyle = COLORS.LAMB_FACE;

        // Posiciona as orelhas nos lados perpendiculares ao movimento
        let orelha1X, orelha1Y, orelha2X, orelha2Y;

        if (direction.x !== 0) {
            // Movendo horizontalmente - orelhas em cima e embaixo
            orelha1X = centerX - direction.x * 3;
            orelha1Y = centerY - 8;
            orelha2X = centerX - direction.x * 3;
            orelha2Y = centerY + 8;
        } else {
            // Movendo verticalmente - orelhas nas laterais
            orelha1X = centerX - 8;
            orelha1Y = centerY - direction.y * 3;
            orelha2X = centerX + 8;
            orelha2Y = centerY - direction.y * 3;
        }

        // Desenha as orelhas
        this.ctx.beginPath();
        this.ctx.ellipse(orelha1X, orelha1Y, 3, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.ellipse(orelha2X, orelha2Y, 3, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
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
     * Desenha a tela inicial
     */
    desenharTelaInicial() {
        this.clear();

        // Título
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🐑 LambTail 🐑', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);

        // Subtítulo
        this.ctx.font = '20px Arial';
        this.ctx.fillText('O Carneiro Faminto!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

        // Instruções
        this.ctx.font = '16px Arial';
        this.ctx.fillText('🌿 Capim = +1 segmento', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        this.ctx.fillText('🌽 Milho = +2 segmentos (raro!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);
        this.ctx.fillText('🥕 Cenoura = +10 segmentos (muito rara!)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

        // Controles
        this.ctx.fillText('Use as SETAS ou WASD para mover', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);

        // Começar
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Pressione ESPAÇO para começar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 150);
    }
}
