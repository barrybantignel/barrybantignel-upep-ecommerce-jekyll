import React, {useState, useContext, useEffect} from 'react';//, useEffect
import axios from 'axios';
import {GlobalState} from '../../../GlobalState';
import Loading from '../utils/loading/Loading';
import {useHistory, useParams} from 'react-router-dom';


const initialState = {
    product_id: '',
    title: '',
    price: 0,
    description: 'Effet CSS sympa, idées de conception Web, bibliothèques JavaScript, Nodejs',
    content: 'Bienvenue sur notre site UPEP Scoop Solidaire, la conception UI / UX, les animations css et les effets css.',
    category: '',
    id: ''
}

export default function CreateProduct() {
    const state = useContext(GlobalState)
    const [product, setProduct] = useState(initialState)
    const [categories] = state.categoriesAPI.categories
    const [images, setImages] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const [isAdmin] = state.userAPI.isAdmin
    const [token] = state.token
    const history = useHistory()
    const param = useParams()

    const [products] = state.productsAPI.products
    const [onEdit, setOnEdit] = useState(false)
    const [callback, setCallback] = state.productsAPI.callback

    useEffect(() => {
        if(param.id) {
            setOnEdit(true)
            products.forEach(product => {
                if(product._id === param.id){
                    setProduct(product)
                    setImages(product.images)
                }
                
            })            
        } else {
            setProduct(initialState)
            setImages(false)
            setOnEdit(false)
        }
    }, [param.id, products])

    const handleUpload = async(e) => {
        e.preventDefault()
        try {

            if(!isAdmin) return alert("vous n'êtes pas un Admin")
            const file = e.target.files[0]
           // console.log(file)
           if(!file) return alert("Le fichier n'existe pas.")

           if(file.size > 1024 * 1024) // 1mb
                return alert("Le fichier ne doit pas dépasser 1G!")

           if(file.type !== 'image/jpeg' && file.type !== 'image/png') // 1mb
                return alert("Le format du fichier est incorrect.")

           let formData = new FormData()
           formData.append('file', file)

           setLoading(true)
           const res = await axios.post('/api/upload', formData, {
            headers: {'content-type': 'multipart/form-data', Authorization: token}
        })
        setLoading(false)
        //console.log(res)
        setImages(res.data)

        } catch (err) {
            alert(err.response.data.msg)
        }
    }

    const handleDestroy = async e => {
        try {
           if(!isAdmin) return alert("vous n'êtes pas un Admin")
           setLoading(true)
           await axios.post('/api/destroy', {public_id: images.public_id}, {
               headers: {Authorization: token}  
           })
           
           setLoading(false)
           setImages(false)
        }   catch(err) {
            alert(err.response.data.msg)
        }  
       }

    const handleChangeInput = e =>{
        const {name, value} = e.target
        setProduct({...product, [name]:value})
    }

    const handleSubmit = async e => {
        e.preventDefault()

        try {
            if(!isAdmin) return alert("vous n'êtes pas un Admin")
            if(!images) return alert("Image non chargée")

            if(onEdit){
                await axios.put(`/api/products/${product._id}`, {...product, images}, {
                    headers: {Authorization: token}
                })
            }else{
                await axios.post('/api/products', {...product, images}, {
                    headers: {Authorization: token}
                })
            }

            //setImages(false) car il y a setCallback
            setProduct(initialState)
            history.push("/")
            setCallback(!callback)
        } catch(err) {
            alert(err.response.data.msg)
        }
    }     

    const styleUpload = {
        display: images ? "block" : "none"
    }
    

    return (
        <div className="create_product">
            <div className="upload"> 
            <input type="file" name="file" id="file_up" onChange={handleUpload} />

            {
                 loading ? <div id="file_img"><Loading /></div>

                 : <div id="file_img" style={styleUpload}>

                 <img  src={images ? images.url : ''} alt=""/>
                 <span onClick={handleDestroy}>X</span> 
              </div>  
            }
           
            </div>

            <form onSubmit={handleSubmit} >
                <div className="row">
                   <label htmlFor="product_id">Product ID</label>
                   <input type="text" name="product_id" id="product_id"
                    required value={product.product_id} onChange={handleChangeInput} disabled={onEdit} />
                </div>

                <div className="row">
                   <label htmlFor="title">Titre</label>
                   <input type="text" name="title" id="title" required
                    value={product.title} onChange={handleChangeInput}  />
                </div>

                <div className="row">
                   <label htmlFor="price">Prix</label>
                   <input type="number" name="price" id="price" required
                    value={product.price} onChange={handleChangeInput} />
                </div>

                <div className="row">
                   <label htmlFor="description">Description</label>
                   <textarea type="text" name="description" id="description" required
                    value={product.description} rows="5" onChange={handleChangeInput} />
                </div>

                  <div className="row">
                    <label htmlFor="content">A propos</label>
                    <textarea type="text" name="content" id="content" required
                    value={product.content} rows="7" onChange={handleChangeInput} />
                </div>

                <div className="row">
                <label htmlFor="categories">Categories:</label>
                <select name="category" value={product.category} onChange={handleChangeInput} >
                    <option value="">Veuillez sélectionner une catégorie</option>
                    {
                        categories.map(category => (
                            <option value={category._id} key={category._id} >
                                {category.name}
                            </option>
                        ))
                    }
                </select>
                </div>
                
                <button type="submit">Créer </button>
            </form>
            
        </div>
    )
}
