const express = require("express");
const router = express.Router();
const bd = require("../bd");

// Ajouter un utilisateur en tant que client
router.post("/add", (req, res) => {
    console.log("Tentative d'inscription dans la base :", process.env.DB_NAME);
    
    const { nomutilisateure, nom, prenom, daten, tel, adresse_mail, mot_de_passe } = req.body;

    if (!nomutilisateure || !nom || !prenom || !daten || !tel || !adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Insertion de l'utilisateur dans la table Utilisateur
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
        const queryClient = "INSERT INTO Client (idUtilisateur) VALUES (?)";

        bd.query(queryClient, [idUtilisateur], (err) => {
            if (err) {
                console.error("❌ Erreur lors de l'ajout du client :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            res.status(201).json({ message: "✅ Client ajouté avec succès !" });
        });
    });
});

const jwt = require("jsonwebtoken"); // Importer JWT
const SECRET_KEY = "votre_secret"; // ⚠️ Stocker dans un fichier .env

router.post("/login", (req, res) => {
    const { adresse_mail, mot_de_passe } = req.body;

    if (!adresse_mail || !mot_de_passe) {
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }

     // Requête pour récupérer idClient en plus des infos utilisateur
     const query = `
     SELECT Utilisateur.*, Client.idClient 
     FROM Utilisateur 
     LEFT JOIN Client ON Utilisateur.idUtilisateur = Client.idUtilisateur 
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

        // Vérification du mot de passe en clair (⚠️ moins sécurisé)
        if (mot_de_passe !== utilisateur.mot_de_passe) {
            return res.status(401).json({ message: "❌ Adresse e-mail ou mot de passe incorrect" });
        }

        // Génération du token JWT
        const token = jwt.sign({ idClient: utilisateur.idClient }, SECRET_KEY);
        

        res.status(200).json({ message: "✅ Connexion réussie", token, utilisateur });
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

router.get("/mon-profil",upload.single("image"), (req, res) => {
    // Vérification basique du token (à remplacer par votre authMiddleware si disponible)
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "❌ Token manquant" });
    }

    try {
        // Vérification du token
        const decoded = jwt.verify(token, SECRET_KEY);
        const idClient = decoded.idClient;

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
            JOIN Client C ON U.idUtilisateur = C.idUtilisateur
            WHERE C.idClient = ?
        `;

        bd.query(query, [idClient], (err, results) => {
            if (err) {
                console.error("❌ Erreur serveur :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "❌ Client non trouvé" });
            }

            const client = results[0];
            // Formatage des données
            const response = {
                nomComplet: `${client.prenom} ${client.nom}`,
                dateNaissance: client.dateNaissance,
                email: client.email,
                nomUtilisateur: client.nomUtilisateur,
                telephone: client.tel,
                image:client.image
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
    const image = req.file ? req.file.filename : req.body.existingImage;
    
    if (!token) {
        return res.status(401).json({ message: "❌ Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const idClient = decoded.idClient;

        const { nomutilisateure, nom, prenom, daten, email } = req.body;

        // Requête de mise à jour
        const query = `
            UPDATE Utilisateur U
            JOIN Client C ON U.idUtilisateur = C.idUtilisateur
            SET 
                U.nomutilisateure = ?,
                U.nom = ?,
                U.prenom = ?,
                U.daten = ?,
                U.adresse_mail = ?,
                U.image = ?
            WHERE C.idClient = ?
        `;

        bd.query(query, [nomutilisateure, nom, prenom, daten, email,image, idClient], (err, result) => {
            if (err) {
                console.error("❌ Erreur lors de la modification :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "❌ Client non trouvé" });
            }

            res.status(200).json({ message: "✅ Profil modifié avec succès" });
        });

    } catch (error) {
        console.error("❌ Erreur token :", error);
        res.status(401).json({ message: "❌ Token invalide" });
    }
});

module.exports = router;
