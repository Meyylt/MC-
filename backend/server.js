require("dotenv").config(); // Charger les variables d'environnement

const express = require("express");
const cors = require("cors"); // 🆕 Import du package CORS

const app = express();

const jwt = require("jsonwebtoken");

const path = require("path");

const SECRET_KEY = process.env.SECRET_KEY;

console.log(process.env.SECRET_KEY);

// 🛠️ Middleware
app.use(express.json()); // Permet de lire les données JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires HTML
app.use(cors()); // ✅ Active CORS pour éviter les erreurs de blocage
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🛠️ Importation des routes
const clientRoutes = require("./routes/clientRoutes");
app.use("/clients", clientRoutes);
const missionRoutes = require("./routes/missionRoutes");
app.use("/missions", missionRoutes);
const freelancerRoutes = require("./routes/freelanceurRoutes");
app.use("/freelancers", freelancerRoutes);
const serviceRoutes = require("./routes/serviceRoutes");
app.use("/services", serviceRoutes);
const modifierProRoutes = require("./routes/modifierProRoutes");
app.use("/profil", modifierProRoutes);
const transactionRoutes = require("./routes/transactionRoutes");
app.use("/transactions", transactionRoutes);
const messerviceRoutes = require("./routes/messervice");
app.use("/messervices", messerviceRoutes);
const candidateureRoutes = require("./routes/candidateureRoutes");
app.use("/candidateures", candidateureRoutes);
const demandesRoutes = require("./routes/demandesRoutes");
app.use("/demandes", demandesRoutes);
const notesRoutes = require("./routes/notesRoutes");
app.use("notes",notesRoutes);

// 🌍 Route d'accueil
app.get("/", (req, res) => {
  res.send("Hello, Node.js Backend!");
});

// 🚀 Démarrer le serveur
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
