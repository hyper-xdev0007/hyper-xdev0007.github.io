const categoryCards = document.querySelectorAll('.category-card');
const gameCards = document.querySelectorAll('.game-card');

categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const filter = card.getAttribute('data-filter');

        // Active category card ko highlight karo
        categoryCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Games ko filter karo
        gameCards.forEach(game => {
            if (filter === 'all' || game.getAttribute('data-category') === filter) {
                game.style.display = 'block';
            } else {
                game.style.display = 'none';
            }
        });
    });
});