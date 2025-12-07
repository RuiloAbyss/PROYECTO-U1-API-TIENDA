import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado para la notificación de éxito
    const [notification, setNotification] = useState(null);

    // AJUSTA ESTO A TU PUERTO DE BACKEND (Asegúrate de que coincida con tu consola)
    const API_URL = 'http://localhost:3000/api/auth'; 

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        street: '',
        zip: '',
        tax_id: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validación básica
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            setLoading(true);

            // Preparar payload para el backend
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                tax_id: formData.tax_id,
                address: `${formData.street}, ${formData.zip}` 
            };

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrarse');
            }

            // --- ÉXITO ---
            // 1. Mostrar Notificación
            setNotification('¡Cuenta creada con éxito! Redirigiendo...');

            // 2. Esperar 2 segundos y redirigir al LOGIN
            setTimeout(() => {
                navigate('/login'); 
            }, 2000);

        } catch (err) {
            setError(err.message);
            setLoading(false); // Solo quitamos loading si hubo error
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6">
            
            {/* === NOTIFICACIÓN FLOTANTE (TOAST) === */}
            {notification && (
                <div className="fixed top-5 right-5 z-50 animate-bounce-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-green-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-bold text-lg">{notification}</span>
                    </div>
                </div>
            )}

            {/* === FONDO DINÁMICO === */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-50 dark:bg-slate-900">
                <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] rounded-full bg-indigo-400/30 dark:bg-indigo-600/20 blur-[100px] animate-pulse" />
                <div className="absolute top-[20%] right-[0%] w-[30rem] h-[30rem] rounded-full bg-cyan-400/30 dark:bg-cyan-600/20 blur-[80px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-violet-400/30 dark:bg-violet-600/20 blur-[100px]" />
            </div>

            {/* === FORMULARIO === */}
            <div className="relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 dark:border-slate-700/50">
                
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Únete a nosotros
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                        Crea tu cuenta para empezar a comprar
                    </p>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center font-semibold">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Campos del formulario (Simplificado visualmente, código igual al anterior) */}
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Nombre Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="Ej. Juan Pérez" required />
                    </div>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Correo Electrónico</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="cliente@ejemplo.com" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="••••••••" required />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Confirmar</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="••••••••" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Dirección de Envío</label>
                            <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="Calle y número" required />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">Código Postal</label>
                            <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="00000" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">RFC / ID Fiscal</label>
                        <input type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400" placeholder="Para facturación" required />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading || notification}
                        className={`w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-lg mt-4 transition-all duration-200 
                            ${(loading || notification) 
                                ? 'bg-green-500 cursor-not-allowed scale-100' // Estado de éxito/carga
                                : 'bg-orange-400 hover:bg-orange-500 hover:shadow-orange-500/50 hover:scale-102 shadow-orange-500/30' // Estado normal
                            }`}
                    >
                        {notification ? '¡Creado!' : (loading ? 'Registrando...' : 'Crear Cuenta y Comprar')}
                    </button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold hover:underline transition-colors">
                            Inicia sesión
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;