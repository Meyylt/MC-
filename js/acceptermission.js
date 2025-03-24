// Sélectionner les éléments nécessaires
let acceptButtons = document.querySelectorAll(".accept");
let confirmationPopup = document.getElementById("confirmationPopup");
let closePopupButton = document.getElementById("closePopup");

let confirmerButtons = document.querySelectorAll(".confirmer");
let confirmerPopup = document.getElementById("missionconfirmer");
let confirmerclosePopupButton = document.getElementById("confirmerclosePopup");

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


function showconfirmerPopup() {
    confirmerPopup.style.display = "flex";
    confirmationPopup.style.display = "none";
}
// Ajouter un événement à chaque bouton "Accepter"
confirmerButtons.forEach(button => {
    button.addEventListener("click", showconfirmerPopup);
    
});

confirmerclosePopupButton.addEventListener("click", function () {
    console.log("Fermeture du pop-up...");
    confirmerPopup.style.display = "none";
  });


