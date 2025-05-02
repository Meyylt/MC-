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
router.get("/en-attente", authMiddleware, (req, res) => {
    const idClient = req.user.idClient;
    
    const sql = `
        SELECT 
            m.idMission as id,
            m.titre,
            m.description,
            m.dureEstime,
            m.budget
        FROM mission m
        WHERE m.idClient = ? AND m.statut = 'En attente'
        ORDER BY m.idMission DESC
    `;
    
    bd.query(sql, [idClient], (err, results) => {
        if (err) {
            console.error("❌ Erreur MySQL: ", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});
router.get("/musique", (req, res) => {
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
        WHERE m.statut = 'En attente' and m.categorie='Musique & Audio'
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
router.get("/devlo", (req, res) => {
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
        WHERE m.statut = 'En attente' and m.categorie='Développement Web'
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
router.get("/graph", (req, res) => {
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
        WHERE m.statut = 'En attente' and m.categorie='Graphisme & Design'
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
router.get("/redac", (req, res) => {
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
        WHERE m.statut = 'En attente' and m.categorie='Rédaction & Traduction'
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
router.get("/vedio", (req, res) => {
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
        WHERE m.statut = 'En attente' and m.categorie='Vidéo & animation'
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


// Récupérer les missions d'un freelancer (avec filtres de statut)
router.get("/freelancer/missions", authMiddleware, async (req, res) => {
    const idFreelancer = req.user.idFreelancer;
    
    try {
        const sql = `
            SELECT 
                m.idMission,
                m.titre,
                m.description,
                m.dureEstime,
                m.budget,
                m.statut,
                u.nom AS clientNom,
                u.prenom AS clientPrenom,
                u.Nomutilisateure AS clientUsername,
                u.image AS clientImage
            FROM mission m
            JOIN candidateure c ON m.idMission = c.idMission
            JOIN client cl ON m.idClient = cl.idClient
            JOIN utilisateur u ON cl.idUtilisateur = u.idUtilisateur
            WHERE c.idFreelancer = ?
            ORDER BY 
                CASE m.statut
                    WHEN 'En cours' THEN 1
                    WHEN 'Terminé' THEN 2
                    WHEN 'En confirmation' THEN 3
                    ELSE 4
                END,
                m.idMission DESC
        `;
        
        const missions = await new Promise((resolve, reject) => {
            bd.query(sql, [idFreelancer], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        res.status(200).json(missions);
        
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ 
            message: "Erreur serveur lors de la récupération des missions",
            error: error.message 
        });
    }
});

// Marquer une mission comme terminée
// Récupérer les missions d'un freelancer (avec filtres de statut)
router.get("/freelancer/missions", authMiddleware, (req, res) => {
    const idFreelancer = req.user.idFreelancer;
    
    const sql = `
        SELECT 
            m.idMission,
            m.titre,
            m.description,
            m.dureEstime,
            m.budget,
            m.statut,
            u.nom AS clientNom,
            u.prenom AS clientPrenom,
            u.Nomutilisateure AS clientUsername,
            u.image AS clientImage
        FROM mission m
        JOIN candidateure c ON m.idMission = c.idMission
        JOIN client cl ON m.idClient = cl.idClient
        JOIN utilisateur u ON cl.idUtilisateur = u.idUtilisateur
        WHERE c.idFreelancer = ?
        ORDER BY 
            CASE m.statut
                WHEN 'En cours' THEN 1
                WHEN 'Terminé' THEN 2
                WHEN 'En confirmation' THEN 3
                ELSE 4
            END,
            m.idMission DESC
    `;
    
    bd.query(sql, [idFreelancer], (err, missions) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ 
                message: "Erreur serveur lors de la récupération des missions",
                error: err.message 
            });
        }
        
        res.status(200).json(missions);
    });
});

// Marquer une mission comme terminée
router.post("/freelancer/missions/:id/complete", authMiddleware, (req, res) => {
    const missionId = req.params.id;
    const idFreelancer = req.user.idFreelancer;

    // Vérifier que le freelancer est bien assigné à cette mission
    const checkSql = `
        SELECT 1 FROM candidateure 
        WHERE idMission = ? AND idFreelancer = ? AND statut = 'accepter'
    `;
    
    bd.query(checkSql, [missionId, idFreelancer], (err, checkResult) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ 
                message: "Erreur serveur",
                error: err.message 
            });
        }

        if (checkResult.length === 0) {
            return res.status(403).json({ 
                message: "Non autorisé ou mission non trouvée" 
            });
        }

        // Mettre à jour le statut
        const updateSql = `
            UPDATE mission SET statut = 'En confirmation' 
            WHERE idMission = ?
        `;
        
        bd.query(updateSql, [missionId], (err, results) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ 
                    message: "Erreur serveur",
                    error: err.message 
                });
            }

            res.status(200).json({ 
                message: "Mission marquée comme terminée avec succès" 
            });
        });
    });
});
// Confirmer une mission terminée
router.put("/:id/confirm", authMiddleware, (req, res) => {
    const missionId = req.params.id;
    const idClient = req.user.idClient;

    // Vérifier que la mission appartient bien au client et est en statut "En confirmation"
    const checkQuery = `
        SELECT idClient, statut 
        FROM mission 
        WHERE idMission = ? 
        FOR UPDATE`;

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

        if (mission.statut !== 'En confirmation') {
            return res.status(400).json({
                success: false,
                message: "La mission doit être en statut 'En confirmation' pour être confirmée"
            });
        }

        // Mise à jour du statut
        const updateQuery = `
            UPDATE mission 
            SET statut = 'Terminé'
            WHERE idMission = ? AND idClient = ?`;

        bd.query(updateQuery, [missionId, idClient], (err, result) => {
            if (err) {
                console.error("Erreur mise à jour:", err);
                return res.status(500).json({
                    success: false,
                    message: "Échec de la confirmation",
                    sqlError: err.sqlMessage
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Aucune modification effectuée"
                });
            }

            res.status(200).json({
                success: true,
                message: "Mission confirmée et terminée avec succès"
            });
        });
    });
});

module.exports = router;
