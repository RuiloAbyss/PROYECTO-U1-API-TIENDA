import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado para la notificación de éxito
    const [notification, setNotification] = useState(null);

    // AJUSTA ESTO A TU PUERTO DE BACKEND
    const API_URL = API_BASE_URL + '/api/auth';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            // --- ÉXITO ---
            // 1. Guardar Token y Rol
            localStorage.setItem('token', data.token);
            if (data.role) {
                localStorage.setItem('role', data.role);
            }

            // 2. Mostrar Notificación de Éxito
            setNotification('¡Acceso concedido! Redirigiendo...');

            // 3. Esperar 2 segundos para que lean el mensaje y redirigir
            setTimeout(() => {
                navigate('/'); // Redirige al Home
            }, 2000);

        } catch (err) {
            setError(err.message);
            setLoading(false); // Solo quitamos el loading si hay error
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6">

            {/* === NOTIFICACIÓN FLOTANTE (TOAST) === */}
            {notification && (
                <div className="fixed top-5 right-5 z-50 animate-bounce-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-green-400">
                        {/* Ícono de Check simple */}
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

            {/* === TARJETA DE LOGIN === */}
            <div className="relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/50 dark:border-slate-700/50">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                        ¡Hola de nuevo!
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                {/* Mensaje de Error (Rojo) */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white placeholder-slate-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Botón Principal (Cambia texto al cargar) */}
                    <button
                        type="submit"
                        disabled={loading || notification} // Bloquear si carga o si ya tuvo éxito
                        className={`w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-lg mt-6 transition-all duration-200 
                            ${(loading || notification)
                                ? 'bg-green-500 cursor-not-allowed scale-100' // Estado de éxito/carga
                                : 'bg-orange-400 hover:bg-orange-500 hover:shadow-orange-500/50 hover:scale-102 shadow-orange-500/30' // Estado normal
                            }`}
                    >
                        {notification ? '¡Entrando!' : (loading ? 'Verificando...' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <div>
                        <a href="/register" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            ¿No tienes cuenta? <span className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Regístrate</span>
                        </a>
                    </div>
                    <div>
                        <a href="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;