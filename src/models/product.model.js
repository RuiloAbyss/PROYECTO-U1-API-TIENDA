const { randomUUID } = require('node:crypto')

let products = [];

function findAll(filters = {}){
    let filteredProducts = products;
    
    if (filters.category) {// Filtrado por categoría 
        const categoryFilter = filters.category.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.category && p.category.toLowerCase() === categoryFilter
        );
    }

    if (filters.brand) {// Filtrado por marca
        const brandFilter = filters.brand.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.brand && p.brand.toLowerCase() === brandFilter
        );
    }

    return filteredProducts;
}

function findById(id){
    return products.find((p) => p.id === id) || null;
}

async function addProduct(data){
    const product = {
        id: randomUUID(),
        name: data.name,
        brand: data.brand || '',
        category: data.category || '',
        stock: data.stock || 0,
        price: data.price || 0,
        description: data.description || '',
        url_image: data.url_image || ''
    };
    products.push(product);
    return product;
}

async function updateProduct(id, data){
    const product = products.find((p) => p.id === id);
    if(!product) return null;

    product.name = data.name || product.name;
    product.brand = data.brand || product.brand;
    product.category = data.category || product.category;
    product.stock = data.stock !== undefined ? data.stock : product.stock; 
    product.price = data.price !== undefined ? data.price : product.price; 
    product.description = data.description || product.description;
    product.url_image = data.url_image || product.url_image;

    return product;
}

async function deleteProduct(id){
    const index = products.findIndex((p) => p.id === id);
    if(index === -1) return null;
    products.splice(index, 1);
    return true;
}

module.exports = { findAll, findById, addProduct, updateProduct, deleteProduct };