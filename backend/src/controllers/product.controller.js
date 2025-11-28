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
    const { name, product_key, unit_key } = req.body;
    if (!name || !product_key || !unit_key) {
        return res.status(400).json({ message: 'Los campos name, product_key y unit_key son obligatorios' });
    }

    try {
        const newProduct = await Product.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        // Si ocurre un error (ej. de Facturapi), se envía una respuesta de error.
        res.status(500).json({ message: "Error al crear el producto", error: error.message });
    }
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
