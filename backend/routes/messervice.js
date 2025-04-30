// Dans votre fichier de routes (service.js ou similaire)
const express = require("express");
const router = express.Router();
const bd = require("../bd");

const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// 📸 Config stockage image (copiée ici aussi, ou à centraliser si tu veux)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // dossier de destination
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ajouter un service (protégé)
router.post("/add", authMiddleware, upload.single("image"), (req, res) => {
    const { titre, categorie, description, dureEstime, prix } = req.body;
    const image = req.file ? req.file.filename : null;
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

    const query = `INSERT INTO service (Titre, categorie, description, dureEstime, prix, idFreelancer,image) 
                   VALUES (?, ?, ?, ?, ?, ?,?)`;

    bd.query(query, [titre, categorie, description, dureEstime, prix, idFreelancer,image], (err, result) => {
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
            s.image,
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

router.put("/modifier/:id", authMiddleware, upload.single("image"), (req, res) => {
    const idService = req.params.id;
    const { titre, categorie, description, dureEstime, prix } = req.body;
    const nouvelleImage = req.file ? req.file.filename : null;

    // Vérification de l'appartenance du service au freelancer connecté
    const idFreelancer = req.user.idFreelancer;

    // Récupérer d'abord l'image actuelle si aucune n'est fournie
    const getImageQuery = "SELECT image FROM service WHERE idService = ? AND idFreelancer = ?";
    bd.query(getImageQuery, [idService, idFreelancer], (err, rows) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'image :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "Service non trouvé ou non autorisé" });
        }

        const imageFinale = nouvelleImage || rows[0].image;

        const updateQuery = `
            UPDATE service 
            SET titre = ?, categorie = ?, description = ?, dureEstime = ?, prix = ?, image = ?
            WHERE idService = ? AND idFreelancer = ?
        `;
        bd.query(updateQuery, [titre, categorie, description, dureEstime, prix, imageFinale, idService, idFreelancer], (err, result) => {
            if (err) {
                console.error("Erreur lors de la mise à jour :", err);
                return res.status(500).json({ message: "Erreur lors de la mise à jour" });
            }

            res.json({ message: "✅ Service modifié avec succès !" });
        });
    });
});

router.delete("/supprimer/:id", authMiddleware, async (req, res) => {
    const idService = req.params.id;
    
  const sql = "DELETE FROM service WHERE idService = ?";
  bd.query(sql, [idService], (err, result) => {
    if (err) {
        console.error("Erreur lors de la suppression du service:", err);
        return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "service non trouvé" });
    }

    res.status(200).json({ message: "service supprimé avec succès" });
});

    
});

    

module.exports = router;