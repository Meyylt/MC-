// Sélectionner les éléments nécessaires
let acceptButtons = document.querySelectorAll(".accept");
let confirmationPopup = document.getElementById("confirmationPopup");
let closePopupButton = document.getElementById("closePopup");


// Fonction pour afficher la pop-up
function showPopup() {
    confirmationPopup.style.display = "flex";
}
// Ajouter un événement à chaque bouton "Accepter"
acceptButtons.forEach(button => {
    button.addEventListener("click", showPopup);
});

closePopupButton.addEventListener("click", function () {
    console.log("Fermeture du pop-up...");
    confirmationPopup.style.display = "none";
  });




