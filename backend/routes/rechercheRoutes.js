const express = require("express");
const router = express.Router();
const mysql = require("mysql2");


const db= require("../bd");

router.get("/recherche", (req, res) => {
  const search = req.query.query;

  if (!search) {
    return res.status(400).json({ error: "Aucun mot-clé fourni" });
  }

  const sql = `
        SELECT * FROM mission
        WHERE titre LIKE ? OR categorie LIKE ? OR description LIKE ?
    `;

  const value = `%${search}%`;
  db.query(sql, [value, value, value], (err, results) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json(results);
  });
});

module.exports = router;
