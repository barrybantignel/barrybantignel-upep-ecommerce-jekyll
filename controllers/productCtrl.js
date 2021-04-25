const Products = require('../models/productModel');


//filtre, tri et pagination

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filtering(){
        const queryObj = {...this.queryString} //queryString = req.query
        console.log({avant:queryObj}) //Après suppression de la page 
       
        const excludedFields = ['page', 'sort', 'limit']
        excludedFields.forEach(el => delete(queryObj[el]))
        console.log({après:queryObj}) //Après suppression de la page 

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)

        //console.log(queryObj, queryStr)

        //console.log(queryStr)

        // gte= plus grand ou égal
        // lte= plus petit ou égal
        // lt= inférieur que
        // gt= plus grand que

        this.query.find(JSON.parse(queryStr))

        return this;
    }
     
    
    sorting(){
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join('')
            this.query = this.query.sort(sortBy)
            //console.log(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')            
        }
        return this;
    }


    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 12
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;        
    }

}

const productCtrl = {

    getProducts: async(req, res) => {

        try {
            //console.log(req.query)
            const features = new APIfeatures(Products.find(), req.query)
            .filtering().sorting().paginating();

            const products = await features.query

            res.json({
                status: 'success',
                result: products.length,
                products: products
            })

            //res.json(products)
            //res.json('test');

        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
    },

    createProduct: async(req, res) => {

        try {

            const {product_id, title, price, description, content, images, category} = req.body;
            if(!images) return res.status(400).json({msg: "image non téléchargée"})

            const product = await Products.findOne({product_id})
            if(product) 
            return res.status(400).json({msg: "Ce produit existe déjà"})

            const newProduct = new Products({
                product_id, title: title.toLowerCase(), price, description, content, images, category                
            })
            //res.json(newProduct);
            await newProduct.save();
            res.json({msg: "un nouveau produit créé ds la BD"});

        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
    },

    deleteProduct: async(req, res) => {

        try {

            await Products.findByIdAndDelete(req.params.id)
            res.json({msg: "un produit supprimé"})

        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
    },

    updateProduct: async(req, res) => {

        try {
            const {title, price, description, content, images, category} = req.body;
            if(!images) 
            return res.status(400).json({msg: "pas d'image téléchargée"})
            
            await Products.findOneAndUpdate({_id: req.params.id}, {
                title: title.toLowerCase(), price, description, content, images, category
            })

            res.json({msg: "Un Produit mis à jour"})

        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
    }
}

module.exports = productCtrl;