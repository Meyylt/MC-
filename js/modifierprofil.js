document.addEventListener("DOMContentLoaded", function () {
    let popup = document.getElementById("modifierPopup");
    let closePopup = document.getElementById("closePopup");
    let modifierBtn = document.getElementById("modifier"); // Récupérer le bouton Modifier

    // Afficher le pop-up quand on clique sur "Modifier le profil"
    modifierBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Empêcher le comportement par défaut
        popup.style.display = "flex";
        console.log("Affichage du pop-up...");
    });

    // Fermer le pop-up quand on clique sur ❌
    closePopup.addEventListener("click", function () {
        console.log("Fermeture du pop-up...");
        popup.style.display = "none";
    });
});