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
router.get('/candidats', authMiddleware, (req, res) => {
    const idClient = req.user.idClient; // depuis le token
    const sql = `
      SELECT c.idCandidateure AS idCandidat, 
             u.nom AS nomFreelancer,
             u.Nomutilisateure as nomu,
             u.image AS freelancerImage
      FROM candidateure c
      JOIN freelancer f ON c.idFreelancer = f.idFreelancer
      JOIN utilisateur u ON f.idUtilisateur = u.idUtilisateur
      WHERE c.idClient = ? and c.statut='En attente'
    `;
    bd.query(sql, [idClient], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur lors du chargement des candidatures' });
      res.json(results);
    });
  });
  
  router.get('/candidats/:id', authMiddleware, (req, res) => {
    const idCandidat = req.params.id;
    const sql = `
      SELECT m.titre AS mission_titre, 
             m.description AS mission_description, 
             m.budget AS mission_budjet,
             m.dureEstime AS mission_duree,
             u.nom AS free_nom, 
             u.Nomutilisateure as nomu,
             u.prenom AS free_prenom
      FROM candidateure c
      JOIN mission m ON c.idMission = m.idMission
      JOIN freelancer f ON c.idFreelancer = f.idFreelancer
      JOIN utilisateur u ON f.idUtilisateur = u.idUtilisateur
      WHERE c.idCandidateure = ?
    `;
    bd.query(sql, [idCandidat], (err, results) => {
      if (err || results.length === 0) return res.status(500).json({ error: 'Détails non trouvés' });
      res.json(results[0]);
    });
  });
  
  router.post('/candidats/:id/accepter', authMiddleware, (req, res) => {
    const idCandidat = req.params.id;
  
    const acceptSql = `UPDATE candidateure SET statut = 'accepter' WHERE idCandidateure = ?`;
    bd.query(acceptSql, [idCandidat], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de l’acceptation' });
  
      const findMissionSql = `SELECT idMission, idFreelancer FROM candidateure WHERE idCandidateure = ?`;
      bd.query(findMissionSql, [idCandidat], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: 'Mission introuvable' });
  
        const idMission = results[0].idMission;
        const idFreelancer = results[0].idFreelancer;
  
        const refuseOthersSql = `
          UPDATE candidateure SET statut = 'refuser' WHERE idMission = ? AND idCandidateure != ?
        `;
        bd.query(refuseOthersSql, [idMission, idCandidat], (err) => {
          if (err) return res.status(500).json({ error: 'Erreur lors du refus des autres candidatures' });
  
          const updateMissionSql = `
            UPDATE mission SET statut = 'En cours', idFreelancer = ? WHERE idMission = ?
          `;
          bd.query(updateMissionSql, [idFreelancer, idMission], (err) => {
            if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour de la mission' });
  
            res.json({ message: 'Candidature acceptée, mission en cours et freelancer assigné' });
          });
        });
      });
    });
  });
  
  router.post('/candidats/:id/refuser', authMiddleware, (req, res) => {
    const idCandidat = req.params.id;
    const sql = `UPDATE candidateure SET statut = 'refuser' WHERE idCandidateure = ?`;
  
    bd.query(sql, [idCandidat], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur lors du refus de la candidature' });
      res.json({ message: 'Candidature refusée avec succès' });
    });
  });
  
  router.get('/candidateures', authMiddleware, (req, res) => {
    const idFreelancer = req.user.idFreelancer; // depuis le token
    const sql = `
      SELECT c.idCandidateure AS idCandidat, 
             c.statut,
             u.nom AS nomclient,
             u.Nomutilisateure as nomu,
             u.image AS clientImage
      FROM candidateure c
      JOIN client cl ON c.idClient = cl.idClient
      JOIN utilisateur u ON cl.idUtilisateur = u.idUtilisateur
      WHERE c.idFreelancer = ?
    `;
    bd.query(sql, [idFreelancer], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur lors du chargement des candidatures' });
      res.json(results);
    });
  });
  // Supprimer une candidature (annulation)
router.delete('/candidateures/:id', authMiddleware, (req, res) => {
  const idCandidat = req.params.id;
  const idFreelancer = req.user.idFreelancer; // Vérification que c'est bien le freelancer qui annule

  // Vérifier d'abord que la candidature appartient bien au freelancer
  const checkSql = `SELECT * FROM candidateure WHERE idCandidateure = ? AND idFreelancer = ?`;
  
  bd.query(checkSql, [idCandidat, idFreelancer], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur de vérification' });
      
      if (results.length === 0) {
          return res.status(403).json({ error: 'Non autorisé ou candidature non trouvée' });
      }

      // Si la vérification est OK, procéder à la suppression
      const deleteSql = `DELETE FROM candidateure WHERE idCandidateure = ?`;
      
      bd.query(deleteSql, [idCandidat], (err) => {
          if (err) return res.status(500).json({ error: 'Erreur lors de la suppression' });
          
          res.json({ message: 'Candidature annulée avec succès' });
      });
  });
});
// Détails d'une candidature spécifique (vue par le freelancer)
router.get('/candidateures/details/:id', authMiddleware, async (req, res) => {
  const idCandidat = req.params.id;
  const idFreelancer = req.user.idFreelancer; // vérifie que c'est bien son propre compte

  try {
      const sql = `
          SELECT 
              c.idCandidateure,
              c.statut,
              u.nom AS client_nom,
              u.prenom AS client_prenom,
              u.Nomutilisateure AS client_username,
              u.image AS client_image,
              m.titre AS mission_titre,
              m.description AS mission_description,
              m.budget AS mission_budget,
              m.dureEstime AS mission_duree
          FROM candidateure c
          JOIN mission m ON c.idMission = m.idMission
          JOIN client cl ON c.idClient = cl.idClient
          JOIN utilisateur u ON cl.idUtilisateur = u.idUtilisateur
          WHERE c.idCandidateure = ? AND c.idFreelancer = ?
      `;

      const results = await new Promise((resolve, reject) => {
          bd.query(sql, [idCandidat, idFreelancer], (err, results) => {
              if (err) reject(err);
              else resolve(results);
          });
      });

      if (results.length === 0) {
          return res.status(404).json({ error: 'Candidature non trouvée ou accès non autorisé' });
      }

      res.json(results[0]);

  } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});



module.exports = router;