document.addEventListener("DOMContentLoaded", function () {
    const boutonAvis = document.querySelector(".avis");
    const popup = document.getElementById("ajouterPopup");
    const closeBtn = document.getElementById("closePopupavis");

    // Affiche le popup quand on clique sur "Écrire un avis"
    boutonAvis.addEventListener("click", function () {
        popup.style.display = "flex";
    });

    // Ferme le popup quand on clique sur l'image de fermeture
    closeBtn.addEventListener("click", function () {
        popup.style.display = "none";
    });

    // (Optionnel) Ferme le popup si on clique en dehors de la boîte
    popup.addEventListener("click", function (e) {
        if (e.target === popup) {
            popup.style.display = "none";
        }
    });
});

const stars = document.querySelectorAll('.noteavis img');

stars.forEach((star, index) => {
    // Hover
    star.addEventListener('mouseover', () => {
        for (let i = 0; i <= index; i++) {
            stars[i].src = '../images/etoileplein.png'; // Remplace par ton chemin
        }
        for (let i = index + 1; i < stars.length; i++) {
            stars[i].src = '../images/etoil.png';
        }
    });

    // Mouse out -> reset
    star.addEventListener('mouseout', () => {
        updateStars(); // fonction pour remettre à l'état sélectionné
    });

    // Click pour sélectionner la note
    star.addEventListener('click', () => {
        selectedRating = index + 1;
        updateStars();
    });
});

let selectedRating = 0;

function updateStars() {
    stars.forEach((star, i) => {
        star.src = i < selectedRating ? '../images/etoileplein.png' : '../images/etoil.png';
    });
}
