import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:3000/api/shoppingcart/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Error al cargar el carrito');
            }

            const data = await response.json();
            setCart(data);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar tu carrito de compras.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/shoppingcart/items/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (response.ok) {
                const updatedCart = await response.json();
                setCart(updatedCart);
            } else {
                const data = await response.json();
                alert(data.message || 'No se pudo actualizar la cantidad');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const removeItem = async (productId) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/shoppingcart/items/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchCart(); // Recargar carrito
                toggleNotification('Producto eliminado');
            } else {
                alert('No se pudo eliminar el producto');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/shoppingcart/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                toggleNotification('¡Compra realizada con éxito!');
                setTimeout(() => {
                    navigate('/'); // Redirigir al home o a una página de éxito
                }, 2000);
                setCart(null); // Limpiar vista
            } else {
                alert(data.message || 'Error al procesar la compra');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        } finally {
            setProcessing(false);
        }
    };

    const toggleNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!cart || !cart.products || cart.products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-lg mx-auto">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L2 1H1m6 12a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">¡Explora nuestros productos y encuentra algo que te guste!</p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        Ir a comprar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Notificación */}
            {notification && (
                <div className="fixed top-24 right-5 z-50 animate-bounce-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-bold">{notification}</span>
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Carrito de Compras</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <div className="lg:col-span-7">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden mb-6">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cart.products.map((item) => (
                                <li key={item.product.id} className="p-6 sm:flex sm:items-center">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                                        <img
                                            src={item.product.url_image || 'https://placehold.co/200x200?text=No+Image'}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {item.product.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Categoria: {item.product.category}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Descripción: {item.product.description}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Stock: {item.product.stock}
                                                </p>
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                ${item.product.price}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            {/* Control de Cantidad */}
                                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 py-1 text-gray-900 dark:text-white font-semibold min-w-[2.5rem] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.product.id)}
                                                className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-5 mt-8 lg:mt-0">
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resumen del Pedido</h2>
                        <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                            <div className="flex items-center justify-between py-4 text-base text-gray-600 dark:text-gray-300">
                                <dt>Subtotal</dt>
                                <dd>${cart.subtotal}</dd>
                            </div>
                            <div className="flex items-center justify-between py-4 text-base text-gray-600 dark:text-gray-300">
                                <dt>IVA (16%)</dt>
                                <dd>${cart.iva}</dd>
                            </div>
                            <div className="flex items-center justify-between py-6 text-xl font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">
                                <dt>Total</dt>
                                <dd>${cart.total}</dd>
                            </div>
                        </dl>
                        <div className="mt-6">
                            <button
                                onClick={handleCheckout}
                                disabled={processing}
                                className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-all
                                    ${processing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : 'Finalizar Compra'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
