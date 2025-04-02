// Dans votre fichier de routes (service.js ou similaire)
const express = require("express");
const router = express.Router();
const bd = require("../bd");

const authMiddleware = require("../middleware/auth");

// Récupérer tous les services
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            u.prenom as freelancerPrenom
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});
// Récupérer un service spécifique par ID
router.get("/:id", (req, res) => {
    const serviceId = req.params.id;
    
    const sql = `
        SELECT 
            s.idService as id ,
            s.titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            u.prenom as freelancerPrenom
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.idService = ?
    `;
    
    bd.query(sql, [serviceId], (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        if(results.length === 0) {
            return res.status(404).json({ error: "Service non trouvé" });
        }
        
        res.status(200).json(results[0]);
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

module.exports = router;