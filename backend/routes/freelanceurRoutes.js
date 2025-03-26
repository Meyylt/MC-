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

const jwt = require("jsonwebtoken"); // Importer JWT
const SECRET_KEY = "votre_secret"; // ⚠️ Stocker dans un fichier .env

router.post("/login", (req, res) => {
    const { adresse_mail, mot_de_passe } = req.body;

    if (!adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

     // Requête pour récupérer idFreelanceur en plus des infos utilisateur
     const query = `
       SELECT Utilisateur.*, Freelancer.idFreelancer
       FROM Utilisateur
       INNER JOIN Freelancer ON Utilisateur.idUtilisateur = Freelancer.idUtilisateur
       WHERE Utilisateur.adresse_mail = ?`;


    bd.query(query, [adresse_mail], (err, results) => {
        if (err) {
            console.error("❌ Erreur serveur :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "❌ Adresse e-mail ou mot de passe incorrect" });
        }

        const utilisateur = results[0];

        // Vérification du mot de passe en clair (⚠️ moins sécurisé)
        if (mot_de_passe !== utilisateur.mot_de_passe) {
            return res.status(401).json({ message: "❌ Adresse e-mail ou mot de passe incorrect" });
        }

        // Génération du token JWT
        const token = jwt.sign({ idFreelancer: utilisateur.idFreelancer }, SECRET_KEY);

        res.status(200).json({ message: "✅ Connexion réussie", token, utilisateur });
    });
});


module.exports = router;
