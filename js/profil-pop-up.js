// Sélectionne l'icône de notification et le pop-up
const profilIcon = document.querySelector(".profil-pop-up");
const profilPopup = document.querySelector(".pop-up-profil");

// Affiche le pop-up lorsque la souris passe sur l'icône
profilIcon.addEventListener("mouseover", () => {
    profilPopup.style.display = "block";
});

// Cache le pop-up lorsque la souris quitte l'icône ou le pop-up lui-même
profilIcon.addEventListener("mouseout", (e) => {
    if (!profilPopup.contains(e.relatedTarget)) {
        profilPopup.style.display = "none";
    }
});

profilPopup.addEventListener("mouseleave", () => {
    profilPopup.style.display = "none";
});
