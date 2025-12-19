import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(`${API_BASE_URL}/api/product/${productId}`, {
                    method: 'GET',
                    headers: headers
                });

                if (response.status === 401) {
                    navigate('/login');
                    return;
                }

                if (!response.ok) throw new Error('Error al obtener el producto');

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el producto.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]);

    const addToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(API_BASE_URL + '/api/shoppingcart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            if (response.ok) {
                setNotification(`¡${product.name} agregado al carrito!`);
                setTimeout(() => setNotification(null), 3000);
            } else {
                alert('Error al agregar al carrito');
            }
        } catch (error) {
            console.error(error);
            alert('Error al conectar con el servidor');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-red-500">
                <p className="text-xl font-bold mb-4">{error || 'Producto no encontrado'}</p>
                <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Volver a Productos
                </button>
            </div>
        );
    }

    return (
        <div className="py-12 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {notification && (
                <div className="fixed top-24 right-5 z-50 animate-bounce-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-green-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-bold text-lg">{notification}</span>
                    </div>
                </div>
            )}

            <button
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Regresar
            </button>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                {/* Imagen del Producto */}
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-lg">
                    <img
                        src={product.url_image || 'https://placehold.co/600x600?text=Sin+Imagen'}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Detalles del Producto */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <div className="mb-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {product.category || 'General'}
                        </span>
                        {product.brand && (
                            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {product.brand}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        {product.name}
                    </h1>

                    <div className="mt-6">
                        <h2 className="sr-only">Descripción</h2>
                        <p className="text-base text-gray-700 dark:text-gray-300 space-y-6">
                            {product.description || 'Sin descripción disponible.'}
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                            ${product.price}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Stock disponible: <span className="font-semibold text-gray-900 dark:text-white">{product.stock || 'Consultar'}</span>
                        </div>
                    </div>

                    <div className="mt-10 flex sm:flex-col1">
                        <button
                            onClick={addToCart}
                            className="max-w-xs flex-1 bg-blue-600 border border-transparent rounded-full py-4 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 sm:w-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L2 1H1m6 12a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"></path>
                            </svg>
                            Agregar al Carrito
                        </button>
                    </div>

                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Garantía de calidad y envío seguro a todo el país.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
