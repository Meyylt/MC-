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

// Route pour modifier un service (avec authentification)
router.put("/modifier/:id", authMiddleware, (req, res) => {
    const serviceId = req.params.id;
    const { titre, categorie, description, prix, dureEstime } = req.body;
    const idFreelancer = req.user.idFreelancer; // Récupéré du middleware

    if (!titre || !categorie || !description || !prix || !dureEstime) {
        return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires." });
    }
       // Validation améliorée
    const errors = [];
    if (!titre) errors.push("Le titre est requis");
    if (!categorie) errors.push("La catégorie est requise");
    if (!description) errors.push("La description est requise");
    if (!dureEstime || isNaN(dureEstime)) errors.push("La durée estimée doit être un nombre");
    if (!prix || isNaN(prix)) errors.push("Le prix doit être un nombre");

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Erreur de validation",
            errors
        });
    }





    // Vérifier d'abord que le service appartient bien au freelancer
    const checkQuery = "SELECT idFreelancer FROM service WHERE idService = ?";
    
    bd.query(checkQuery, [serviceId], (err, results) => {
        if (err) {
            console.error("Erreur vérification service:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur base de données",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "service introuvable"
            });
           
        }
        const service= results[0];
        if (service.idFreelancer !== idFreelancer) {
            return res.status(403).json({
                success: false,
                message: "Non autorisé: vous n'êtes pas le propriétaire"
            });
        }


        // Mettre à jour le service
        const updateQuery = `
            UPDATE service 
            SET Titre = ?, categorie = ?, description = ?, prix = ?, dureEstime = ?
            WHERE idService = ?
        `;
        const values = [
            titre,
            categorie,
            description,
            parseFloat(prix),
            parseInt(dureEstime),
            serviceId,
            idFreelancer
        ];

        bd.query(updateQuery, values,(err, result) => {
            if (err) {
                console.error("Erreur mise à jour:", err);
                return res.status(500).json({
                    success: false,
                    message: "Échec de la mise à jour",
                    sqlError: err.sqlMessage
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Aucune modification effectuée"
                });
            }
            const getUpdatedQuery = "SELECT * FROM service WHERE idService = ?";
            bd.query(getUpdatedQuery, [serviceId], (err, updatedResults) => {
                if (err || updatedResults.length === 0) {
                    console.error("Erreur récupération service:", err);
                    return res.status(200).json({
                        success: true,
                        message: "Mission mise à jour mais erreur de récupération",
                        serviceId
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Mission mise à jour avec succès",
                    mission: updatedResults[0]
                });
            });

            
        });
    });
});

module.exports = router;