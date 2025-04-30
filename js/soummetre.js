const cards = document.querySelectorAll('.missionsou');

cards.forEach(card => {
    card.addEventListener('click', () => {
        // Enlève 'active' de toutes les cartes
        cards.forEach(c => c.classList.remove('active'));
        
        // Ajoute 'active' à la carte cliquée
        card.classList.add('active');
    });
});