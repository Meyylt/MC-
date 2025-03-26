const jwt = require("jsonwebtoken");
const SECRET_KEY = "votre_secret"; // 🔐 Mets ta clé secrète ici ou utilise process.env.SECRET_KEY

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "⚠️ Accès non autorisé !" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Ajoute l'utilisateur décodé dans la requête
        next();
    } catch (error) {
        return res.status(401).json({ message: "⚠️ Token invalide !" });
    }
};

module.exports = authMiddleware;
