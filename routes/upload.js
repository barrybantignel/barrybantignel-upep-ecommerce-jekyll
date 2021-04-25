const router = require('express').Router();
const cloudinary = require('cloudinary');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const fs = require('fs');

//Télécharger image sur cloud
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

// Seul admin peut téléchager une image
router.post('/upload', (req, res) => {
    try {

        //console.log(req.files)
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(400).send({msg:'Pas de fichier téléchargé.'})

        const file = req.files.file;
        if(file.size > 1024*1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "la taille du fichier est trop grande"})
        }
         
        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "Le format du fichier est incorrect"})
        }
         
        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "test"}, async(err, result)=>{
            if(err) throw err;

            //res.json({result})

            removeTmp(file.tempFilePath)

            res.json({public_id: result.public_id, url: result.secure_url})

        })

    } catch(err) {
        return res.status(500).json({msg: err.message})
    }
})

// Supprimer une image
router.post('/destroy', (req, res) => {
    try {

        const {public_id} = req.body;
        if(!public_id) 
        return res.status(400).json({msg: 'pas d\'images sélectionnées'})

        cloudinary.v2.uploader.destroy(public_id, async(err, result) => {
            if(err) throw err;
            res.json({msg: "image supprimée"})
        })

    } catch(err) {
        return res.status(500).json({msg: err.message})
    }
    

})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err;
    })
}

module.exports = router;
