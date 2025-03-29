const express = require("express");
const router = express.Router();
const bd = require("../bd");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "votre_secret";

// Ajouter un freelancer
router.post("/add", (req, res) => {
    console.log(req.body);
    const { nom, prenom, adresse_mail, mot_de_passe } = req.body;

    if (!nom || !prenom || !adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const queryUtilisateur = "INSERT INTO Utilisateur (nom, prenom, adresse_mail, mot_de_passe, role) VALUES (?, ?, ?, ?, 'freelancer')";
    
    bd.query(queryUtilisateur, [nom, prenom, adresse_mail, mot_de_passe], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout de l'utilisateur :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        const idUtilisateur = result.insertId;
        const queryFreelancer = "INSERT INTO Freelancer (idUtilisateur) VALUES (?)";

        bd.query(queryFreelancer, [idUtilisateur], (err) => {
            if (err) {
                console.error("❌ Erreur lors de l'ajout du freelancer :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            res.status(201).json({ 
                message: "✅ Freelancer ajouté avec succès !",
                role: 'freelancer'
            });
        });
    });
});

// Connexion freelancer
router.post("/login", (req, res) => {
    const { adresse_mail, mot_de_passe } = req.body;

    if (!adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

    const query = `
       SELECT Utilisateur.*, Freelancer.idFreelancer
       FROM Utilisateur
       LEFT JOIN Freelancer ON Utilisateur.idUtilisateur = Freelancer.idUtilisateur
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

        // Vérification supplémentaire pour s'assurer que c'est un freelancer
        if (!utilisateur.idFreelancer) {
            return res.status(403).json({ message: "❌ Ce compte n'est pas un compte freelancer" });
        }

        // Vérification du mot de passe (à remplacer par bcrypt en production)
        if (mot_de_passe !== utilisateur.mot_de_passe) {
            return res.status(401).json({ message: "❌ Adresse e-mail ou mot de passe incorrect" });
        }

        // Génération du token JWT avec plus d'informations
        const token = jwt.sign(
            { 
                id: utilisateur.idUtilisateur,
                idFreelancer: utilisateur.idFreelancer,
                role: 'freelancer',
                email: utilisateur.adresse_mail
            }, 
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Réponse complète
        res.status(200).json({ 
            message: "✅ Connexion freelancer réussie", 
            token,
            user: {
                id: utilisateur.idUtilisateur,
                idFreelancer: utilisateur.idFreelancer,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.adresse_mail,
                role: 'freelancer'
            }
        });
    });
});

module.exports = router;