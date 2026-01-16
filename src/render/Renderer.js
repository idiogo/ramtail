/**
 * Modulo de Renderizacao (Renderer)
 * Responsavel por desenhar todos os elementos visuais no canvas
 * Novo design com visual amigavel e colorido
 */

import {
    dimensions,
    CELL_SIZE,
    COLORS,
    ANIMAL_EMOJIS
} from '../game/constants.js';

export class Renderer {
    /**
     * Inicializa o renderer com o contexto do canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto 2D do canvas
     */
    constructor(ctx) {
        this.ctx = ctx;

        // Carrega a imagem da cabeca do carneiro
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
        this.ctx.fillRect(0, 0, dimensions.canvasWidth, dimensions.canvasHeight);

        // Desenha o grid para melhor visualizacao
        this.desenharGrid();
    }

    /**
     * Desenha o grid do jogo
     */
    desenharGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 1;

        // Linhas verticais
        for (let x = 0; x <= dimensions.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE, dimensions.canvasHeight);
            this.ctx.stroke();
        }

        // Linhas horizontais
        for (let y = 0; y <= dimensions.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(dimensions.canvasWidth, y * CELL_SIZE);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha o carneiro completo (cabeca + rabo)
     * @param {Object} lamb - Objeto do carneiro
     * @param {string} emoji - Emoji da cabeca (padrao: carneiro)
     */
    desenharCarneiro(lamb, emoji = '🐏') {
        // Desenha o rabo primeiro (fica "atras" da cabeca)
        this.desenharRabo(lamb.tail);

        // Desenha a cabeca por cima
        this.desenharCabeca(lamb.head, emoji);
    }

    /**
     * Desenha a cabeca do animal usando emoji ou imagem
     * @param {Object} head - Posicao da cabeca {x, y}
     * @param {string} emoji - Emoji do animal
     */
    desenharCabeca(head, emoji = '🐏') {
        const x = head.x * CELL_SIZE;
        const y = head.y * CELL_SIZE;

        // Tamanho da cabeca (um pouco maior que a celula para destaque)
        const headSize = CELL_SIZE * 1.8;
        const offset = (headSize - CELL_SIZE) / 2;

        // Usa imagem apenas para o carneiro padrao
        if (emoji === '🐏' && this.imageLoaded) {
            this.ctx.drawImage(
                this.ramHeadImage,
                x - offset,
                y - offset,
                headSize,
                headSize
            );
        } else {
            // Outros emojis: desenha diretamente
            this.ctx.font = `${headSize - 4}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
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

            // Desenha segmento como circulo para parecer mais fofo
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
     * Desenha a pontuacao
     * @param {number} score - Pontuacao atual
     */
    desenharPontuacao(score) {
        // Fundo semi-transparente para a pontuacao
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.roundRect(8, 8, 130, 35, 8);
        this.ctx.fill();

        this.ctx.fillStyle = COLORS.TEXT_LIGHT;
        this.ctx.font = 'bold 18px Nunito, Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Pontos: ${score}`, 18, 26);
    }

    /**
     * Desenha um retangulo com bordas arredondadas
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * Desenha a tela de game over
     * @param {number} score - Pontuacao final
     */
    desenharGameOver(score) {
        // Fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, dimensions.canvasWidth, dimensions.canvasHeight);

        const centerX = dimensions.canvasWidth / 2;
        const centerY = dimensions.canvasHeight / 2;

        // Texto "Game Over"
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Nunito, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('FIM DE JOGO', centerX, centerY - 50);

        // Emoji de carneiro triste
        this.ctx.font = '60px Arial';
        this.ctx.fillText('🐑💔', centerX, centerY + 20);

        // Pontuacao final
        this.ctx.font = 'bold 24px Nunito, Arial';
        this.ctx.fillText(`Pontuacao Final: ${score}`, centerX, centerY + 80);

        // Instrucoes para reiniciar
        this.ctx.font = '18px Nunito, Arial';
        this.ctx.fillText('Pressione ESPACO para jogar novamente', centerX, centerY + 120);
    }

    /**
     * Desenha um jogador remoto (multiplayer)
     * @param {Object} head - Posicao da cabeca
     * @param {Array} tail - Array de segmentos do rabo
     * @param {string} color - Cor do jogador
     * @param {string} emoji - Emoji do jogador (padrao: carneiro)
     */
    desenharJogadorRemoto(head, tail, color, emoji = '🐏') {
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

        // Desenha a cabeca do jogador remoto (emoji com cor)
        const x = head.x * CELL_SIZE;
        const y = head.y * CELL_SIZE;

        // Circulo colorido de fundo
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

        // Emoji do jogador por cima
        this.ctx.font = `${CELL_SIZE - 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    }

    /**
     * Desenha indicador de jogadores online (multiplayer)
     * @param {number} playerCount - Numero de jogadores na sala
     */
    desenharIndicadorMultiplayer(playerCount) {
        // Fundo arredondado
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.roundRect(dimensions.canvasWidth - 125, 8, 117, 32, 8);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 14px Nunito, Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`👥 ${playerCount} jogador${playerCount > 1 ? 'es' : ''}`, dimensions.canvasWidth - 15, 24);
    }

    /**
     * Desenha o seletor de emoji com estilo circular
     * @param {number} selectedIndex - Indice do emoji selecionado
     * @param {number} y - Posicao Y para desenhar
     * @returns {Array} - Array com as posicoes dos emojis para deteccao de clique
     */
    desenharSeletorEmoji(selectedIndex, y) {
        const emojiSize = 44;
        const spacing = 52;
        const emojisPerRow = 5;
        const totalRows = Math.ceil(ANIMAL_EMOJIS.length / emojisPerRow);
        const centerX = dimensions.canvasWidth / 2;
        const startX = centerX - ((emojisPerRow - 1) * spacing) / 2;

        const emojiPositions = [];

        // Titulo do seletor
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 15px Nunito, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Escolha seu animal (← → ou clique):', centerX, y - 30);

        ANIMAL_EMOJIS.forEach((animal, index) => {
            const row = Math.floor(index / emojisPerRow);
            const col = index % emojisPerRow;
            const x = startX + col * spacing;
            const emojiY = y + row * spacing;

            // Salva estado do contexto
            this.ctx.save();

            // Fundo circular para cada emoji
            this.ctx.beginPath();
            this.ctx.arc(x, emojiY, emojiSize / 2, 0, Math.PI * 2);

            if (index === selectedIndex) {
                // Emoji selecionado - brilho amarelo/dourado
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 15;
                this.ctx.fillStyle = '#FFFACD';
                this.ctx.fill();

                // Borda dourada (sem sombra)
                this.ctx.shadowBlur = 0;
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            } else {
                // Emoji nao selecionado - fundo verde suave
                this.ctx.fillStyle = COLORS.EMOJI_BG;
                this.ctx.fill();

                // Borda sutil
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }

            // Restaura estado do contexto (remove sombras)
            this.ctx.restore();

            // Desenha o emoji
            this.ctx.font = `${emojiSize - 14}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(animal.emoji, x, emojiY);

            // Salva posicao para deteccao de clique
            emojiPositions.push({
                index,
                x: x - spacing / 2,
                y: emojiY - spacing / 2,
                width: spacing,
                height: spacing
            });
        });

        return emojiPositions;
    }

    /**
     * Desenha um botao estilizado
     */
    desenharBotao(text, x, y, width, height) {
        // Sombra do botao
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.roundRect(x + 2, y + 4, width, height, 12);
        this.ctx.fill();

        // Botao principal
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#5AA04D');
        gradient.addColorStop(1, '#4A8C3F');
        this.ctx.fillStyle = gradient;
        this.roundRect(x, y, width, height, 12);
        this.ctx.fill();

        // Texto do botao
        this.ctx.fillStyle = COLORS.TEXT_LIGHT;
        this.ctx.font = 'bold 18px Nunito, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width / 2, y + height / 2);
    }

    /**
     * Desenha badge (etiqueta)
     */
    desenharBadge(text, x, y, bgColor = COLORS.BADGE_BG, textColor = COLORS.TEXT) {
        this.ctx.font = 'bold 13px Nunito, Arial';
        const metrics = this.ctx.measureText(text);
        const padding = 12;
        const width = metrics.width + padding * 2;
        const height = 28;

        // Fundo do badge
        this.ctx.fillStyle = bgColor;
        this.roundRect(x - width / 2, y - height / 2, width, height, height / 2);
        this.ctx.fill();

        // Sombra sutil
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.roundRect(x - width / 2, y - height / 2, width, height, height / 2);
        this.ctx.stroke();

        // Texto
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    }

    /**
     * Desenha a tela inicial
     * @param {boolean} isMultiplayer - Se esta em modo multiplayer
     * @param {number} selectedEmojiIndex - Indice do emoji selecionado
     * @returns {Array} - Posicoes dos emojis para deteccao de clique
     */
    desenharTelaInicial(isMultiplayer = false, selectedEmojiIndex = 0) {
        this.clear();

        const centerX = dimensions.canvasWidth / 2;
        const centerY = dimensions.canvasHeight / 2;

        // Titulo
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 38px Nunito, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🐑 RamTail 🐑', centerX, centerY - 200);

        // Badge multiplayer
        if (isMultiplayer) {
            this.desenharBadge('👥 Modo Multiplayer', centerX, centerY - 155);
        }

        // Seletor de emoji
        const emojiY = isMultiplayer ? centerY - 75 : centerY - 95;
        const emojiPositions = this.desenharSeletorEmoji(selectedEmojiIndex, emojiY);

        // Info de comida
        const infoY = isMultiplayer ? centerY + 60 : centerY + 40;
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '14px Nunito, Arial';
        this.ctx.fillText('🌿 +1  |  🌽 +2 (raro)  |  🥕 +10 (muito raro)', centerX, infoY);

        // Controles
        this.ctx.fillText('SETAs ou WASD para mover', centerX, infoY + 28);

        // Dica multiplayer
        if (isMultiplayer) {
            this.ctx.fillStyle = COLORS.HIGHLIGHT_ORANGE;
            this.ctx.font = 'bold 14px Nunito, Arial';
            this.ctx.fillText('Quem pegar a comida primeiro, ganha!', centerX, infoY + 56);
        }

        // Botao de comecar
        const btnY = isMultiplayer ? centerY + 170 : centerY + 140;
        this.desenharBotao('Pressione ESPACO para comecar', centerX - 175, btnY, 350, 48);

        // Mostra emoji selecionado
        const selectedEmoji = ANIMAL_EMOJIS[selectedEmojiIndex];
        this.ctx.fillStyle = COLORS.TEXT_MUTED;
        this.ctx.font = '13px Nunito, Arial';
        this.ctx.fillText(`Selecionado: ${selectedEmoji.name}`, centerX, btnY + 75);

        return emojiPositions;
    }

    /**
     * Desenha a tela de game over com seletor de emoji
     * @param {number} score - Pontuacao final
     * @param {number} selectedEmojiIndex - Indice do emoji selecionado
     * @returns {Array} - Posicoes dos emojis para deteccao de clique
     */
    desenharGameOverComSeletor(score, selectedEmojiIndex = 0) {
        // Fundo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, dimensions.canvasWidth, dimensions.canvasHeight);

        const centerX = dimensions.canvasWidth / 2;
        const centerY = dimensions.canvasHeight / 2;

        // Texto "Game Over"
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 42px Nunito, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('FIM DE JOGO', centerX, centerY - 195);

        // Emoji triste
        this.ctx.font = '50px Arial';
        this.ctx.fillText('🐑💔', centerX, centerY - 140);

        // Pontuacao final
        this.ctx.font = 'bold 22px Nunito, Arial';
        this.ctx.fillText(`Pontuacao: ${score}`, centerX, centerY - 90);

        // Seletor de emoji para proxima partida
        this.ctx.fillStyle = '#FFFFFF';
        const emojiPositions = this.desenharSeletorEmoji(selectedEmojiIndex, centerY);

        // Botao de reiniciar
        this.desenharBotao('Pressione ESPACO para jogar novamente', centerX - 190, centerY + 150, 380, 48);

        // Mostra emoji selecionado
        const selectedEmoji = ANIMAL_EMOJIS[selectedEmojiIndex];
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '13px Nunito, Arial';
        this.ctx.fillText(`Proximo animal: ${selectedEmoji.name}`, centerX, centerY + 225);

        return emojiPositions;
    }
}
