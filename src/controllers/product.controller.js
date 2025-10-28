const Product = require('../models/product.model');

function findAll(req, res) {
    const data = Product.findAll();
    res.status(200).json(data);
}

function findById(req, res) {
    const product = Product.findById(req.params.id);
    return product ? res.status(200).json(product) : res.status(404).json({ message: 'Producto no encontrado' });
}
function addProduct(req, res) {
    if (!req.body.name) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    const newProduct = Product.addProduct(req.body);
    res.status(201).json(newProduct);
}

function updateProduct(req, res) {
    const updated = Product.updateProduct(req.params.id, req.body);
    return updated ? res.status(200).json(updated) : res.status(404).json({ message: 'Producto no encontrado' });
}

function deleteProduct(req, res) {
    const deleted = Product.deleteProduct(req.params.id);
    return deleted ? res.status(204).send() : res.status(404).json({ message: 'Producto no encontrado' });
}

module.exports = { 
    findAll, 
    findById, 
    addProduct, 
    updateProduct, 
    deleteProduct
};