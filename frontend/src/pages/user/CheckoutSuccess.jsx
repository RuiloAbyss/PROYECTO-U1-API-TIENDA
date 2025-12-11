import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cartService } from '../../services/cartService';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Procesando tu pago...');
    const [orderDetails, setOrderDetails] = useState(null);
    const hasProcessed = useRef(false); // Evitar múltiples ejecuciones

    useEffect(() => {
        // Solo ejecutar una vez
        if (!hasProcessed.current) {
            hasProcessed.current = true;
            completePurchase();
        }
    }, []);

    const completePurchase = async () => {
        try {
            // Obtener el token del query string de PayPal
            const token = searchParams.get('token'); // Este es el orderId de PayPal
            
            console.log('🔍 Token recibido de PayPal:', token);
            
            if (!token) {
                setStatus('error');
                setMessage('No se encontró información de la orden.');
                return;
            }

            console.log('📤 Enviando solicitud para completar el checkout...');
            
            // Completar la compra con el backend
            const result = await cartService.completeCheckout(token);

            console.log('📥 Respuesta del servidor:', result);

            if (result && result.id) {
                setStatus('success');
                setMessage('¡Tu compra ha sido procesada exitosamente!');
                setOrderDetails(result);
                
                // Limpiar localStorage
                localStorage.removeItem('paypalOrderId');
                localStorage.removeItem('cartId');
            } else {
                setStatus('error');
                setMessage(result.message || 'Error al procesar la compra');
            }
        } catch (error) {
            console.error('❌ Error al completar compra:', error);
            setStatus('error');
            setMessage(error.message || 'Hubo un error al procesar tu pago. Por favor, contacta a soporte.');
        }
    };

    const handleContinue = () => {
        navigate('/products');
    };

    if (status === 'processing') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Procesando tu pago</h2>
                    <p className="text-gray-600 dark:text-gray-400">Por favor espera mientras confirmamos tu pago con PayPal...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error en el Pago</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/cart')}
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Volver al Carrito
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                        >
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                {/* Icono de éxito */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">¡Compra Exitosa!</h1>
                    <p className="text-gray-600 dark:text-gray-400">{message}</p>
                </div>

                {/* Detalles de la orden */}
                {orderDetails && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalles de tu Compra</h3>
                        
                        <div className="space-y-3 mb-4">
                            {orderDetails.products && orderDetails.products.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">${(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                <span className="text-gray-900 dark:text-white">${orderDetails.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">IVA (16%):</span>
                                <span className="text-gray-900 dark:text-white">${orderDetails.iva}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                                <span className="text-gray-900 dark:text-white">Total:</span>
                                <span className="text-gray-900 dark:text-white">${orderDetails.total}</span>
                            </div>
                        </div>

                        {orderDetails.payment_id && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold">ID de Pago:</span> {orderDetails.payment_id}
                                </p>
                            </div>
                        )}

                        {orderDetails.invoice_id && (
                            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold">Factura:</span> {orderDetails.invoice_id}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Recibirás un correo con los detalles de tu factura
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mensaje informativo */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                            <p className="font-semibold mb-1">Recibirás un correo de confirmación</p>
                            <p>Hemos enviado los detalles de tu compra y factura a tu correo electrónico.</p>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleContinue}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Seguir Comprando
                    </button>
                    <button
                        onClick={() => navigate('/perfil')}
                        className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                    >
                        Ver mi Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;
