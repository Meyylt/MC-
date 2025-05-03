// Dans votre fichier de routes (service.js ou similaire)
const express = require("express");
const router = express.Router();
const bd = require("../bd");

const authMiddleware = require("../middleware/auth");

// Récupérer tous les services
router.get("/", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            
        COALESCE(ROUND(AVG(N.note), 1), 0.0) AS note,  -- Alias direct en 'note' (commentaire SQL valide)
        COUNT(N.idNote) AS avis, 
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        LEFT JOIN note N ON F.idFreelancer = N.idFreelancer
        
    GROUP BY s.idService
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});
router.get("/musique", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.categorie = 'Musique & Audio'
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});
router.get("/video", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.categorie = 'Vidéo & animation'
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});

router.get("/redaction", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.categorie = 'Rédaction & Traduction'
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});

router.get("/developpement", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.categorie = 'Développement Web'
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});

router.get("/graphisme", (req, res) => {
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        WHERE s.categorie = 'Graphisme & Design'
        ORDER BY s.idService DESC
    `;
    
    bd.query(sql, (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.status(200).json(results);
    });
});

// Récupérer un service spécifique par ID
router.get("/:id", (req, res) => {
    const serviceId = req.params.id;
    
    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.description,
            s.categorie,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure ,
            u.image as imagefree,
            COALESCE(ROUND(AVG(N.note), 1), 0.0) AS note,  -- Alias direct en 'note' (commentaire SQL valide)
        COUNT(N.idNote) AS avis, 
            f.idFreelancer
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        
        LEFT JOIN note N ON F.idFreelancer = N.idFreelancer
        WHERE s.idService = ?
        GROUP BY s.idService
    `;
    
    bd.query(sql, [serviceId], (err, results) => {
        if(err) {
            console.error("Erreur MySQL:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        
        if(results.length === 0) {
            return res.status(404).json({ error: "Service non trouvé" });
        }
        
        res.status(200).json(results[0]);
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
// Express route dans services.js
router.get("/freelancer/:id", authMiddleware, (req, res) => {
    const freelancerId = req.params.id;
    const sql = `
    SELECT 
        s.idService as id,
        s.Titre,
        s.categorie,
        s.description,
        s.prix,
        s.dureEstime,
        u.nom as freelancerNom,
        s.image,
        u.nomutilisateure ,
            COALESCE(ROUND(AVG(N.note), 1), 0.0) AS note,  -- Alias direct en 'note' (commentaire SQL valide)
        COUNT(N.idNote) AS avis, 
        u.image as imagefree
    FROM service s
    JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
    JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
    LEFT JOIN note N ON F.idFreelancer = N.idFreelancer
    WHERE s.idFreelancer = ?
    
        GROUP BY s.idService
    ORDER BY s.idService DESC
`;

    bd.query(sql, [freelancerId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des services :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        res.json(results);
    });
});

router.get("/categorie/:categorie", authMiddleware, (req, res) => {
    const { categorie } = req.params;

    const sql = `
        SELECT 
            s.idService as id,
            s.Titre,
            s.categorie,
            s.description,
            s.prix,
            s.dureEstime,
            u.nom as freelancerNom,
            s.image,
            u.nomutilisateure,
            
            COALESCE(ROUND(AVG(N.note), 1), 0.0) AS note,  -- Alias direct en 'note' (commentaire SQL valide)
        COUNT(N.idNote) AS avis, 
            u.image as imagefree
        FROM service s
        JOIN Freelancer f ON s.idFreelancer = f.idFreelancer
        JOIN Utilisateur u ON f.idUtilisateur = u.idUtilisateur
        
    LEFT JOIN note N ON F.idFreelancer = N.idFreelancer
        WHERE s.categorie = ?
        GROUP BY s.idService
        ORDER BY s.idService DESC
    `;

    bd.query(sql, [categorie], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur", error: err });
        }

        res.json(results);
    });
});




module.exports = router;