const { randomUUID } = require('node:crypto')

const { db } = require("../firebase");

const productsCollection = db.collection("products");

async function findAll(filters = {}) {
    let query = productsCollection;

    if (filters.category) {
        query = query.where('category', '==', filters.category);
    }

    if (filters.brand) {
        query = query.where('brand', '==', filters.brand);
    }

    const snapshot = await query.get();
    const products = [];
    snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
    });
    return products;
}

async function findById(id) {
    const doc = await productsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

async function addProduct(data) {
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
    await productsCollection.doc(product.id).set(product);
    return { id: product.id, ...product };
}

async function updateProduct(id, data) {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    await docRef.update(data);
    return { id: id, ...data };
}

async function deleteProduct(id) {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    await docRef.delete();
    return true;
}

module.exports = { findAll, findById, addProduct, updateProduct, deleteProduct };
