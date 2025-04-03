// Dans votre fichier de routes (service.js ou similaire)
const express = require("express");
const router = express.Router();
const bd = require("../bd");

const authMiddleware = require("../middleware/auth");

// Ajouter un service (protégé)
router.post("/add", authMiddleware, (req, res) => {
    const { titre, categorie, description, dureEstime, prix } = req.body;
    const idFreelancer = req.user.idFreelancer; // Assure-toi que `idFreelancer` est bien récupéré

    console.log("Données reçues :", req.body);
    console.log("ID freelancer récupéré :", idFreelancer);

    // Validation des champs
    if (!titre  || !description || !dureEstime || !prix) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

    if (isNaN(dureEstime) || isNaN(prix)) {
        return res.status(400).json({ message: "Duree estimée et prix doivent être des nombres" });
    }

    const query = `INSERT INTO service (Titre, categorie, description, dureEstime, prix, idFreelancer) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    bd.query(query, [titre, categorie, description, dureEstime, prix, idFreelancer], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout du service :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        res.status(201).json({ 
            message: "✅ Service ajouté avec succès !",
            serviceId: result.insertId
        });
    });
});

// Récupérer les services du freelancer connecté
router.get("/mes-services", authMiddleware, (req, res) => {
    const idFreelancer = req.user.idFreelancer; // Assurez-vous que le middleware fournit cette info
    
    if (!idFreelancer) {
        return res.status(400).json({ error: "ID freelancer manquant" });
    }

    const sql = `
        SELECT 
            s.idService as id,
            s.Titre as titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            u.prenom as freelancerPrenom,
            u.idUtilisateur as freelancerId
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.idFreelancer = ?
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, [idFreelancer], (err, results) => {
        if (err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});

// Route pour modifier un service
router.put("/messervices/modifier/:id", (req, res) => {
    const { id } = req.params;
    const { titre, categorie, description, prix, dureEstime } = req.body;

    if (!titre || !categorie || !description || !prix || !dureEstime) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Mettre à jour le service dans la base de données
    const query = `
        UPDATE service 
        SET Titre = ?, categorie = ?, description = ?, prix = ?, dureEstime = ?
        WHERE idService = ?
    `;
    const values = [titre, categorie, description, prix, dureEstime, id];

    bd.query(query, values)
        .then(result => {
            if (result.affectedRows > 0) {
                res.json({ message: "Service modifié avec succès." });
            } else {
                res.status(404).json({ message: "Service non trouvé." });
            }
        })
        .catch(error => {
            console.error("Erreur lors de la modification du service:", error);
            res.status(500).json({ message: "Une erreur est survenue lors de la modification du service." });
        });
});


module.exports = router;