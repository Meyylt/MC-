const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");
router.get("/com/:id",authMiddleware, (req, res) => {
    const serviceId = req.params.id;
    
    const sql = `
       SELECT n.idNote, n.note, n.commentaire as com, n.datesoume as date,
       u.Nomutilisateure as usec ,
       u.image as imageclient
FROM Note n
JOIN client c ON n.idClient = c.idClient
JOIN utilisateur u ON c.idUtilisateur = u.idUtilisateur
JOIN service s ON s.idFreelancer = n.idFreelancer
WHERE s.idService = ?
    `;
    
    bd.query(sql, [serviceId], (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        if(results.length === 0) {
            return res.status(404).json({ error: "Service non trouvé" });
        }
        
        res.status(200).json(results);
    });
});

router.get("/commmmm/:id",authMiddleware, (req, res) => {
    const serviceId = req.params.id;
    const idClient = req.user.idClient;
    
    const sql = `
       SELECT n.idNote, n.note, n.commentaire as com, n.datesoume as date,
       u.Nomutilisateure as usec ,
       u.image as imageclient
FROM Note n
JOIN client c ON n.idClient = c.idClient
JOIN utilisateur u ON c.idUtilisateur = u.idUtilisateur
JOIN service s ON s.idFreelancer = n.idFreelancer
WHERE n.idClient = ? AND s.idService = ?
    `;
    
    bd.query(sql, [idClient,serviceId], (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        if(results.length === 0) {
            return res.status(404).json({ error: "Service non trouvé" });
        }
        
        res.status(200).json(results);
    });
});


module.exports = router;