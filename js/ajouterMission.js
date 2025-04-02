document.addEventListener("DOMContentLoaded", function () {
    let form = document.getElementById("missionForm");
    let popup = document.getElementById("confirmationPopup");
    let closePopup = document.getElementById("closePopup");
  
    if (!form || !popup || !closePopup) {
      console.error("Un ou plusieurs éléments HTML sont introuvables !");
      return;
    }
  
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Empêche la soumission du formulaire par défaut
  
      let titre = document.getElementById("titre").value.trim();
      let description = document.getElementById("description").value.trim();
      let prix = document.getElementById("prix").value.trim();
      let delais = document.getElementById("delais").value.trim();
  
      // Vérification des champs
      if (!titre || !description || !prix || !delais) {
        alert("Veuillez remplir tous les champs avant de poster !");
        return;
      }
  
      if (isNaN(prix) || prix <= 0) {
        alert("Le prix doit être un nombre valide !");
        return;
      }
  
      if (!delais.match(/^\d+$/)) {
        alert("Le délai doit être un nombre uniquement !");
        return;
    }
  
      console.log("Affichage du pop-up...");
     
    });
  
    // Fermer le pop-up quand on clique sur ❌
    closePopup.addEventListener("click", function () {
      console.log("Fermeture du pop-up...");
      popup.style.display = "none";
      form.reset(); // Réinitialise le formulaire après validation
    });
  });
  
  