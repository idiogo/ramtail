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
     */
    constructor(onDirectionChange, onStart, onPause) {
        this.onDirectionChange = onDirectionChange;
        this.onStart = onStart;
        this.onPause = onPause;

        // Bind do método para manter contexto
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Inicia escutando eventos
        this.iniciar();
    }

    /**
     * Inicia a escuta de eventos de teclado
     */
    iniciar() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Para a escuta de eventos (útil para limpeza)
     */
    parar() {
        document.removeEventListener('keydown', this.handleKeyDown);
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
     * Verifica se uma tecla é de movimento
     * @param {string} key - Tecla pressionada
     * @returns {boolean} - true se é tecla de movimento
     */
    isMovementKey(key) {
        return KEY_BINDINGS.hasOwnProperty(key);
    }
}
