const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");

// Ajouter une transaction
router.post("/", authMiddleware, (req, res) => {
    const { montant, typePaiement, idService, idFreelancer } = req.body;
    
    // Récupération de l'ID client depuis le token JWT
    const idClient = req.user.idClient || req.user.id; // Selon comment votre authMiddleware est configuré
    
    if (!montant || !typePaiement || !idService || !idFreelancer) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const query = `
        INSERT INTO Transaction 
        (montant, typePaiement, dateTransaction, idClient, idFreelancer, idService) 
        VALUES (?, ?, CURDATE(), ?, ?, ?)`;
    
    bd.query(query, [montant, typePaiement, idClient, idFreelancer, idService], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout de la transaction :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        
        res.status(201).json({ 
            message: "✅ Transaction ajoutée avec succès",
            transactionId: result.insertId
        });
    });
});

module.exports = router;