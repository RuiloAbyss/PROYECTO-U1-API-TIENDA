import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estado inicial para un nuevo producto
    const initialProductState = {
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        url_image: '',
        product_key: '43232106', // Clave SAT genérica
        unit_key: 'H87' // Pieza
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');

            const response = await fetch('https://electronic-store-ruiloop.vercel.app/api/product/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar productos');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsEditing(true);
        window.scrollTo(0, 0); // Ir arriba para ver el formulario
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://electronic-store-ruiloop.vercel.app/api/product/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setSuccess('Producto eliminado');
                fetchProducts();
            } else {
                alert('No se pudo eliminar');
            }
        } catch (err) {
            alert('Error al conectar');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            const method = currentProduct.id ? 'PUT' : 'POST';
            const url = currentProduct.id
                ? `https://electronic-store-ruiloop.vercel.app/api/product/${currentProduct.id}`
                : 'https://electronic-store-ruiloop.vercel.app/api/product/';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currentProduct)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar');
            }

            setSuccess(currentProduct.id ? 'Producto actualizado' : 'Producto creado');
            setIsEditing(false);
            setCurrentProduct(initialProductState); // Limpiar form
            fetchProducts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct({ ...currentProduct, [name]: value });
    };

    if (loading) return <div className="p-10 text-center">Cargando panel...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Administración de Productos</h1>

            {/* Formulario */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    {currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text" name="name" placeholder="Nombre del Producto" required
                        value={currentProduct.name || ''} onChange={handleChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="number" name="price" placeholder="Precio" required
                        value={currentProduct.price || ''} onChange={handleChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="number" name="stock" placeholder="Stock" required
                        value={currentProduct.stock || ''} onChange={handleChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="text" name="category" placeholder="Categoría"
                        value={currentProduct.category || ''} onChange={handleChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="text" name="brand" placeholder="Marca"
                        value={currentProduct.brand || ''} onChange={handleChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <input
                        type="url" name="url_image" placeholder="URL de la Imagen"
                        value={currentProduct.url_image || ''} onChange={handleChange}
                        className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <textarea
                        name="description" placeholder="Descripción" rows="3"
                        value={currentProduct.description || ''} onChange={handleChange}
                        className="md:col-span-2 p-2 border rounded dark:bg-gray-700 dark:text-white"
                    ></textarea>



                    <div className="md:col-span-2 flex justify-end space-x-3">
                        {isEditing && (
                            <button
                                type="button" onClick={() => { setIsEditing(false); setCurrentProduct(initialProductState); setError(null); setSuccess(null); }}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {currentProduct.id ? 'Actualizar' : 'Crear Producto'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.url_image || 'https://placehold.co/100'} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 mr-4">Editar</button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
