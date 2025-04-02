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
                   VALUES (?, ?, ?, ?, ?, 'En cours', ?)`;

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
            m.statut,
            u.nom as clientNom,
            u.prenom as clientPrenom
        FROM mission m
        JOIN Client c ON m.idClient = c.idClient
        JOIN Utilisateur u ON c.idUtilisateur = u.idUtilisateur
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

// Ajoutez cette route à votre fichier de routes missions
router.post("/:id/apply", authMiddleware, async (req, res) => {
    const missionId = req.params.id;
    const freelancerId = req.user.idFreelancer; // Assurez-vous que le middleware fournit idFreelancer

    if (!freelancerId) {
        return res.status(403).json({ message: "Seuls les freelancers peuvent postuler" });
    }

    try {
        // 1. Vérifier si le freelancer a déjà postulé
        const checkSql = `SELECT * FROM candidateure WHERE idMission = ? AND idFreelancer = ?`;
        const [existing] = await bd.query(checkSql, [missionId, freelancerId]);

        if (existing.length > 0) {
            return res.status(400).json({ message: "Vous avez déjà postulé à cette mission" });
        }

        // 2. Récupérer l'idClient associé à la mission
        const missionSql = `SELECT idClient FROM mission WHERE idMission = ?`;
        const [mission] = await bd.query(missionSql, [missionId]);

        if (mission.length === 0) {
            return res.status(404).json({ message: "Mission non trouvée" });
        }

        const idClient = mission[0].idClient;

        // 3. Insérer la candidature
        const insertSql = `INSERT INTO candidateure (statut, idClient, idFreelancer, idMission) VALUES (?, ?, ?, ?)`;
        const [result] = await bd.query(insertSql, [
            'En attente',
            idClient,
            freelancerId,
            missionId
        ]);

        res.status(201).json({
            message: "Candidature envoyée avec succès",
            candidateureId: result.insertId
        });

    } catch (err) {
        console.error("Erreur MySQL:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});



module.exports = router;
