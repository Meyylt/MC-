// Dans votre fichier de routes (service.js ou similaire)
const express = require("express");
const router = express.Router();
const bd = require("../bd");

const authMiddleware = require("../middleware/auth");



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

module.exports = router;