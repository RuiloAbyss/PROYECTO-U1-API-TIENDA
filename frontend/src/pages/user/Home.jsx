import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');

                const headers = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('http://localhost:3000/api/product/', {
                    method: 'GET',
                    headers: headers
                });

                if (response.status === 401) {
                    // Si no está autorizado, mandar al login
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Error al obtener los productos');
                }
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
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                        Bienvenido a nuestra
                        <span className="block text-blue-600 dark:text-blue-400">
                            Tienda en Línea
                        </span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Descubre los mejores productos con la mejor calidad y precios increíbles.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <div className="rounded-md shadow">
                            <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors">
                                Ver Productos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Productos destacados */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Productos Destacados
                    </h2>
                    {products.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">No hay productos disponibles por el momento.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {products.map((product) => (
                                <a key={product.id} href="#" className="group">
                                    <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 xl:aspect-7/8">
                                        <img
                                            alt={product.description || product.name}
                                            src={product.url_image || 'https://placehold.co/600x400?text=Sin+Imagen'}
                                            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-200"
                                        />
                                    </div>
                                    <h3 className="mt-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        {product.name}
                                    </h3>
                                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                        ${product.price}
                                    </p>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;