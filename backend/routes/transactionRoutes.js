const express = require("express");
const router = express.Router();
const db = require("../bd");
const authMiddleware = require("../middleware/auth");

// Route pour traiter le paiement
router.post('/paiement',authMiddleware, (req, res) => {
    const { montant, typePaiement,  idFreelancer, idMission, ccp, cle, numcb, dateexperation, vvs, nomcarte } = req.body;
    const idClient = req.user.idClient;
    if (!montant || !typePaiement || !idClient || !idFreelancer || !idMission || !nomcarte) {
        return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    db.query(
        `INSERT INTO transaction (montant, typePaiement, dateTransaction, idClient, idFreelancer) VALUES (?, ?, NOW(), ?, ?)`,
        [montant, typePaiement, idClient, idFreelancer],
        (err, result) => {
            if (err) {
                console.error('Erreur transaction :', err);
                return res.status(500).json({ success: false, message: "Erreur lors de l'insertion de la transaction" });
            }

            const idTransaction = result.insertId;

            const insertDetails = () => {
                if (typePaiement === 'CCP') {
                    db.query(
                        `INSERT INTO poste (ccp, cle, idTransaction, nom) VALUES (?, ?, ?, ?)`,
                        [ccp, cle, idTransaction, nomcarte],
                        (err) => {
                            if (err) {
                                console.error('Erreur insertion CCP :', err);
                                return res.status(500).json({ success: false, message: "Erreur lors de l'insertion dans Poste" });
                            }
                            updateMission();
                        }
                    );
                } else if (typePaiement === 'CB') {
                    db.query(
                        `INSERT INTO cb (numcb, dateexperation, vvs, nomcb, idTransaction) VALUES (?, ?, ?, ?, ?)`,
                        [numcb, dateexperation, vvs, nomcarte, idTransaction],
                        (err) => {
                            if (err) {
                                console.error('Erreur insertion CB :', err);
                                return res.status(500).json({ success: false, message: "Erreur lors de l'insertion dans CB" });
                            }
                            updateMission();
                        }
                    );
                } else {
                    return res.status(400).json({ success: false, message: "Type de paiement invalide" });
                }
            };

            const updateMission = () => {
                db.query(
                    `UPDATE mission SET statut = 'En cours' WHERE idMission = ?`,
                    [idMission],
                    (err) => {
                        if (err) {
                            console.error('Erreur update mission :', err);
                            return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la mission" });
                        }

                        return res.status(200).json({ success: true, message: "Paiement confirmé et mission mise à jour" });
                    }
                );
            };

            insertDetails();
        }
    );
});


module.exports = router;