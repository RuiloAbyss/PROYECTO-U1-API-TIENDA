const { randomUUID } = require('node:crypto')

const { db } = require("../firebase");

const Facturapi = require('facturapi').default;
const facturapi = new Facturapi(process.env.FACTURAPI_KEY); 

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

async function addProduct({ name, price, product_key, unit_key, ...data }) {
    if (!product_key || !unit_key) {
        throw new Error("Los campos 'product_key' y 'unit_key' son requeridos para Facturapi.");
    }

    // Crear producto en Facturapi
    let facturapiProduct;
    try {
        console.log("Creando producto en Facturapi...");
        facturapiProduct = await facturapi.products.create({
            description: name,
            product_key: product_key, // Clave de producto/servicio del SAT.
            unit_key: unit_key,       // Clave de unidad del SAT.
            price: price || 0
        });
        console.log("Producto creado en Facturapi:", facturapiProduct.id);
    } catch (error) {
        console.error('Error al crear el producto en Facturapi:', error.message);
        // Decide si quieres detener la creación del producto si falla en Facturapi
        throw new Error(`Error en Facturapi: ${error.message}`);
    }

    const product = {
        id: randomUUID(),
        id_product_facturapi: facturapiProduct.id, // Guardamos el ID de Facturapi
        name: name,
        price: price || 0,
        product_key: product_key,
        unit_key: unit_key,
        brand: data.brand || '',
        category: data.category || '',
        stock: data.stock || 0,
        description: data.description || '',
        url_image: data.url_image || ''
    };
    await productsCollection.doc(product.id).set(product);
    return product;
}

async function updateProduct(id, data) {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }

    const productData = doc.data();
    // Si el producto tiene un ID de Facturapi y se actualizan datos relevantes
    if (productData.id_product_facturapi && (data.name || data.price || data.product_key || data.unit_key)) {
        try {
            console.log(`Actualizando producto ${productData.id_product_facturapi} en Facturapi...`);
            await facturapi.products.update(productData.id_product_facturapi, {
                description: data.name,
                product_key: data.product_key,
                unit_key: data.unit_key,
                price: data.price
            });
            console.log("Producto en Facturapi actualizado.");
        } catch (error) {
            console.error('Error al actualizar el producto en Facturapi:', error.message);
            // Considera cómo manejar este error
        }
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

    const productData = doc.data();
    if (productData.id_product_facturapi) {
        try {
            console.log(`Eliminando producto ${productData.id_product_facturapi} de Facturapi...`);
            await facturapi.products.del(productData.id_product_facturapi);
            console.log("Producto en Facturapi eliminado.");
        } catch (error) {
            console.error('Error al eliminar el producto en Facturapi:', error.message);
        }
    }
    await docRef.delete();
    return true;
}

module.exports = { findAll, findById, addProduct, updateProduct, deleteProduct };
