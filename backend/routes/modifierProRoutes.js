const express = require("express");
const router = express.Router(); 
const bd = require("../bd");


router.put("/:idUtilisateur", (req, res) => {
  const { idUtilisateur } = req.params;
  let { nom, prenom, adresse_mail, nom_utilisateur } = req.body;

  // Nettoyage des entrées
  nom = nom.trim();
  prenom = prenom.trim();
  adresse_mail = adresse_mail.trim();
  nom_utilisateur = nom_utilisateur.trim();

  // Validation des champs requis
  if (!nom || !prenom || !adresse_mail || !nom_utilisateur) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Validation de l'email avec une regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adresse_mail)) {
    return res.status(400).json({ message: "Email invalide" });
  }

  // Validation du nom d'utilisateur (lettres, chiffres, underscores seulement)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(nom_utilisateur)) {
    return res.status(400).json({
      message:
        "Nom d'utilisateur invalide (lettres, chiffres et underscores uniquement)",
    });
  }

  // Vérifier si l'utilisateur existe
  bd.query(
    "SELECT 1 FROM Utilisateur WHERE idUtilisateur = ?",
    [idUtilisateur],
    (err, results) => {
      if (err) {
        console.error("❌ Erreur de vérification utilisateur:", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Mise à jour du profil
      const query = `
            UPDATE Utilisateur 
            SET nom = ?, prenom = ?, adresse_mail = ?, nom_utilisateur = ? 
            WHERE idUtilisateur = ?
        `;

      bd.query(
        query,
        [nom, prenom, adresse_mail, nom_utilisateur, idUtilisateur],
        (err, result) => {
          if (err) {
            console.error("❌ Erreur lors de la modification:", err);
            if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(409)
                .json({ message: "Email ou nom d'utilisateur déjà utilisé" });
            }
            return res.status(500).json({ message: "Erreur serveur" });
          }

          if (result.affectedRows === 0) {
            return res
              .status(200)
              .json({ message: "Aucune modification effectuée" });
          }

          res.status(200).json({
            message: "✅ Profil mis à jour avec succès !",
            changes: result.affectedRows, // Nombre de lignes modifiées
          });
        }
      );
    }
  );
});

module.exports = router;
