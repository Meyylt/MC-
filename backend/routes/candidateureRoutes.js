// routes/candidature.js
const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");

// Postuler à une mission
router.post("/postuler", authMiddleware, async (req, res) => {
    const { idMission } = req.body;
    const idFreelancer = req.user.idFreelancer; // Supposant que votre middleware auth fournit cela

    if (!idMission) {
        return res.status(400).json({ message: "L'ID de la mission est requis" });
    }

    try {
        // Vérifier si la mission existe et récupérer l'idClient
        const missionCheck = await new Promise((resolve, reject) => {
            bd.query(
                "SELECT m.idClient FROM mission m WHERE m.idMission = ?",
                [idMission],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        if (missionCheck.length === 0) {
            return res.status(404).json({ message: "Mission non trouvée" });
        }

        const idClient = missionCheck[0].idClient;

        // Vérifier si le freelancer a déjà postulé
        const existingApplication = await new Promise((resolve, reject) => {
            bd.query(
                "SELECT * FROM candidateure WHERE idMission = ? AND idFreelancer = ?",
                [idMission, idFreelancer],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        if (existingApplication.length > 0) {
            return res.status(400).json({ 
                message: "Vous avez déjà postulé à cette mission" 
            });
        }

        // Créer la candidature
        await new Promise((resolve, reject) => {
            bd.query(
                "INSERT INTO candidateure (statut, idClient, idFreelancer, idMission) VALUES (?, ?, ?, ?)",
                ["En attente", idClient, idFreelancer, idMission],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });

        res.status(201).json({ 
            message: "Votre candidature a été envoyée avec succès !" 
        });

    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ 
            message: "Erreur serveur lors de la postulation",
            error: error.message 
        });
    }
});

module.exports = router;