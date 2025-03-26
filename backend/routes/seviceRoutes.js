const express = require("express");
const router = express.Router();
const bd = require("../bd");
const authMiddleware = require("../middleware/auth");

//Ajouter une mission
router.post("/add", authMiddleware, (req,res)=> {
    const { titre, description, dureEstime, budget, statut } =req.body;
    const idFreelancer = req.user.id;
    
    if(!titre || !description || !dureEstme || !budget ){
        return res.status(400).json({ message: "⚠️ Tous les champs sont requis" });
    }
    const query = "INSERT INTO Service (titre, descirption, dureEstime, budget, statut, idFreelancer) VALUES(?,?,?,?)";

    bd.query(query, [titre, description, dureEstime,budget,idFreelancer],(err)=>{
        if(err) {
            console.error("❌ Erreur lors de l'ajout de la mission :", err);
            return res.status(500).json({ message: "Erreur serveur" });
                }
                res.status(201).json({ message: "✅ Service ajoutée avec succès !" });
            });
        });
        
        module.exports = router;
