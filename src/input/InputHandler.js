/**
 * Módulo de Controle de Input (InputHandler)
 * Gerencia todas as entradas do teclado do jogador
 */

import { KEY_BINDINGS, DIRECTIONS } from '../game/constants.js';

export class InputHandler {
    /**
     * Inicializa o handler de input
     * @param {Function} onDirectionChange - Callback quando a direção muda
     * @param {Function} onStart - Callback para iniciar/reiniciar o jogo
     * @param {Function} onPause - Callback para pausar o jogo
     * @param {Function} onEmojiNavigation - Callback para navegar entre emojis (-1 ou 1)
     * @param {Function} onAccelerationChange - Callback quando aceleração muda (true/false)
     */
    constructor(onDirectionChange, onStart, onPause, onEmojiNavigation = null, onAccelerationChange = null) {
        this.onDirectionChange = onDirectionChange;
        this.onStart = onStart;
        this.onPause = onPause;
        this.onEmojiNavigation = onEmojiNavigation;
        this.onAccelerationChange = onAccelerationChange;

        // Rastreia teclas de movimento pressionadas
        this.pressedKeys = new Set();

        // Bind dos métodos para manter contexto
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Inicia escutando eventos
        this.iniciar();
    }

    /**
     * Inicia a escuta de eventos de teclado
     */
    iniciar() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Para a escuta de eventos (útil para limpeza)
     */
    parar() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Processa o evento de tecla pressionada
     * @param {KeyboardEvent} event - Evento do teclado
     */
    handleKeyDown(event) {
        const key = event.key;

        // Verifica se é uma tecla de direção
        if (KEY_BINDINGS[key]) {
            event.preventDefault();
            const direction = DIRECTIONS[KEY_BINDINGS[key]];
            this.onDirectionChange(direction);

            // Rastreia tecla pressionada para aceleração
            const wasEmpty = this.pressedKeys.size === 0;
            this.pressedKeys.add(key);

            // Notifica aceleração se é a primeira tecla pressionada
            if (wasEmpty && this.onAccelerationChange) {
                this.onAccelerationChange(true);
            }

            // Se for seta esquerda/direita, também tenta navegar emoji (menu/game over)
            if (this.onEmojiNavigation && (key === 'ArrowLeft' || key === 'ArrowRight')) {
                this.onEmojiNavigation(key === 'ArrowLeft' ? -1 : 1);
            }
            return;
        }

        // Tecla de espaço - iniciar/reiniciar
        if (key === ' ' || key === 'Enter') {
            event.preventDefault();
            this.onStart();
            return;
        }

        // Tecla P ou Escape - pausar
        if (key === 'p' || key === 'P' || key === 'Escape') {
            event.preventDefault();
            this.onPause();
            return;
        }
    }

    /**
     * Processa o evento de tecla solta
     * @param {KeyboardEvent} event - Evento do teclado
     */
    handleKeyUp(event) {
        const key = event.key;

        // Remove tecla do rastreamento
        if (KEY_BINDINGS[key]) {
            this.pressedKeys.delete(key);

            // Notifica fim da aceleração se nenhuma tecla está pressionada
            if (this.pressedKeys.size === 0 && this.onAccelerationChange) {
                this.onAccelerationChange(false);
            }
        }
    }

    /**
     * Verifica se uma tecla é de movimento
     * @param {string} key - Tecla pressionada
     * @returns {boolean} - true se é tecla de movimento
     */
    isMovementKey(key) {
        return KEY_BINDINGS.hasOwnProperty(key);
    }
}
