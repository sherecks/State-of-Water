// Importar a lista de imagens das cartas
import { Deck1, Deck2 } from './decks.js';
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
    }
    
    // Habilitar o botão de confirmação
    document.querySelector('.confirm-button').disabled = false;
    
    console.log(`Deck ${deckId} carregado com ${cardImages.length} cartas`);
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
        { id: 'deck1', name: 'Maluk', image: 'Images/Cartas/CAPA.png' },
        { id: 'deck2', name: 'Sumba', image: 'Images/Cartas2/CAPA.png' }
    ];
    
    decks.forEach(deck => {
        const deckOption = document.createElement('img');
        deckOption.className = 'deck-option-img';
        deckOption.dataset.deckId = deck.id;
        deckOption.src = deck.image;
        deckOption.alt = deck.name;
        deckOption.title = deck.name;
        
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
    preloadDeckImages([Deck1, Deck2], () => {
        // Após o carregamento, iniciar o seletor de deck
        initDeckSelector();
        
        // Área de jogo
        const gameArea = document.getElementById('gameArea');

        // Abrir jogo - distribuir as cartas sem embaralhar as imagens
        document.getElementById('rollCard').addEventListener('click', () => {
            if (selectedCard) {
                rollCard(selectedCard);
            }
        });
        
        // Abrir jogo - distribuir as cartas sem embaralhar as imagens
        document.getElementById('openGame').addEventListener('click', () => {
            openGame();
        });
        
        // Embaralhar
        document.getElementById('shuffleDeck').addEventListener('click', () => {
            shuffleCards();
        });
    
        // Adicione este código na função initGame
        document.getElementById('openAllCards').addEventListener('click', () => {
            openAllCards();
        });
        
        // Excluir carta selecionada
        document.getElementById('deleteSelectedCard').addEventListener('click', () => {
            if (selectedCard) {
                deleteCard(selectedCard);
            }
        });
        
        // Limpar mesa
        document.getElementById('resetTable').addEventListener('click', () => {
            resetTable();
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
        gameArea.addEventListener('click', () => {
            if (selectedCard) {
                selectedCard.classList.remove('selected');
                selectedCard = null;
            }
        });
        
        // Mover carta com o mouse
        document.addEventListener('mousemove', moveCard);
        document.addEventListener('mouseup', stopDrag);
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
    
    // Determinar quantas cartas criar (no máximo o tamanho de cardImages)
    const cardCount = Math.min(5, cardImages.length);
    
    // Criar todas as cartas com posições diferentes
    for (let i = 0; i < cardCount; i++) {
        const card = createCard(cardImages[i].url);
        
        // Distribuir as cartas pela mesa
        card.style.left = (100 + i * 20) + 'px';
        card.style.top = (100 + i * 20) + 'px';
        currentCardIndex++;
        
        // Virar as cartas para baixo imediatamente após a criação
        flipCard(card);
    }
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
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('dblclick', () => flipCard(card));
    card.addEventListener('click', selectCard);
    
    gameArea.appendChild(card);
    cards.push(card);

    setTimeout(() => {
        initializeVanillaTilt(card);
    }, 100);
    
    return card;

}

function initializeVanillaTilt(card) {
    
    // Inicializar VanillaTilt com as configurações desejadas
    VanillaTilt.init(card, {
        max: 10,
        glare: true,
        "max-glare": 0.4,
        scale: 2,
        speed: 2000,
        perspective: 1000
    });
}

// DECK MANAGER -> COMEÇA AQUI
// Função para criar a próxima carta na ordem
function createNextCard() {
    if (currentCardIndex < cardImages.length) {
        const card = createCard(cardImages[currentCardIndex].url);
        
        // Posicionar a nova carta no mesmo formato de leque
        const index = cards.length - 1; // Índice da nova carta
        card.style.left = (100 + index * 20) + 'px';
        card.style.top = (100 + index * 20) + 'px';
        
        currentCardIndex++;
        
        // Virar a carta para baixo imediatamente após a criação
        flipCard(card);
    }
}

// Iniciar arrasto
function startDrag(e) {
    if (selectedCard !== this) {
        selectCard.call(this, e);
    }
    
    isDragging = true;
    
    const rect = this.getBoundingClientRect();
    // Calcular o offset relativo à posição do mouse dentro da carta
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    this.style.zIndex = zCounter++;
    
    e.preventDefault();
}

// Mover carta
function moveCard(e) {
    if (!isDragging || !selectedCard) return;
    
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

// Selecionar carta
function selectCard(e) {
    // Remover seleção anterior
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }
    
    selectedCard = this;
    selectedCard.classList.add('selected');
    selectedCard.style.zIndex = zCounter++;
    
    e.stopPropagation();
}

// Virar carta
function flipCard(card) {

    if (card.vanillaTilt) {
        card.vanillaTilt.destroy();
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

    setTimeout(() => {
        initializeVanillaTilt(card);
    }, 100);
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
    // Vamos embaralhar as imagens das cartas, não as cartas em si
    const availableImages = [...cardImages.map(card => card.url)]; // Criar uma cópia do array original
    
    // Embaralhar o array de imagens
    for (let i = availableImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableImages[i], availableImages[j]] = [availableImages[j], availableImages[i]];
    }
    
    // Distribuir as cartas pela mesa em formato de leque, como no iniciarJogo
    cards.forEach((card, index) => {
        // Se há imagens disponíveis, atribuir uma nova imagem à carta
        if (index < availableImages.length && card.dataset.faceUp === 'true') {
            const newImagePath = availableImages[index];
            
            // Atualizar o dataset e a imagem exibida
            card.dataset.imagePath = newImagePath;
            card.innerHTML = '';
            const img = document.createElement('img');
            img.src = newImagePath;
            img.alt = 'Carta';
            card.appendChild(img);
        }

        // Manter as cartas no formato de leque inicial
        card.style.transition = "left 0.8s, top 0.8s, transform 0.8s";
        card.style.left = (100 + index * 100) + 'px';
        card.style.top = (100 + index * 0) + 'px';
        
        card.style.zIndex = index + zCounter;
        
        // Remover a transição após a animação
        setTimeout(() => {
            card.style.transition = "transform 0.1s";
        }, 800);

        flipCard(card);
    });
    
    // Incrementar o zCounter para próximas operações
    zCounter += cards.length;
}

// Limpar a mesa
function resetTable() {
    cards.forEach(card => {
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
    
    cards.forEach((card, index) => {
        if (card.dataset.faceUp === 'false') {
            flipCard(card);
        }
        
        card.style.transition = "left 0.8s, top 0.8s, transform 0.8s";
        card.style.left = (100 + index * 80) + 'px';
        card.style.top = (100 + index * 0) + 'px';
        
        card.style.zIndex = index + zCounter;
        
        // Remover a transição após a animação
        setTimeout(() => {
            card.style.transition = "transform 0.1s";
        }, 800);
    });
    
    // Incrementar o zCounter para próximas operações
    zCounter += cards.length;

} 

// Girar a carta em 90°
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

    if ( currentAngle == 0 ){
        setTimeout(() => {
            initializeVanillaTilt(card);
        }, 50);
    }

}




