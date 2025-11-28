import { useState } from 'react';

const Register = () => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación básica
        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        console.log('Datos de registro:', formData);
    };

    return (
        <div className="isolate min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-6 py-8">
            {/* Fondo decorativo con degradado */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#80ff95] to-[#8989fc] opacity-20 sm:left-[calc(50%-40rem)] sm:w-288.75"
                />
            </div>
            
            {/* Segundo fondo decorativo */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#8989fc] to-[#80ff95] opacity-10 sm:left-[calc(50%+36rem)] sm:w-288.75"
                />
            </div>
            
            <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200/20 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                    Crear Cuenta
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre completo */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Nombre Completo
                        </label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                            placeholder="Ej. Juan Pérez"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Correo Electrónico
                        </label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    {/* Contraseña y Confirmar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                Contraseña
                            </label>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                Confirmar
                            </label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Dirección y Código Postal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                Dirección
                            </label>
                            <input 
                                type="text" 
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                                placeholder="Av. ejemplo #33"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                                C.P.
                            </label>
                            <input 
                                type="text" 
                                name="zip"
                                value={formData.zip}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                                placeholder="00000"
                                required
                            />
                        </div>
                    </div>

                    {/* RFC/Tax ID */}
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            RFC
                        </label>
                        <input 
                            type="text" 
                            name="tax_id"
                            value={formData.tax_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400"
                            placeholder="ABCDEFGHI1234"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition duration-200 font-semibold"
                    >
                        Crear Cuenta
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <a href="/login" className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm">
                        ¿Ya tienes cuenta? Inicia sesión
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Register;