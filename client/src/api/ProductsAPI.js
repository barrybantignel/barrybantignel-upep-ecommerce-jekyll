import React, { useState, useEffect} from 'react';
import axios from 'axios';


function ProductsAPI() {
    const [products, setProducts] = useState([])
    const [callback, setCallback] = useState()
    const [category, setCategory] = useState('')
    const [sort, setSort] = useState('')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [result, setResult] = useState(0)

    
    useEffect(() => {
        const getProducts = async() => {
            const res = await axios.get(`/api/products?limit=${page*9}&${category}&${sort}&title[regex]=${search}`)
            //console.log(res)
            //console.log(res.data.products)
            setProducts(res.data.products)
            //console.log(res)
            setResult(res.data.result)
        }          
        getProducts()
    }, [callback, category, page, search, sort])  

        return  {
            products : [products, setProducts],
            callback: [callback, setCallback],
            category: [category, setCategory],
            sort: [sort, setSort],
            search: [search, setSearch],
            page: [page, setPage],
            result: [result, setResult]
        }
    }

export default ProductsAPI
