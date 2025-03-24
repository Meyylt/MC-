const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Hello, Node.js Backend!");
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

app.use(express.json()); // Permet de lire les données en JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les données des formulaires HTML
