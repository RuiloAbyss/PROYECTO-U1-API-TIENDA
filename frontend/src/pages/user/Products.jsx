import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Products = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch('https://electronic-store-ruiloop.vercel.app/api/product/', {
                    method: 'GET',
                    headers: headers
                });

                if (response.status === 401) {
                    navigate('/login');
                    return;
                }

                if (!response.ok) throw new Error('Error al obtener los productos');

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('No se pudieron cargar los productos.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [navigate]);

    const addToCart = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('https://electronic-store-ruiloop.vercel.app/api/shoppingcart/items', {
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

    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            product.name.toLowerCase().includes(lowerTerm) ||
            (product.description && product.description.toLowerCase().includes(lowerTerm)) ||
            (product.category && product.category.toLowerCase().includes(lowerTerm))
        );
    });

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="py-12 relative">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                    {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos nuestros Productos'}
                </h2>
                {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'No hay productos disponibles por el momento.'}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="aspect-square w-full overflow-hidden bg-gray-200 dark:bg-gray-700 xl:aspect-7/8 relative cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                                    <img
                                        alt={product.description || product.name}
                                        src={product.url_image || 'https://placehold.co/600x400?text=Sin+Imagen'}
                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100"
                                        >
                                            Agregar al Carrito
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                        {product.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {product.category || 'General'}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            ${product.price}
                                        </p>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors md:hidden"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
