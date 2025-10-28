const Product = require('../models/product.model');

async function findAll(req, res) {
    const data = await Product.findAll(req.query);
    res.status(200).json(data);
}

async function findById(req, res) {
    const product = await Product.findById(req.params.id);
    return product ? res.status(200).json(product) : res.status(404).json({ message: 'Producto no encontrado' });
}
async function addProduct(req, res) {
    if (!req.body.name) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    const newProduct = await Product.addProduct(req.body);
    res.status(201).json(newProduct);
}

async function updateProduct(req, res) {
    const updated = await Product.updateProduct(req.params.id, req.body);
    return updated ? res.status(200).json(updated) : res.status(404).json({ message: 'Producto no encontrado' });
}

async function deleteProduct(req, res) {
    const deleted = await Product.deleteProduct(req.params.id);
    return deleted ? res.status(204).send() : res.status(404).json({ message: 'Producto no encontrado' });
}

module.exports = { 
    findAll, 
    findById, 
    addProduct, 
    updateProduct, 
    deleteProduct
};
