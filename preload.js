// Objeto para armazenar as imagens pré-carregadas
export const preloadedImages = {};

// Função para pré-carregar as imagens antes de iniciar o jogo
export function preloadDeckImages(decks, callback) {
    // Coletar URLs únicas de todas as imagens dos decks
    const imageUrls = new Set();
    
    // Adicionar URLs de todos os decks
    decks.forEach(deck => {
        deck.forEach(card => {
            imageUrls.add(card.url);
        });
    });
    
    // Adicionar a imagem das costas das cartas
    imageUrls.add('./Images/Cartas/Costas.png');
    
    const totalImages = imageUrls.size;
    let loadedCount = 0;
    
    // Criar um elemento de status de carregamento (opcional)
    const loadingStatus = document.createElement('div');
    loadingStatus.id = 'loadingStatus';
    document.body.appendChild(loadingStatus);
    
    // Função para atualizar o status
    function updateStatus() {
        const percent = Math.floor((loadedCount / totalImages) * 100);
        
        // Se todas as imagens foram carregadas, remover o status e chamar o callback
        if (loadedCount === totalImages) {
            setTimeout(() => {
                loadingStatus.remove();
                if (typeof callback === 'function') {
                    callback();
                }
            }, 500); // Pequeno delay para garantir que o usuário veja 100%
        }
    }
    
    // Carregar cada imagem
    imageUrls.forEach(url => {
        const img = new Image();
        
        img.onload = function() {
            preloadedImages[url] = img; // Armazenar a imagem carregada
            loadedCount++;
            updateStatus();
        };
        
        img.onerror = function() {
            console.error(`Erro ao carregar imagem: ${url}`);
            loadedCount++;
            updateStatus();
        };
        
        img.src = url;
    });
}