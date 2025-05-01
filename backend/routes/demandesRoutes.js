// routes/demande.js
const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");

// Créer une mission et une demande associée
router.post("/demande", authMiddleware, (req, res) => {
    const { titre, description, idService } = req.body;
    const idClient = req.user.idClient;

    if (!titre || !description || !idService) {
        return res.status(400).json({ message: "Titre, description et ID service requis" });
    }

    // 1. Récupérer les infos du service (pour le freelancer, prix, durée)
    const getServiceQuery = `SELECT idFreelancer, prix, dureEstime, categorie 
                           FROM service WHERE idService = ?`;
    
    bd.query(getServiceQuery, [idService], (err, serviceResults) => {
        if (err) {
            console.error("Erreur récupération service:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        if (serviceResults.length === 0) {
            return res.status(404).json({ message: "Service non trouvé" });
        }

        const service = serviceResults[0];
        
        // 2. Créer la mission
        const createMissionQuery = `INSERT INTO mission 
                                  (titre, categorie, description, dureEstime, budget, statut, idClient, idFreelancer) 
                                  VALUES (?, ?, ?, ?, ?, 'En attente', ?, ?)`;
        
        const missionValues = [
            titre,
            service.categorie,
            description,
            service.dureEstime,
            service.prix,
            idClient,
            service.idFreelancer
        ];

        bd.query(createMissionQuery, missionValues, (err, missionResult) => {
            if (err) {
                console.error("Erreur création mission:", err);
                return res.status(500).json({ message: "Erreur création mission" });
            }

            const idMission = missionResult.insertId;
            
            // 3. Créer la demande associée
            const createDemandeQuery = `INSERT INTO demande 
                                      (statut, idClient, idFreelancer, idMission, idService) 
                                      VALUES ('En attente', ?, ?, ?, ?)`;
            
            bd.query(createDemandeQuery, 
                    [idClient, service.idFreelancer, idMission, idService], 
                    (err, demandeResult) => {
                if (err) {
                    console.error("Erreur création demande:", err);
                    return res.status(500).json({ message: "Erreur création demande" });
                }

                res.status(201).json({ 
                    message: "Mission et demande créées avec succès",
                    missionId: idMission,
                    demandeId: demandeResult.insertId
                });
            });
        });
    });
});
// Récupérer les demandes reçues (pour un freelancer)
router.get("/recues", authMiddleware, (req, res) => {
    const idFreelancer = req.user.idFreelancer;

    const query = `
        SELECT d.*, 
               m.titre AS mission_titre, 
               m.description AS mission_description,
               m.statut AS mission_statut,
               s.Titre AS service_titre,
               c.idClient,
               u.Nom AS client_nom,
               u.prenom AS client_prenom,
               u.Nomutilisateure AS client_username
        FROM demande d
        JOIN mission m ON d.idMission = m.idMission
        JOIN service s ON d.idService = s.idService
        JOIN client c ON d.idClient = c.idClient
        JOIN utilisateur u ON c.idUtilisateur = u.idUtilisateur
        WHERE d.idFreelancer = ? AND d.statut = 'En attente'
    `;

    bd.query(query, [idFreelancer], (err, results) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(results);
    });
});

// Récupérer les détails d'une demande spécifique
router.get("/:id", authMiddleware, (req, res) => {
    const demandeId = req.params.id;
    const idFreelancer = req.user.idFreelancer;

    const query = `
        SELECT d.*, 
               m.titre AS mission_titre, 
               m.description AS mission_description,
               m.statut AS mission_statut,
               m.dureEstime AS mission_duree,
               m.budget AS mission_budget,
               s.Titre AS service_titre,
               s.description AS service_description,
               s.prix AS service_prix,
               s.dureEstime AS service_duree,
               c.idClient,
               u.Nom AS client_nom,
               u.prenom AS client_prenom,
               u.Nomutilisateure AS client_username,
               u.image AS client_image
        FROM demande d
        JOIN mission m ON d.idMission = m.idMission
        JOIN service s ON d.idService = s.idService
        JOIN client c ON d.idClient = c.idClient
        JOIN utilisateur u ON c.idUtilisateur = u.idUtilisateur
        WHERE d.idDemande = ? AND d.idFreelancer = ?
    `;

    bd.query(query, [demandeId, idFreelancer], (err, results) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Demande non trouvée" });
        }
        res.json(results[0]);
    });
});

// Accepter une demande
router.post("/:id/accepter", authMiddleware, (req, res) => {
    const demandeId = req.params.id;
    const idFreelancer = req.user.idFreelancer;

    const updateQuery = `
        UPDATE demande d
        JOIN mission m ON d.idMission = m.idMission
        SET d.statut = 'accepter', m.statut = 'En cours'
        WHERE d.idDemande = ? AND d.idFreelancer = ?
    `;

    bd.query(updateQuery, [demandeId, idFreelancer], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Demande non trouvée" });
        }
        res.json({ message: "Demande acceptée avec succès" });
    });
});

// Refuser une demande
router.post("/:id/refuser", authMiddleware, (req, res) => {
    const demandeId = req.params.id;
    const idFreelancer = req.user.idFreelancer;

    const updateQuery = `
        UPDATE demande 
        SET statut = 'refuser' 
        WHERE idDemande = ? AND idFreelancer = ?
    `;

    bd.query(updateQuery, [demandeId, idFreelancer], (err, result) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Demande non trouvée" });
        }
        res.json({ message: "Demande refusée avec succès" });
    });
});
// Récupérer les demandes envoyées (pour un client)
router.get("/envoyees", authMiddleware, (req, res) => {
    const idClient = req.user.idClient;

    const query = `
        SELECT d.*, 
               m.titre AS mission_titre, 
               m.description AS mission_description,
               m.statut AS mission_statut,
               m.dureEstime AS mission_duree,
               m.budget AS mission_budget,
               s.Titre AS service_titre,
               f.idFreelancer,
               u.Nom AS freelancer_nom,
               u.prenom AS freelancer_prenom,
               u.Nomutilisateure AS freelancer_username,
               u.image AS freelancer_image
        FROM demande d
        JOIN mission m ON d.idMission = m.idMission
        JOIN service s ON d.idService = s.idService
        JOIN freelancer f ON d.idFreelancer = f.idFreelancer
        JOIN utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE d.idClient = ?
    `;

    bd.query(query, [idClient], (err, results) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.json(results);
    });
});

// Supprimer une demande et sa mission associée
router.delete("/:id", authMiddleware, (req, res) => {
    const demandeId = req.params.id;
    const idClient = req.user.idClient;

    // 1. Récupérer l'idMission associé
    const getMissionIdQuery = `SELECT idMission FROM demande WHERE idDemande = ? AND idClient = ?`;
    
    bd.query(getMissionIdQuery, [demandeId, idClient], (err, results) => {
        if (err) {
            console.error("Erreur:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Demande non trouvée" });
        }

        const idMission = results[0].idMission;

        // 2. Supprimer la demande
        const deleteDemandeQuery = `DELETE FROM demande WHERE idDemande = ?`;
        
        bd.query(deleteDemandeQuery, [demandeId], (err) => {
            if (err) {
                console.error("Erreur:", err);
                return res.status(500).json({ message: "Erreur suppression demande" });
            }

            // 3. Supprimer la mission associée
            const deleteMissionQuery = `DELETE FROM mission WHERE idMission = ?`;
            
            bd.query(deleteMissionQuery, [idMission], (err) => {
                if (err) {
                    console.error("Erreur:", err);
                    return res.status(500).json({ message: "Erreur suppression mission" });
                }

                res.json({ message: "Demande et mission supprimées avec succès" });
            });
        });
    });
});



module.exports = router;