require("dotenv").config();
const mysql =require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
//connexion a mySQL
bd.connect(err => {
    if(err){
        console.error("erreur de connexion a MySQL: ",err);
        return;
    }
    console.log("Connecté a la base de données MySQL");
});
module.exports = bd;
