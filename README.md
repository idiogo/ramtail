# 🐑 RamTail - O Carneiro Faminto

Um jogo estilo Snake onde você controla um carneiro faminto que come capim e milho para crescer seu rabo!

## 📸 Screenshot

```
🐑 RamTail 🐑
O Carneiro Faminto!

┌─────────────────────────────┐
│ 🌿  🐑~~~~                  │
│         ~                   │
│              🌽             │
│                             │
│     Pontos: 30              │
└─────────────────────────────┘
```

## 🎮 Como Jogar

1. Pressione **ESPAÇO** para iniciar o jogo
2. Use as **setas** ou **WASD** para mover o carneiro
3. Coma o **capim** (🌿) para crescer 1 segmento
4. Coma o **milho** (🌽) para crescer 2 segmentos (aparece 10% das vezes!)
5. **Não** encoste no seu próprio rabo ou nas paredes!

### Controles

| Tecla | Ação |
|-------|------|
| ↑ / W | Mover para cima |
| ↓ / S | Mover para baixo |
| ← / A | Mover para esquerda |
| → / D | Mover para direita |
| ESPAÇO | Iniciar / Reiniciar |
| P / ESC | Pausar |

## 🚀 Como Rodar Localmente

### Opção 1: Servidor HTTP simples (Recomendado)

O jogo usa módulos ES6, então precisa de um servidor HTTP. Escolha uma das opções:

**Com Python 3:**
```bash
cd snake
python3 -m http.server 8080
```

**Com Python 2:**
```bash
cd snake
python -m SimpleHTTPServer 8080
```

**Com Node.js (npx):**
```bash
cd snake
npx serve
```

**Com PHP:**
```bash
cd snake
php -S localhost:8080
```

Depois, abra no navegador: `http://localhost:8080`

### Opção 2: Extensão Live Server (VS Code)

1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no `index.html`
3. Selecione "Open with Live Server"

## 📦 Estrutura do Projeto

```
snake/
├── index.html              # Página principal
├── README.md               # Este arquivo
├── src/
│   ├── main.js             # Ponto de entrada
│   ├── game/
│   │   ├── constants.js    # Constantes do jogo
│   │   ├── Game.js         # Lógica principal
│   │   ├── Lamb.js         # Entidade do carneiro
│   │   └── Food.js         # Sistema de comida
│   ├── render/
│   │   └── Renderer.js     # Renderização no canvas
│   └── input/
│       └── InputHandler.js # Controles do teclado
├── styles/
│   └── style.css           # Estilos da página
└── assets/                 # Pasta para recursos (sprites, sons)
```

## 🌐 Deploy no GitHub Pages

1. **Crie um repositório** no GitHub

2. **Inicialize o Git e faça push:**
```bash
cd snake
git init
git add .
git commit -m "Initial commit: RamTail game"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ramtail.git
git push -u origin main
```

3. **Ative o GitHub Pages:**
   - Vá em Settings > Pages
   - Em "Source", selecione "Deploy from a branch"
   - Selecione a branch `main` e pasta `/ (root)`
   - Clique em "Save"

4. **Acesse seu jogo em:**
   ```
   https://SEU_USUARIO.github.io/ramtail/
   ```

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular com separação de responsabilidades:

- **Game Logic** (`src/game/`): Contém toda a lógica do jogo
  - `Game.js`: Orquestra o game loop e estados
  - `Lamb.js`: Controla o carneiro e seu rabo
  - `Food.js`: Gerencia a comida (capim e milho)
  - `constants.js`: Configurações centralizadas

- **Rendering** (`src/render/`): Responsável pela parte visual
  - `Renderer.js`: Desenha todos os elementos no canvas

- **Input** (`src/input/`): Gerencia entradas do usuário
  - `InputHandler.js`: Captura e processa eventos de teclado

## ⚙️ Configurações

As constantes do jogo podem ser ajustadas em `src/game/constants.js`:

```javascript
// Tamanho do canvas
CANVAS_WIDTH: 600
CANVAS_HEIGHT: 600

// Tamanho de cada célula do grid
CELL_SIZE: 20

// Velocidade (menor = mais rápido)
GAME_SPEED: 150

// Probabilidade de milho (10 = 10%)
CORN_PROBABILITY: 10
```

## 🤝 Contribuindo

Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

## 📝 Licença

Este projeto é livre para uso educacional e pessoal.

---

Feito com 💚 e JavaScript puro
