(() => {
    // Array de 6 imagens 
    const uniqueImages = [
      {
        src: '../img/garota.jpeg',
        alt: 'Imagem garota melancolica'
      },
      {
        src: '../img/morango.jpeg',
        alt: 'Imagem suave com tons rosa pastel e formas arredondadas'
      },
      {
        src: '../img/gatinho.jpeg',
        alt: 'Imagem minimalista em bege claro com linhas delicadas'
      },
      {
        src: '../img/coelhinho.jpeg',
        alt: 'Imagem de fundo coral com detalhes em preto elegante'
      },
      {
        src: '../img/estrela.jpeg',
        alt: 'Imagem escura com detalhes rosados e design sofisticado'
      },
      {
        src: '../img/cogumelo.jpeg',
        alt: 'Imagem claro-rosada com padrão geométrico moderno'
      }
    ];

    // Duplica as imagens para formar pares
    let cardsData = uniqueImages.concat(uniqueImages);

    // Referências aos elementos do HTML
    const gameBoard = document.getElementById('game-board');
    const movesDisplay = document.querySelector('.moves');
    const startBtn = document.getElementById('start');
    const restartBtn = document.getElementById('restart');

    // Variáveis para controlar o jogo
    let flippedCards = [];   // cartas atualmente viradas
    let matchedCount = 0;    // quantidade de pares encontrados
    let moves = 0;           // contagem de jogadas
    let lockBoard = true;    // bloqueia interações temporariamente
    let gameStarted = false; // controla estado do jogo

    /**
     * Embaralhar o array usando algoritmo Fisher–Yates
     * @param {Array} array 
     * @returns {Array} array embaralhado
     */
    function shuffle(array) {
      for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    /**
     * Cria o elemento DOM da carta com imagem
     * @param {Object} imageObj - objeto {src, alt}
     * @param {number} index - índice para atribuição única
     * @returns {HTMLElement} elemento da carta
     */
    function createCard(imageObj, index) {
      // Botão para acessibilidade e foco
      const card = document.createElement('button');
      card.classList.add('card');
      card.type = 'button';
      card.setAttribute('aria-label', `Carta de memória: ${imageObj.alt}`);
      card.setAttribute('data-index', index);

      // Efeito 3D para virar
      const cardInner = document.createElement('div');
      cardInner.classList.add('card-inner');

      // Frente da carta com a imagem
      const cardFront = document.createElement('div');
      cardFront.classList.add('card-front');
      const img = document.createElement('img');
      img.src = imageObj.src;
      img.alt = imageObj.alt;
      img.draggable = false; // evita arrastar a imagem
      cardFront.appendChild(img);

      // Verso da carta com símbolo '?'
      const cardBack = document.createElement('div');
      cardBack.classList.add('card-back');

      // Compondo a estrutura da carta
      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      card.appendChild(cardInner);

      // Evento de clique para virar carta
      card.addEventListener('click', () => {
        if(lockBoard) return; // bloqueado para interação
        if(card.classList.contains('flipped') || card.classList.contains('matched')) return;

        flipCard(card);
      });

      // Suporte teclado: Enter ou Espaço para virar carta
      card.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });

      return card;
    }

    /**
     * Vira uma carta para cima e verifica combinações
     * @param {HTMLElement} card 
     */
    function flipCard(card) {
      if(lockBoard) return;

      card.classList.add('flipped');
      flippedCards.push(card);

      // Se duas cartas viradas, verifica se combinam
      if(flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = `Jogadas: ${moves}`;

        checkForMatch();
      }
    }

    /**
     * Verifica se as duas cartas viradas formam um par
     * Se sim, marca como combinadas; se não, vira pro verso novamente após delay
     */
    function checkForMatch() {
      // Bloqueia interações enquanto avalia
      lockBoard = true;

      const [card1, card2] = flippedCards;

      // Compara as imagens das cartas
      const img1 = card1.querySelector('.card-front img');
      const img2 = card2.querySelector('.card-front img');

      if(img1.src === img2.src) {
        // Par correto
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCount += 2;
        flippedCards = [];
        lockBoard = false;

        // Verifica se venceu (todas as cartas combinadas)
        if(matchedCount === cardsData.length) {
          setTimeout(() => {
            alert(`Parabéns! Você venceu em ${moves} jogadas.`);
          }, 300);
        }
      } else {
        // Par incorreto: vira as cartas para baixo após atraso
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          flippedCards = [];
          lockBoard = false;
        }, 1000);
      }
    }

    /**
     * Renderiza o tabuleiro com as cartas no array dado
     * @param {Array} cardsArr - array de imagens (pares)
     * @param {Boolean} showFaceUp - true para mostrar cartas viradas para cima, false para viradas para baixo
     */
    function renderBoard(cardsArr, showFaceUp = false) {
      gameBoard.innerHTML = '';
      cardsArr.forEach((imageObj, i) => {
        const card = createCard(imageObj, i);
        if(showFaceUp) {
          card.classList.add('flipped');
        }
        gameBoard.appendChild(card);
      });
    }

    /**
     * Inicializa o jogo na carga da página:
     * Exibe as cartas em sequência ordenada, todas viradas para cima.
     * Reseta contadores e estados.
     */
    function initializeGame() {
      matchedCount = 0;
      moves = 0;
      movesDisplay.textContent = `Jogadas: ${moves}`;
      flippedCards = [];
      lockBoard = true;
      gameStarted = false;
      startBtn.disabled = false;
      restartBtn.disabled = true;

      // Exibe cartas na ordem original viradas para cima
      renderBoard(cardsData, true);
    }

    /**
     * Inicia o jogo ao clicar botão "Iniciar":
     * Embaralha as cartas e mostra todas viradas para baixo.
     * Desabilita botão "Iniciar", habilita botão "Reiniciar".
     */
    function startGame() {
      if(gameStarted) return;
      gameStarted = true;
      moves = 0;
      movesDisplay.textContent = `Jogadas: ${moves}`;
      flippedCards = [];
      matchedCount = 0;
      lockBoard = false;
      startBtn.disabled = true;
      restartBtn.disabled = false;

      // Embaralha cartas e renderiza viradas para baixo
      shuffle(cardsData);
      renderBoard(cardsData, false);
    }

    /**
     * Reinicia o jogo ao clicar botão "Reiniciar":
     * Embaralha as cartas, reseta contadores e exibe cartas viradas para baixo.
     */
    function restartGame() {
      if(!gameStarted) return;
      moves = 0;
      movesDisplay.textContent = `Jogadas: ${moves}`;
      flippedCards = [];
      matchedCount = 0;
      lockBoard = false;

      shuffle(cardsData);
      renderBoard(cardsData, false);

      restartBtn.focus();
    }

    // Adiciona ouvintes de evento aos botões
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);

    // Inicializa o jogo quando a página carregar
    initializeGame();
  })();