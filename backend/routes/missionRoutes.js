const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth"); // Import du middleware

// Ajouter une mission (protégée)
router.post("/add", authMiddleware, (req, res) => {
    const { titre, description, dureEstime, budget, statut } = req.body;
    const idClient = req.user.id; // Récupérer l'ID du client connecté depuis le token

    if (!titre || !description || !dureEstime || !budget) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

    const query = "INSERT INTO Mission (titre, description, dureEstime, budget, statut, idClient) VALUES (?, ?, ?, ?, ?, ?)";

    bd.query(query, [titre, description, dureEstime, budget, statut, idClient], (err) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout de la mission :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        res.status(201).json({ message: "✅ Mission ajoutée avec succès !" });
    });
});

module.exports = router;
