require("dotenv").config(); // Charger les variables d'environnement

const express = require("express");
const cors = require("cors"); // 🆕 Import du package CORS

const app = express();



const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY; 

console.log(process.env.SECRET_KEY);

// 🛠️ Middleware
app.use(express.json()); // Permet de lire les données JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires HTML
app.use(cors()); // ✅ Active CORS pour éviter les erreurs de blocage


// 🛠️ Importation des routes
const clientRoutes = require("./routes/clientRoutes");
app.use("/clients", clientRoutes);
const missionRoutes = require("./routes/missionRoutes");
app.use("/missions", missionRoutes);
const freelancerRoutes = require("./routes/freelanceurRoutes");
app.use("/freelancers", freelancerRoutes);

// 🌍 Route d'accueil
app.get("/", (req, res) => {
    res.send("Hello, Node.js Backend!");
});

// 🚀 Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
