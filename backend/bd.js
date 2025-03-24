const mysql =require("mysql2");

const bd = mysql.createConnection({
    host: "localhost",
    user: " melissa",
    password:"m.HN010423@",
    database:""
});

bd.connect(err => {
    if(err){
        console.error("erreur de connexion a MySQL: ",err);
        return;
    }
    console.log("Connecté a la base de données MySQL");
});
module.exports = bd;
