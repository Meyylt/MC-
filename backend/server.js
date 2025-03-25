const express = require("express");
const cors = require("cors"); // 🆕 Import du package CORS

const app = express();

// 🛠️ Middleware
app.use(express.json()); // Permet de lire les données JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires HTML
app.use(cors()); // ✅ Active CORS pour éviter les erreurs de blocage

// 🛠️ Importation des routes
const clientRoutes = require("./routes/clientRoutes");
app.use("/clients", clientRoutes);

// 🌍 Route d'accueil
app.get("/", (req, res) => {
    res.send("Hello, Node.js Backend!");
});

// 🚀 Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
