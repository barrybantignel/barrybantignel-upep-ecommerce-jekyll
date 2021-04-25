const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Payments = require('../models/paymentModel');

const userCtrl = {

    register: async (req, res) => {
        //res.json({msg: "Test Controllers"})
 //   }
//}

        try{
              const {name, email, password} = req.body;

              const user = await Users.findOne({email})

              if(user) return res.status(400).json({msg: "Le mail existe déjà"})

              if(password.length < 6)

              return res.status(400).json({msg: "La longueur du mot de passe doit avoir au moins 6 caractères"})            
              //res.json({msg: "Enregistré avec succès"})
              
               // Le chiffrement du mot de passe              
             const passwordHash = await bcrypt.hash(password, 10)
             //res.json({password, passwordHash})
            // res.json({passwordHash})

             //Nouvel utilisateur
             const newUser = new Users({
                name, email, password: passwordHash                
            })
            //res.json(newUser);

            // saugarde dans mongoDB
            await newUser.save();
            //res.json({msg: "Enregistré avec succès!"})

             //Créer jsonwebtoken pour s'authentifier
             const accesstoken = createAccessToken({id: newUser._id})
             //res.json({accesstoken})

             // Refresh token                         
             const refreshtoken = createRefreshToken({id: newUser._id})
            
             res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7d
             })
             res.json({accesstoken})             

            } catch(err) {
            return res.status(500).json({msg: err.message})
        }
   },
   
   login: async (req, res) => {
       try {
        const {email, password} = req.body;

        const user = await Users.findOne({email})

        if(!user) return res.status(400).json({msg: "utilisateur n'existe pas."})

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch)  return res.status(400).json({msg: "Mot de passe incorrect."})

        // Si accès à la connexion, créer un jeton d'accès et actualiser le jeton
        const accesstoken = createAccessToken({id: user._id})

        const refreshtoken = createRefreshToken({id: user._id})
          
        res.cookie('refreshtoken', refreshtoken, {
             httpOnly: true,
             path: '/user/refresh_token',
             maxAge: 7*24*60*60*1000 // 7d
          });
          res.json({accesstoken})

        //res.json({msg: "Connexion réussie"})
       } catch(err) {
           return res.status(500).json({msg:err.message})
       }
   },

   
   logout: async(req, res) => {

    try {
        res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
        return res.json({msg: "déconnecté"})

    } catch(err) {
        return res.status(500).json({msg: err.message})
    }
},

   refreshToken: (req, res) => {  
    try {

        const rf_token = req.cookies.refreshtoken;
        

        if(!rf_token) return res.status(400).json({msg: "Vous êtes invités à vous connecter ou vous enregistrer, merci"})

        jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            
            if(err) return res.status(400).json({msg: "Please Coonectez vous ou enregistrez vous"})
            
            const accesstoken = createAccessToken({id: user.id})

            //res.json({user, accesstoken})
            res.json({accesstoken})
        })
        
        //res.json({rf_token})

       } catch(err) {
           return res.status(500).json({msg: err.message})
       }      
   },

   getUser: async (req, res) => {
       try {
           const user = await Users.findById(req.user.id).select('-password')
           if(!user) return res.status(400).json({msg: "User n'existe pas"})
           res.json(user)
           //res.json(req.user) //id user

       } catch(err) {
           return res.status(500).json({msg: err.message})
       }
   },

   addCart: async (req, res) =>{
    try {
        const user = await Users.findById(req.user.id)
        if(!user) return res.status(400).json({msg: "User does not exist."})

        await Users.findOneAndUpdate({_id: req.user.id}, {
            cart: req.body.cart
        })

        return res.json({msg: "Added to cart"})
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
},

history: async(req, res) =>{
    try {
        const history = await Payments.find({user_id: req.user.id})
        res.json(history)
    } catch (err) {
        return res.status(500).json({msg:err.message})
    }
}
}    

       
const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '11m'})
}

const createRefreshToken = (user) =>{
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'})
}

module.exports = userCtrl
