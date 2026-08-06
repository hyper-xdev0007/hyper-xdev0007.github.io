const emojis = ["🎮", "🎮", "🕹️", "🕹️", "👾", "👾", "🎲", "🎲", "🏆", "🏆", "⚡", "⚡", "🎯", "🎯", "🚀", "🚀"];
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let lock = false;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function init() {
    cards = shuffle([...emojis]);
    flippedCards = [];
    matchedCount = 0;
    moves = 0;
    lock = false;
    document.getElementById("score").textContent = moves;
    renderBoard();
}

function renderBoard() {
    const board = document.getElementById("memory-board");
    board.innerHTML = "";

    cards.forEach((emoji, index) => {
        const card = document.createElement("div");
        card.classList.add("memory-card");
        card.dataset.index = index;
        card.addEventListener("click", () => flipCard(index));
        board.appendChild(card);
    });
}

function flipCard(index) {
    if (lock) return;
    const cardEls = document.querySelectorAll(".memory-card");
    const cardEl = cardEls[index];

    if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;
    if (flippedCards.length >= 2) return;

    cardEl.textContent = cards[index];
    cardEl.classList.add("flipped");
    flippedCards.push(index);

    if (flippedCards.length === 2) {
        moves++;
        document.getElementById("score").textContent = moves;
        lock = true;

        const [first, second] = flippedCards;
        if (cards[first] === cards[second]) {
            setTimeout(() => {
                cardEls[first].classList.add("matched");
                cardEls[second].classList.add("matched");
                flippedCards = [];
                matchedCount += 2;
                lock = false;
                if (matchedCount === cards.length) {
                    setTimeout(() => alert("You won! Moves: " + moves), 300);
                }
            }, 500);
        } else {
            setTimeout(() => {
                cardEls[first].textContent = "";
                cardEls[second].textContent = "";
                cardEls[first].classList.remove("flipped");
                cardEls[second].classList.remove("flipped");
                flippedCards = [];
                lock = false;
            }, 800);
        }
    }
}

document.getElementById("restart-btn").addEventListener("click", init);

init();