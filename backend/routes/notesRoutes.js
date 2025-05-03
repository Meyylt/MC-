const express = require("express");
const router = express.Router();
const db = require("../bd");
const authMiddleware = require("../middleware/auth");

// Route pour ajouter un nouvel avis sur un freelancer (autorise plusieurs avis)
router.post('/add', authMiddleware, (req, res) => {
    const { note, commentaire, idFreelancer } = req.body;
    const idClient = req.user.idClient;
    console.log(`Avis ajouté pour le freelancer ${idFreelancer} : Note = ${note}, Commentaire = ${commentaire}`);

    // Validation des données
    if (!note || !commentaire || !idFreelancer) {
        return res.status(400).json({ 
            success: false, 
            message: 'Les champs note, commentaire et idFreelancer sont requis' 
        });
    }

    if (note < 0 || note > 5) {
        return res.status(400).json({ 
            success: false, 
            message: 'La note doit être comprise entre 0 et 5' 
        });
    }

    
    // Insertion directe du nouvel avis (sans vérification d'existence)
    db.query(
        `INSERT INTO note 
        (note, commentaire, datesoume, idClient, idFreelancer) 
        VALUES (?, ?, NOW(), ?, ?)`,
        [note, commentaire, idClient, idFreelancer],
        (err, result) => {
            if (err) {
                console.error('Erreur insertion:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Erreur lors de la création de l'avis" 
                });
            }

            // Succès - création de la note
            return res.status(201).json({ 
                success: true,
                message: "Avis enregistré avec succès",
                idNote: result.insertId
            });
        }
    );
});



module.exports = router;