// routes/demande.js
const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");

// Créer une nouvelle demande
router.post("/add", authMiddleware, (req, res) => {
    const { idMission, idService } = req.body;
    const idClient = req.user.idClient;

    console.log("Données reçues :", req.body);
    console.log("ID client récupéré :", idClient);

    if (!idMission || !idService) {
        return res.status(400).json({ message: "⚠️ ID de mission et de service requis" });
    }

    // D'abord, on récupère l'idFreelancer du service
    const getFreelancerQuery = `SELECT idFreelancer FROM service WHERE idService = ?`;
    
    bd.query(getFreelancerQuery, [idService], (err, serviceResults) => {
        if (err) {
            console.error("❌ Erreur lors de la récupération du freelancer :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        if (serviceResults.length === 0) {
            return res.status(404).json({ message: "Service non trouvé" });
        }

        const idFreelancer = serviceResults[0].idFreelancer;

        // Ensuite, on crée la demande
        const createDemandeQuery = `INSERT INTO demande 
                                  (statut, idClient, idFreelancer, idMission, idService) 
                                  VALUES ('En attente', ?, ?, ?, ?)`;

        bd.query(createDemandeQuery, 
                [idClient, idFreelancer, idMission, idService], 
                (err, result) => {
            if (err) {
                console.error("❌ Erreur lors de la création de la demande :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            res.status(201).json({ 
                message: "✅ Demande créée avec succès !",
                demandeId: result.insertId
            });
        });
    });
});

module.exports = router;