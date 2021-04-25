const Users = require('../models/userModel');

const authAdmin = async (req, res, next) => {

    try {
        //récupérer les infos user par son id
        const user = await Users.findOne({
            _id: req.user.id
        });

        if(user.role === 0)
        return res.status(400).json({msg: "Accès aux ressources d'administration refusé"})

        next();

    } catch(err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = authAdmin;