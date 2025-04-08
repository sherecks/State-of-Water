// Importar a lista de imagens das cartas
import { Deck1, Deck2, Deck3 } from './decks.js';
import { preloadDeckImages, preloadedImages } from './preload.js';

// Variáveis globais
let selectedCard = null;
let zCounter = 10;
let cardCount = 0;
let cards = [];
let cardImages = [];
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentCardIndex = 0; // Índice para controlar a ordem das cartas
let selectedDeck = null;

let selectedCards = []; // Array para armazenar múltiplas cartas selecionadas
let isMultiSelectMode = false; // Controle de modo de seleção múltipla


// FUNÇÕES PARA SELEÇÃO DO DECK!!!
function selectDeck(deckId) {
    // Limpar qualquer deck anterior
    cardImages = [];
    
    // Selecionar o deck com base no ID
    if (deckId === 'deck1') {
        // Importar o Deck1
        cardImages = Deck1;
        selectedDeck = 'deck1';
    } else if (deckId === 'deck2') {
        // Importar o Deck2
        cardImages = Deck2;
        selectedDeck = 'deck2';
    } else if (deckId === 'deck3') {
        // Importar o Deck2
        cardImages = Deck3;
        selectedDeck = 'deck3';
    }
    
    // Habilitar o botão de confirmação
    document.querySelector('.confirm-button').disabled = false;
    
    console.log(`Você escolheu o ${deckId} carregado com ${cardImages.length} cartas`);
}

// Adicione esta função para inicializar o seletor de deck
function initDeckSelector() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'deckSelectorOverlay';
    overlay.className = 'overlay';
    
    // Criar container do modal
    const modal = document.createElement('div');
    modal.className = 'deck-selector-modal';

    // Título
    const title1 = document.createElement('h1');
    title1.style = "text-align: center"
    title1.textContent = 'State of Water';
    modal.appendChild(title1);
    
    // Título
    const title2 = document.createElement('h2');
    title2.textContent = 'Selecione um Deck';
    modal.appendChild(title2);
    
    // Container para os decks
    const decksContainer = document.createElement('div');
    decksContainer.className = 'decks-container';
    
    // Adicionar opções de deck
    const decks = [
        { id: 'deck1', name: 'Reis do Mar', image: 'Images/Cartas/CAPA.png' },
        { id: 'deck2', name: 'Ataque Mortal', image: 'Images/Cartas2/CAPA.png' },
        { id: 'deck3', name: 'Poder e Ouro', image: 'Images/Cartas3/CAPA.png' },
    ];
    
    decks.forEach(deck => {
        const deckOption = document.createElement('img');
        deckOption.className = 'deck-option-img';
        deckOption.dataset.deckId = deck.id;
        deckOption.src = deck.image;
        deckOption.alt = deck.name;
        deckOption.title = deck.name;

        console.log(`${deck.id}: ${deck.name}`);

        
        // Adicionar evento de clique
        deckOption.addEventListener('click', () => {
            selectDeck(deck.id);
            decksContainer.querySelectorAll('.deck-option-img').forEach(opt => {
                opt.classList.remove('selected');
            });
            deckOption.classList.add('selected');
        });
        
        decksContainer.appendChild(deckOption);

    });
    
    
    modal.appendChild(decksContainer);
    
    // Botão de confirmação
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Começar Jogo';
    confirmButton.className = 'confirm-button';
    confirmButton.disabled = true; // Inicialmente desativado
    
    confirmButton.addEventListener('click', () => {
        if (selectedDeck) {
            overlay.style.display = 'none';
            iniciarJogo(); // Iniciar o jogo com o deck selecionado
        }
    });
    
    modal.appendChild(confirmButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Mostrar o modal
    overlay.style.display = 'flex';
}

// INICIAR A UI DO JOGO INTEIRO!!!
export function initGame() {
    // Iniciar com o pré-carregamento das imagens
    preloadDeckImages([Deck1, Deck2, Deck3], () => {
        // Após o carregamento, iniciar o seletor de deck
        initDeckSelector();
        
        // Área de jogo
        const gameArea = document.getElementById('gameArea');

        // Abrir jogo - distribuir as cartas sem embaralhar as imagens
        document.getElementById('rollCard').addEventListener('click', () => {
            if (selectedCard) {
                rollCard(selectedCard);
            }
            cards.forEach(card => {
                card.addEventListener('mousedown', selectCard);
            });
        });
        
        // Abrir jogo - distribuir as cartas sem embaralhar as imagens
        document.getElementById('openGame').addEventListener('click', () => {
            openGame();
        });
        
        // Embaralhar
        document.getElementById('shuffleDeck').addEventListener('click', () => {
            const shuffleBtn = document.getElementById('shuffleDeck');
            
            // Se o botão já está no estado de confirmação
            if (shuffleBtn.classList.contains('awaiting-confirmation')) {
                shuffleCards();
                shuffleBtn.classList.remove('awaiting-confirmation');
                shuffleBtn.textContent = 'Embaralhar'; 
                shuffleBtn.style.backgroundColor = '#007bff'; 
            } else {
                // Ativar estado de confirmação
                shuffleBtn.textContent = 'Tem Certeza?';
                shuffleBtn.classList.add('awaiting-confirmation');
                shuffleBtn.style.backgroundColor = '#F44336';
                
                // Resetar após 3 segundos se não confirmado
                setTimeout(() => {
                    if (shuffleBtn.classList.contains('awaiting-confirmation')) {
                        shuffleBtn.textContent = 'Embaralhar';
                        shuffleBtn.style.backgroundColor = '#007bff'
                        shuffleBtn.classList.remove('awaiting-confirmation');
                    }
                }, 3000);
            }
        });
    
        // Ver Deck
        document.getElementById('openAllCards').addEventListener('click', () => {
            const openAllBtn = document.getElementById('openAllCards');
            
            if (openAllBtn.classList.contains('awaiting-confirmation')) {
                openAllCards();
                openAllBtn.classList.remove('awaiting-confirmation');
                openAllBtn.textContent = 'Ver Deck';
                openAllBtn.style.backgroundColor = '#007bff'; 
            } else {
                openAllBtn.textContent = 'Tem Certeza?';
                openAllBtn.classList.add('awaiting-confirmation');
                openAllBtn.style.backgroundColor = '#F44336';
                
                setTimeout(() => {
                    if (openAllBtn.classList.contains('awaiting-confirmation')) {
                        openAllBtn.textContent = 'Ver Deck';
                        openAllBtn.style.backgroundColor = '#007bff'
                        openAllBtn.classList.remove('awaiting-confirmation');
                    }
                }, 3000);
            }
        });
        
        // Excluir carta selecionada
        document.getElementById('deleteSelectedCard').addEventListener('click', () => {
            const deleteBtn = document.getElementById('deleteSelectedCard');
            
            if (selectedCard) {
                deleteCard(selectedCard);
            }
        });
        
        // Limpar mesa
        document.getElementById('resetTable').addEventListener('click', () => {
            const resetBtn = document.getElementById('resetTable');
            
            if (resetBtn.classList.contains('awaiting-confirmation')) {
                resetTable();
                resetBtn.classList.remove('awaiting-confirmation');
                resetBtn.textContent = 'Limpar Mesa';
                resetBtn.style.backgroundColor = '#007bff'; 
            } else {
                resetBtn.textContent = 'Tem Certeza?';
                resetBtn.classList.add('awaiting-confirmation');
                resetBtn.style.backgroundColor = '#F44336';
                
                setTimeout(() => {
                    if (resetBtn.classList.contains('awaiting-confirmation')) {
                        resetBtn.textContent = 'Limpar Mesa';
                        resetBtn.style.backgroundColor = '#007bff';
                        resetBtn.classList.remove('awaiting-confirmation');
                    }
                }, 3000);
            }
        });
        
        // Baralho
        document.getElementById('deck').addEventListener('click', () => {
            if (cards.length < 60) {
                createNextCard();
            } else {
                alert('Limite de cartas atingido!');
            }
        });
        
        // Remover seleção ao clicar na área de jogo
        gameArea.addEventListener('click', (e) => {
            // Só limpe a seleção se não estiver segurando Ctrl
            selectedCards.forEach(card => {
                card.classList.remove('selected');
            });
            selectedCards = [];
            selectedCard = null;
        });

        // Empilhar todas as cartas
        document.getElementById('stackAllCards').addEventListener('click', () => {
            stackAllCards();
        });

        disableRightClick();
        
        // Mover carta com o mouse
        document.addEventListener('mousemove', moveCard);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('DOMContentLoaded', disableRightClick);

    });
}

// Desabilitar Botão Direito
function disableRightClick() {
    // Adicionar event listener para o documento inteiro
    document.addEventListener('contextmenu', function(e) {
        // Prevenir o comportamento padrão do clique direito
        e.preventDefault();
        
        return false; // Retornar falso para garantir que o menu não apareça
    });
    
}

// INICIA O JOGO, 5 CARTAS DO DECK EMBARALHADAS E COLOCADAS NA GAME AREA!!!
function iniciarJogo() {
    resetTable();
    
    // Verificar se cardImages está definido e tem elementos
    if (!cardImages || cardImages.length === 0) {
        return; // Sair da função se não houver imagens
    }

    // Embaralhar o array de imagens
    for (let i = cardImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardImages[i], cardImages[j]] = [cardImages[j], cardImages[i]];
    }
    
    // Usar um Set para rastrear cartas abertas
    const openedCards = new Set();

    // Criar todas as cartas do baralho
    cardImages.forEach((cardData, index) => {
        // Verificar se a carta já foi aberta
        if (!openedCards.has(cardData.url)) {
            const card = createCard(cardData.url);
            
            // Adicionar a carta ao Set para evitar duplicatas
            openedCards.add(cardData.url);
            
            // Posicionar as cartas na mesa
            card.style.left = (100 + index * 0) + 'px';
            card.style.top = (100 + index * 0) + 'px';
            
            // Virar as cartas para cima imediatamente após a criação
            flipCard(card);
        }
    });

    cards.forEach(card => {
        setTimeout(() => {
            openGame(card);
        }, 300);
    });
}


// CRIAÇÃO DAS CARTAS !!!
function createCard(imagePath) {
    const gameArea = document.getElementById('gameArea');
    cardCount++;
    
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'card-' + cardCount;
    card.dataset.faceUp = 'true';
    card.dataset.imagePath = imagePath;
    
    // Posicionar no baralho inicialmente
    const deck = document.getElementById('deck');
    const deckRect = deck.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    // Posicionamento ajustado
    card.style.left = '70px';
    card.style.top = '110px';
    card.style.zIndex = zCounter++;
    
    // Criar imagem da carta
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = 'Carta';
    card.appendChild(img);

    // Eventos da carta
    card.addEventListener('mousedown', function(e) {
        // Verificar se é o botão do meio (botão 1)
        if (e.button === 1) {
            e.preventDefault(); // Previne o comportamento padrão
            
            // Se já existe uma instância VanillaTilt, atualiza a escala
            if (card.vanillaTilt) {
                // Alterna entre escala normal e ampliada
                if (card.dataset.zoomed === 'true') {
                    card.vanillaTilt.settings.scale = 1;
                    card.dataset.zoomed = 'false';
                } else {
                    card.vanillaTilt.settings.scale = 2;
                    card.dataset.zoomed = 'true';
                }
                card.vanillaTilt.reset(); // Aplica as novas configurações
            }
            return false;
        }
    });
    
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('dblclick', () => flipCard(card));
    card.addEventListener('click', selectCard);
    
    gameArea.appendChild(card);
    cards.push(card);

    setTimeout(() => {
        initializeVanillaTilt(card);
    }, 200);
    
    return card;
}

function initializeVanillaTilt(card) {
    
    // Inicializar VanillaTilt com as configurações desejadas
    VanillaTilt.init(card, {
        max: 10,
        glare: true,
        "max-glare": 0.5,
        scale: 1,
        speed: 2000,
        perspective: 1000,
        transition: true,   // Garante transição suave
        easing: "cubic-bezier(.03,.98,.52,.99)",  // Curva de suavização
        gyroscope: true     // Adiciona suporte a giroscópio se disponível
    });
}


// DECK MANAGER -> COMEÇA AQUI
// Função para criar a próxima carta na ordem
function createNextCard() {
    if (currentCardIndex < cardImages.length) {
        const card = createCard(cardImages[currentCardIndex].url);
        const index = cards.length - 1; // Índice da nova carta

        // Obter a área de jogo e suas dimensões
        const gameArea = document.getElementById('gameArea');
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        // Definir a posição do monte no canto inferior esquerdo
        const stackX = 20;
        const stackY = gameAreaRect.height - 240;

        // Pequeno deslocamento entre cartas na pilha
        const offsetX = index * 1;
        const offsetY = index * 1;

        // Posicionar na pilha
        card.style.left = (stackX + offsetX) + 'px';
        card.style.top = (stackY - offsetY) + 'px';
        
        currentCardIndex++;

        flipCard(card);
    }
}

// Iniciar arrasto
function startDrag(e) {
    if (selectedCard !== this) {
        selectCard.call(this, e);
    }

    if (selectedCard !== this) {
        try {
            selectCard.call(this, e);
        } catch (error) {
            console.error("Erro ao chamar selectCard:", error);
        }
    }
    
    isDragging = true;
    
    const rect = this.getBoundingClientRect();
    // Calcular o offset relativo à posição do mouse dentro da carta
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    this.style.zIndex = zCounter++;

    // Adicione isso nas funções que incrementam zCounter
    if (zCounter > 1000) {
        zCounter = 10; 
        
        // Reorganizar os z-indexes de todas as cartas
        cards.sort((a, b) => parseInt(a.style.zIndex) - parseInt(b.style.zIndex))
            .forEach((card, index) => {
                card.style.zIndex = index + 10;
        });
    }
    
    e.preventDefault();
}

// Mover carta
function moveCard(e) {
    if (!isDragging || !selectedCard) return;

    if (cards.length === 0) return;

    cards.forEach(card => {
        if (card.vanillaTilt) {
            card.vanillaTilt.settings.scale = 1;
        }
    });
    
    const gameArea = document.getElementById('gameArea');
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    // Calcular nova posição relativa à área de jogo
    const newX = e.clientX - gameAreaRect.left - dragOffsetX;
    const newY = e.clientY - gameAreaRect.top - dragOffsetY;
    
    // Limitar ao tamanho da área de jogo
    selectedCard.style.left = Math.max(0, Math.min(gameAreaRect.width - 160, newX)) + 'px';
    selectedCard.style.top = Math.max(0, Math.min(gameAreaRect.height - 220, newY)) + 'px';

}

// Parar arrasto
function stopDrag() {
    isDragging = false;
}

// Função para selecionar uma carta
function selectCard(e) {
    // Remover a lógica de seleção múltipla
    if (e.button === 0) { // Verificar se é um clique com o botão esquerdo
        // Remover seleção de todas as cartas
        selectedCards.forEach(card => {
            card.classList.remove('selected');
        });
        selectedCards = [];
        
        // Selecionar apenas a carta atual
        selectedCard = this;
        selectedCard.classList.add('selected');
        selectedCard.style.zIndex = zCounter++;
        selectedCards.push(selectedCard);
    }
    e.stopPropagation();
}

// Virar carta
function flipCard(card) {

    if (card.vanillaTilt) {
        card.vanillaTilt.settings.scale = 1;
    }

    if (card.dataset.faceUp === 'true') {
        card.dataset.faceUp = 'false';
        card.innerHTML = '<img src="./Images/Cartas/Costas.png" alt="Costas da Carta">';
    } else {
        card.dataset.faceUp = 'true';
        const img = document.createElement('img');
        img.src = card.dataset.imagePath;
        img.alt = 'Carta';
        card.innerHTML = '';
        card.appendChild(img);
    }
}

// Função para abrir todas as cartas
function openAllCards() {
    // Limpar a mesa antes de abrir as cartas
    resetTable();

    // Usar um Set para rastrear cartas abertas
    const openedCards = new Set();

    // Criar todas as cartas do baralho
    cardImages.forEach((cardData, index) => {
        // Verificar se a carta já foi aberta
        if (!openedCards.has(cardData.url)) {
            const card = createCard(cardData.url);
            
            // Adicionar a carta ao Set para evitar duplicatas
            openedCards.add(cardData.url);
            
            // Posicionar as cartas na mesa
            card.style.left = (100 + index * 0) + 'px';
            card.style.top = (100 + index * 0) + 'px';
            
            // Virar as cartas para cima imediatamente após a criação
            flipCard(card);
        }
    });
}

// Embaralhar todas as cartas na mesa
function shuffleCards() {
    if (cards.length === 0) return; // Não fazer nada se não houver cartas
    
    // Desativar botões durante a animação
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
    
    // Remover possíveis seleções
    selectedCards.forEach(card => card.classList.remove('selected'));
    selectedCards = [];
    selectedCard = null;
    
    // Vamos embaralhar as imagens das cartas
    const availableImages = [...cardImages.map(card => card.url)];
    
    // Embaralhar o array de imagens
    for (let i = availableImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableImages[i], availableImages[j]] = [availableImages[j], availableImages[i]];
    }
    
    // Obter dimensões da área de jogo
    const gameArea = document.getElementById('gameArea');
    const gameAreaRect = gameArea.getBoundingClientRect();
    const centerX = gameAreaRect.width / 2 - 80; // Metade da largura da carta
    const centerY = gameAreaRect.height / 2 - 110; // Metade da altura da carta
    
    // Iniciar sequência de animação
    
    // 1. Destruir VanillaTilt em todas as cartas antes da animação
    cards.forEach(card => {
        card.vanillaTilt.settings.scale = 1;
    });
    
    // 2. Virar todas as cartas para baixo primeiro (se estiverem viradas para cima)
    const flipPromises = cards.map((card, index) => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (card.dataset.faceUp === 'true') {
                    flipCard(card);
                }
                resolve();
            }, index * 50); // Pequeno atraso entre cada carta
        });
    });
    
    // 3. Após virar todas, mover para o centro em pilha
    Promise.all(flipPromises).then(() => {
        const moveToMiddlePromises = cards.map((card, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    // Adicionar transição suave
                    card.style.transition = "left 0.5s, top 0.5s";
                    
                    // Posições aleatórias próximas ao centro
                    const randomOffsetX = Math.random() * 20 - 10;
                    const randomOffsetY = Math.random() * 20 - 10;
                    
                    // Mover para o centro com pequeno offset aleatório
                    card.style.left = (centerX + randomOffsetX) + 'px';
                    card.style.top = (centerY + randomOffsetY) + 'px';
                    card.style.zIndex = 1000 + index; // Empilhar
                    
                    // Resolver após a animação terminar
                    setTimeout(resolve, 500);
                }, index * 30);
            });
        });
        
        // 4. Depois que todas as cartas estiverem no centro, fazer animação de embaralhamento
        return Promise.all(moveToMiddlePromises);
    }).then(() => {
        // Animação de embaralhamento: mover rapidamente em direções aleatórias
        return new Promise(resolve => {
            // Número de movimentos de embaralhamento
            const shuffleMoves = 3;
            let moveCount = 0;
            
            const shuffleInterval = setInterval(() => {
                cards.forEach(card => {
                    // Transição mais rápida para movimentos de embaralhamento
                    card.style.transition = "left 0.15s, top 0.15s";
                    
                    // Movimento aleatório ao redor do centro
                    const randomOffsetX = Math.random() * 60 - 30;
                    const randomOffsetY = Math.random() * 60 - 30;
                    
                    card.style.left = (centerX + randomOffsetX) + 'px';
                    card.style.top = (centerY + randomOffsetY) + 'px';
                    
                    // Randomizar z-index para simular cartas passando por cima umas das outras
                    card.style.zIndex = 1000 + Math.floor(Math.random() * cards.length);
                });
                
                moveCount++;
                if (moveCount >= shuffleMoves) {
                    clearInterval(shuffleInterval);
                    resolve();
                }
            }, 200);
        });
    }).then(() => {
        // 5. Distribua as cartas em formato de leque
        return new Promise(resolve => {
            cards.forEach((card, index) => {

                // Obter as dimensões da área do jogo
                const gameArea = document.querySelector('.game-area');
                const gameAreaRect = gameArea.getBoundingClientRect();
                const gameAreaWidth = gameAreaRect.width;
                
                // Obter o tamanho de uma carta para cálculos
                const cardWidth = 160; // Com base no CSS que você forneceu
                
                // Calcular o espaçamento ideal entre cartas para caber todas na tela
                // Vamos deixar uma margem nas bordas (40px de cada lado)
                const totalCards = cards.length;
                const availableWidth = gameAreaWidth - 80;
                
                // O espaçamento será calculado para distribuir todas as cartas
                // Considere 70% da largura da carta para sobreposição parcial
                const spacing = Math.min(cardWidth * 0.3, (availableWidth - cardWidth) / (totalCards - 1));
                setTimeout(() => {
                    // Transição suave para distribuição
                    card.style.transition = "left 0.8s, top 0.8s, transform 0.8s";
                    
                    // Atualizar imagem da carta se estiver virada para cima
                    if (index < availableImages.length && card.dataset.faceUp === 'false') {
                        const newImagePath = availableImages[index];
                        card.dataset.imagePath = newImagePath;
                    }
                    
                    // Posição inicial (40px da margem esquerda + espaçamento calculado por índice)
                    const left = 40 + (index * spacing);
                    card.style.left = left + 'px';
                    card.style.top = '100px'; // Todas as cartas na mesma altura

                    card.style.zIndex = index + zCounter;
                    
                }, index * 80);
            });
            
            // Resolver após a última carta ser distribuída
            setTimeout(resolve, cards.length * 80 + 800);
        });
    }).then(() => {    
        // Reabilitar botões depois que todas as animações terminarem
        setTimeout(() => {
            buttons.forEach(btn => btn.disabled = false);
            
            // Gerenciar o zCounter
            if (zCounter > 1000) {
                zCounter = 10; // Resetar para um valor baixo
                
                // Reorganizar os z-indexes de todas as cartas
                cards.sort((a, b) => parseInt(a.style.zIndex) - parseInt(b.style.zIndex))
                    .forEach((card, index) => {
                        card.style.zIndex = index + 10;
                    });
            } else {
                // Incrementar o zCounter para próximas operações
                zCounter += cards.length;
            }
        }, cards.length * 100 + 500);
    });
}

// Limpar a mesa
function resetTable() {

    cards.forEach(card => {
        card.remove();
    });

    // Na função resetTable:
    cards.forEach(card => {
        if (card.vanillaTilt) {
            card.vanillaTilt.destroy();
        }
        card.remove();
    });

    cards = [];
    selectedCard = null;
    cardCount = 0;
    currentCardIndex = 0;
}

// Função para excluir uma carta específica
function deleteCard(card) {
    // Encontrar o índice da carta no array
    const index = cards.indexOf(card);

    if (card.vanillaTilt) {
        card.vanillaTilt.destroy();
    }
    
    // Se a carta foi encontrada
    if (index !== -1) {
        // Remover do DOM
        card.remove();
        
        // Remover do array de cartas
        cards.splice(index, 1);
        
        // Zerar a carta selecionada
        selectedCard = null;
    }
}

// Função para abrir o jogo - virar e distribuir cartas sem embaralhar
function openGame() {
    // Obter as dimensões da área do jogo
    const gameArea = document.querySelector('.game-area');
    const gameAreaRect = gameArea.getBoundingClientRect();
    const gameAreaWidth = gameAreaRect.width;
    
    // Obter o tamanho de uma carta para cálculos
    const cardWidth = 160; // Com base no CSS que você forneceu
    
    // Calcular o espaçamento ideal entre cartas para caber todas na tela
    // Vamos deixar uma margem nas bordas (40px de cada lado)
    const totalCards = cards.length;
    const availableWidth = gameAreaWidth - 80;
    
    // O espaçamento será calculado para distribuir todas as cartas
    // Considere 70% da largura da carta para sobreposição parcial
    const spacing = Math.min(cardWidth * 0.3, (availableWidth - cardWidth) / (totalCards - 1));
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            if (card.dataset.faceUp === 'false') {
                flipCard(card);
            }
        }, index * 80);
        
        card.style.transition = "left 0.8s, top 0.8s, transform 0.8s";
        
        // Posição inicial (40px da margem esquerda + espaçamento calculado por índice)
        const left = 40 + (index * spacing);
        card.style.left = left + 'px';
        card.style.top = '100px'; // Todas as cartas na mesma altura
        
        card.style.zIndex = index + zCounter;
        
        // Remover a transição após a animação
        setTimeout(() => {
            card.style.transition = "transform 0.1s";
        }, 800);
    });
    
    // Incrementar o zCounter para próximas operações
    zCounter += cards.length;
}

function rollCard(card) {
    if (card.vanillaTilt) {
        card.vanillaTilt.destroy();
    }

    // Obtém o ângulo atual da carta ou define como 0 se ainda não existir
    let currentAngle = parseInt(card.getAttribute("data-angle")) || 0;
    
    // Alterna entre 0° e 90°
    currentAngle = (currentAngle === 0) ? 90 : 0;

    // Aplica a rotação
    card.style.transform = `rotate(${currentAngle}deg)`;

    // Salva o novo ângulo na carta
    card.setAttribute("data-angle", currentAngle);

    if (currentAngle == 0) {
        setTimeout(() => {
            initializeVanillaTilt(card);
        }, 200);
    }
}

// Função para empilhar todas as cartas no canto inferior esquerdo
function stackAllCards() {
    if (cards.length === 0) return; // Não fazer nada se não houver cartas
    
    // Obter a área de jogo e suas dimensões
    const gameArea = document.getElementById('gameArea');
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    // Definir a posição do monte no canto inferior esquerdo
    const stackX = 20;
    const stackY = gameAreaRect.height - 240;
    
    // Remover seleção de todas as cartas
    selectedCards.forEach(card => card.classList.remove('selected'));
    selectedCards = [];
    selectedCard = null;
    
    // Empilhar as cartas com um pequeno deslocamento
    cards.forEach((card, index) => {
        // Adicionar transição suave
        card.style.transition = "left 0.4s, top 0.4s";
        
        // Pequeno deslocamento entre cartas na pilha
        const offsetX = index * 1;
        const offsetY = index * 1;
        
        // Posicionar na pilha
        card.style.left = (stackX + offsetX) + 'px';
        card.style.top = (stackY - offsetY) + 'px';
        
        // Definir z-index para empilhamento correto
        card.style.zIndex = 100 + index;
    });

}





