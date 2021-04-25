const Category = require('../models/categoryModel');
const Products = require('../models/productModel');


const categoryCtrl = {

    getCategories: async(req, res) => {
        
        try {

            const categories = await Category.find();

            // res.json('Category test ctrl')
             res.json(categories)

        } catch(err) {
            return res.status(500).json({msg: err.message})
        }
       
    },

    createCategory : async(req, res) => {

        try {
            // si utilisateur a un role = 1 ---> Admin
            // seul l'admin peut créer, supprimer et mise à jour de category
            
            const {name} = req.body;
            const category = await Category.findOne({name})
            if(category) return res.status(400).json({msg: 'cette categorie existe déjà'})

            const newCategory = new Category({name})

            await newCategory.save()
             
            res.json({msg: "une catégorie créée"})
            

            //res.json('vérification Admin success')
        } catch(err) {
            return res.status(500).json({msg: err.message})            
        }
    },

    deleteCategory: async(req, res) => {
        try {
            
            const products = await Products.findOne({category: req.params.id})
            if(products) return res.status(400).json({
                msg:"Veuillez supprimer tous les produits avec une relation."
            })
            

            await Category.findByIdAndDelete(req.params.id)
            res.json({msg: "une catégorie supprimée"})
        } catch(err) {
            return res.status(500).json({msg: err.message})
        }
    },

    updateCategory: async(req, res) => {
        try {
            const {name} = req.body;
            await Category.findOneAndUpdate({_id: req.params.id}, {name})
            res.json({msg: "une catégorie mise à jour"})
        } catch(err) {
            return res.status(500).json({msg: err.message})
        }
    }
}
module.exports = categoryCtrl;