const express = require("express");
const router = express.Router();
const bd = require("../bd");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "votre_secret";

// Ajouter un freelancer
router.post("/add", (req, res) => {
    console.log(req.body);
    const { nomutilisateure, nom, prenom, daten, tel, adresse_mail, mot_de_passe } = req.body;

    if (!nomutilisateure || !nom || !prenom || !daten || !tel || !adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const queryUtilisateur = `
        INSERT INTO Utilisateur 
        (nomutilisateure, nom, prenom, daten, tel, adresse_mail, mot_de_passe) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    bd.query(queryUtilisateur, [nomutilisateure, nom, prenom, daten, tel, adresse_mail, mot_de_passe], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout de l'utilisateur :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        const idUtilisateur = result.insertId;
        const queryFreelancer = "INSERT INTO Freelancer (idUtilisateur) VALUES (?)";

        bd.query(queryFreelancer, [idUtilisateur], (err) => {
            if (err) {
                console.error("❌ Erreur lors de l'ajout du freelancer :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            res.status(201).json({ 
                message: "✅ Freelancer ajouté avec succès !"
            });
        });
    });
});
// Connexion freelancer
router.post("/login", (req, res) => {
    const { adresse_mail, mot_de_passe } = req.body;

    if (!adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

    const query = `
       SELECT Utilisateur.*, Freelancer.idFreelancer
       FROM Utilisateur
       LEFT JOIN Freelancer ON Utilisateur.idUtilisateur = Freelancer.idUtilisateur
       WHERE Utilisateur.adresse_mail = ?`;

    bd.query(query, [adresse_mail], (err, results) => {
        if (err) {
            console.error("❌ Erreur serveur :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "❌ Adresse e-mail ou mot de passe incorrect" });
        }

        const utilisateur = results[0];

        // Vérification supplémentaire pour s'assurer que c'est un freelancer
        if (!utilisateur.idFreelancer) {
            return res.status(403).json({ message: "❌ Ce compte n'est pas un compte freelancer" });
        }

        // Vérification du mot de passe (à remplacer par bcrypt en production)
        if (mot_de_passe !== utilisateur.mot_de_passe) {
            return res.status(401).json({ message: "❌ Adresse e-mail ou mot de passe incorrect" });
        }

        // Génération du token JWT avec plus d'informations
        const token = jwt.sign(
            { 
                id: utilisateur.idUtilisateur,
                idFreelancer: utilisateur.idFreelancer,
                role: 'freelancer',
                email: utilisateur.adresse_mail
            }, 
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Réponse complète
        res.status(200).json({ 
            message: "✅ Connexion freelancer réussie", 
            token,
            user: {
                id: utilisateur.idUtilisateur,
                idFreelancer: utilisateur.idFreelancer,
                nomutilisateure: utilisateur.nomutilisateure,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                daten: utilisateur.daten,
                tel: utilisateur.tel,
                email: utilisateur.adresse_mail,
                role: 'freelancer'
            }
        });
    });
});
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

router.get("/mon-profil", (req, res) => {
    // Vérification basique du token (à remplacer par votre authMiddleware si disponible)
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "❌ Token manquant" });
    }

    try {
        // Vérification du token
        const decoded = jwt.verify(token, SECRET_KEY);
        const idFreelancer = decoded.idFreelancer;

        // Requête pour récupérer les infos
        const query = `
            SELECT 
                U.nom, 
                U.prenom, 
                U.daten AS dateNaissance, 
                U.adresse_mail AS email, 
                U.nomutilisateure AS nomUtilisateur,
                U.tel,
                U.image
            FROM Utilisateur U
            JOIN Freelancer F ON U.idUtilisateur = F.idUtilisateur
            WHERE F.idFreelancer = ?
        `;

        bd.query(query, [idFreelancer], (err, results) => {
            if (err) {
                console.error("❌ Erreur serveur :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "❌ Client non trouvé" });
            }

            const freelancer = results[0];
            // Formatage des données
            const response = {
                nomComplet: `${freelancer.prenom} ${freelancer.nom}`,
                dateNaissance: freelancer.dateNaissance,
                email: freelancer.email,
                nomUtilisateur: freelancer.nomUtilisateur,
                telephone: freelancer.tel,
                image:freelancer.image
            };

            res.status(200).json(response);
        });

    } catch (error) {
        console.error("❌ Erreur token :", error);
        res.status(401).json({ message: "❌ Token invalide" });
    }
});

router.put("/modifier-profil",upload.single("image"), (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "❌ Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const idFreelancer = decoded.idFreelancer;
        
    const image = req.file ? req.file.filename : req.body.existingImage;

        const { nomutilisateure, nom, prenom, daten, email } = req.body;

        // Requête de mise à jour
        const query = `
            UPDATE Utilisateur U
            JOIN Freelancer F ON U.idUtilisateur = F.idUtilisateur
            SET 
                U.nomutilisateure = ?,
                U.nom = ?,
                U.prenom = ?,
                U.daten = ?,
                U.adresse_mail = ?,
                U.image = ?
            WHERE F.idFreelancer = ?
        `;

        bd.query(query, [nomutilisateure, nom, prenom, daten, email,image, idFreelancer], (err, result) => {
            if (err) {
                console.error("❌ Erreur lors de la modification :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "❌ Freelancer non trouvé" });
            }

            res.status(200).json({ message: "✅ Profil modifié avec succès" });
        });

    } catch (error) {
        console.error("❌ Erreur token :", error);
        res.status(401).json({ message: "❌ Token invalide" });
    }
});



module.exports = router;