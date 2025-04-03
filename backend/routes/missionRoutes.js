const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");

// Ajouter une mission (protégée)
router.post("/add", authMiddleware, (req, res) => {
    const { titre, categorie, description, dureEstime, budget } = req.body;
    const idClient = req.user.idClient; // Assure-toi que `idClient` est bien récupéré

    console.log("Données reçues :", req.body);
    console.log("ID client récupéré :", idClient);

    if (!titre || !categorie || !description || !dureEstime || !budget) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

    const query = `INSERT INTO mission (titre, categorie, description, dureEstime, budget, statut, idClient) 
                   VALUES (?, ?, ?, ?, ?, 'En attente', ?)`;

    bd.query(query, [titre, categorie, description, dureEstime, budget, idClient], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout de la mission :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        res.status(201).json({ 
            message: "✅ Mission ajoutée avec succès !",
            missionId: result.insertId
        });
    });
});

// Récupérer toutes les missions
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            m.idMission as id,
            m.titre,
            m.categorie,
            m.description,
            m.dureEstime,
            m.budget,
            m.statut,
            u.nom as clientNom,
            u.prenom as clientPrenom
        FROM mission m
        JOIN Client c ON m.idClient = c.idClient
        JOIN Utilisateur u ON c.idUtilisateur = u.idUtilisateur
        WHERE m.statut = 'En attente'
        ORDER BY m.idMission DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err){
            console.error("❌ Erreur MySQL: ", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});
// Récupérer les missions de l'utilisateur connecté
// Récupérer les missions du client connecté
router.get("/missions", authMiddleware, (req, res) => {
    const idClient = req.user.idClient; // Récupérer l'idClient de l'utilisateur connecté
    const sql = `
    SELECT 
        m.idMission as id,
        m.titre,
        m.categorie,
        m.description,
        m.dureEstime,
        m.budget,
        m.statut
    FROM mission m
    WHERE m.idClient = ?
    ORDER BY m.idMission DESC
`;
    
    
    bd.query(sql, [idClient], (err, results) => {
        if (err) {
            console.error("❌ Erreur MySQL: ", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);  // Réponse avec les missions du client connecté
    });
});

// Récupérer les détails d'une mission spécifique
router.get("/:id", (req, res) => {
    const missionId = req.params.id;
    
    const sql = `
        SELECT 
            m.idMission as id,
            m.titre,
            m.categorie,
            m.description,
            m.dureEstime,
            m.budget,
            m.statut,
            u.nom as clientNom,
            u.prenom as clientPrenom
        FROM mission m
        JOIN Client c ON m.idClient = c.idClient
        JOIN Utilisateur u ON c.idUtilisateur = u.idUtilisateur
        WHERE m.idMission = ?
    `;
    
    bd.query(sql, [missionId], (err, results) => {
        if (err) {
            console.error("❌ Erreur MySQL: ", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Mission non trouvée" });
        }
        
        res.status(200).json(results[0]);
    });
});



router.put("/:id", authMiddleware, (req, res) => {
    const missionId = req.params.id;
    const { titre, categorie, description, dureEstime, budget } = req.body;
    const idClient = req.user.idClient;

    console.log(`Tentative modification mission ID: ${missionId} par client ID: ${idClient}`);

    // Validation améliorée
    const errors = [];
    if (!titre) errors.push("Le titre est requis");
    if (!categorie) errors.push("La catégorie est requise");
    if (!description) errors.push("La description est requise");
    if (!dureEstime || isNaN(dureEstime)) errors.push("La durée estimée doit être un nombre");
    if (!budget || isNaN(budget)) errors.push("Le budget doit être un nombre");

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Erreur de validation",
            errors
        });
    }

    // Vérification propriétaire + existence mission
    const checkQuery = `
        SELECT idClient, statut 
        FROM mission 
        WHERE idMission = ? 
        FOR UPDATE`; // Verrouillage pour éviter les conflits

    bd.query(checkQuery, [missionId], (err, results) => {
        if (err) {
            console.error("Erreur vérification mission:", err);
            return res.status(500).json({
                success: false,
                message: "Erreur base de données",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mission introuvable"
            });
        }

        const mission = results[0];

        if (mission.idClient !== idClient) {
            return res.status(403).json({
                success: false,
                message: "Non autorisé: vous n'êtes pas le propriétaire"
            });
        }

        if (mission.statut === 'Terminé') {
            return res.status(400).json({
                success: false,
                message: "Impossible de modifier une mission terminée"
            });
        }

        // Mise à jour avec contrôle des types
        const updateQuery = `
            UPDATE mission 
            SET 
                titre = ?,
                categorie = ?,
                description = ?,
                dureEstime = ?,
                budget = ?
            WHERE idMission = ? AND idClient = ?`;

        const values = [
            titre,
            categorie,
            description,
            parseInt(dureEstime),
            parseFloat(budget),
            missionId,
            idClient
        ];

        bd.query(updateQuery, values, (err, result) => {
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

            // Récupération de la mission mise à jour
            const getUpdatedQuery = "SELECT * FROM mission WHERE idMission = ?";
            bd.query(getUpdatedQuery, [missionId], (err, updatedResults) => {
                if (err || updatedResults.length === 0) {
                    console.error("Erreur récupération mission:", err);
                    return res.status(200).json({
                        success: true,
                        message: "Mission mise à jour mais erreur de récupération",
                        missionId
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
