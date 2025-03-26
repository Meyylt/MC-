const express = require("express");
const router = express.Router();
const bd = require("../bd");

// Ajouter un utilisateur en tant que client
router.post("/add", (req, res) => {
    console.log(req.body);
    const { nom, prenom, adresse_mail, mot_de_passe } = req.body; // Utilisation des bons noms de colonnes

    if (!nom || !prenom || !adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Insertion de l'utilisateur dans la table Utilisateur
    const queryUtilisateur = "INSERT INTO Utilisateur (nom, prenom, adresse_mail, mot_de_passe) VALUES (?, ?, ?, ?)";
    
    bd.query(queryUtilisateur, [nom, prenom, adresse_mail, mot_de_passe], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout de l'utilisateur :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        const idUtilisateur = result.insertId; // Récupère l'ID du nouvel utilisateur
        const queryFreelancer = "INSERT INTO Freelancer (idUtilisateur) VALUES (?)";

        bd.query(queryFreelancer, [idUtilisateur], (err) => {
            if (err) {
                console.error("❌ Erreur lors de l'ajout du freelancer :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            res.status(201).json({ message: "✅ freelancer ajouté avec succès !" });
        });
    });
});


module.exports = router;
