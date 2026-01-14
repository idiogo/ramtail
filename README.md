# 🐑 RamTail - O Carneiro Faminto

Um jogo estilo Snake onde você controla um carneiro faminto que come capim e milho para crescer seu rabo! Agora com **modo multiplayer**!

## 📸 Screenshot

```
🐑 RamTail 🐑
👥 Modo Multiplayer

┌─────────────────────────────┐
│ 🌿  🐑~~~~     🐏~~         │
│         ~        ~          │
│              🌽             │
│                             │
│ Pontos: 30    👥 2 jogadores│
└─────────────────────────────┘
```

## 🎮 Como Jogar

1. Pressione **ESPAÇO** para iniciar o jogo
2. Use as **setas** ou **WASD** para mover o carneiro
3. Coma o **capim** (🌿) para crescer 1 segmento
4. Coma o **milho** (🌽) para crescer 2 segmentos (raro!)
5. Coma a **cenoura** (🥕) para crescer 10 segmentos (muito rara!)
6. **Não** encoste no seu próprio rabo ou nas paredes!

### Controles

| Tecla | Ação |
|-------|------|
| ↑ / W | Mover para cima |
| ↓ / S | Mover para baixo |
| ← / A | Mover para esquerda |
| → / D | Mover para direita |
| ESPAÇO | Iniciar / Reiniciar |
| P / ESC | Pausar |

## 🚀 Como Rodar

### Modo Single Player (simples)

Use qualquer servidor HTTP:

```bash
cd snake
python3 -m http.server 8080
```

Acesse: `http://localhost:8080`

### Modo Multiplayer

O multiplayer requer o servidor Node.js:

```bash
# 1. Instale as dependências
cd snake
npm install

# 2. Inicie o servidor
npm start
```

Acesse: `http://localhost:3000`

#### Jogando com amigos

1. Acesse `http://localhost:3000?room=NOME_DA_SALA`
2. Compartilhe o link com seus amigos
3. Todos que acessarem o mesmo link estarão na mesma sala!
4. **Quem pegar a comida primeiro, ganha o crescimento!**

Exemplos:
- `http://localhost:3000?room=amigos`
- `http://localhost:3000?room=familia`
- `http://localhost:3000?room=trabalho`

## 📦 Estrutura do Projeto

```
snake/
├── index.html              # Página principal
├── package.json            # Dependências Node.js
├── README.md               # Este arquivo
├── server/
│   └── index.js            # Servidor WebSocket multiplayer
├── src/
│   ├── main.js             # Ponto de entrada
│   ├── game/
│   │   ├── constants.js    # Constantes do jogo
│   │   ├── Game.js         # Lógica principal
│   │   ├── Lamb.js         # Entidade do carneiro
│   │   └── Food.js         # Sistema de comida
│   ├── render/
│   │   └── Renderer.js     # Renderização no canvas
│   ├── input/
│   │   └── InputHandler.js # Controles do teclado
│   └── network/
│       └── NetworkManager.js # Gerenciador de rede
├── styles/
│   └── style.css           # Estilos da página
└── assets/
    └── ram-head.png        # Imagem da cabeça do carneiro
```

## 🌐 Deploy

### GitHub Pages (Single Player apenas)

O GitHub Pages suporta apenas o modo single player (sem servidor WebSocket):

1. Faça push do código para o GitHub
2. Ative GitHub Pages nas configurações
3. Acesse: `https://SEU_USUARIO.github.io/ramtail/`

### Servidor próprio (Multiplayer)

Para multiplayer, você precisa hospedar o servidor Node.js:

1. **Heroku, Railway, Render** - Plataformas que suportam Node.js
2. **VPS** - DigitalOcean, AWS, etc.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE                          │
├─────────────────────────────────────────────────────┤
│  main.js ─── Game.js ─── Renderer.js               │
│              │   │                                  │
│              │   └── Lamb.js, Food.js              │
│              │                                      │
│              └── NetworkManager.js (multiplayer)   │
└──────────────────────┬──────────────────────────────┘
                       │ WebSocket
┌──────────────────────┴──────────────────────────────┐
│                   SERVIDOR                          │
├─────────────────────────────────────────────────────┤
│  server/index.js                                    │
│  - Gerencia salas de jogo                          │
│  - Sincroniza posições dos jogadores               │
│  - Valida quem pegou comida primeiro               │
└─────────────────────────────────────────────────────┘
```

## ⚙️ Configurações

As constantes do jogo em `src/game/constants.js`:

```javascript
CANVAS_WIDTH: 600       // Largura do canvas
CANVAS_HEIGHT: 600      // Altura do canvas
CELL_SIZE: 20           // Tamanho de cada célula
GAME_SPEED: 150         // Velocidade (menor = mais rápido)
CORN_PROBABILITY: 10    // Chance de milho (10%)
CARROT_PROBABILITY: 2   // Chance de cenoura (2%)
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
