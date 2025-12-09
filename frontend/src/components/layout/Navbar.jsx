import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/products?search=${searchTerm}`);
            setIsMenuOpen(false);
        }
    };

    // Verificar autenticación y cargar carrito al montar el componente
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchCartCount(token);
        } else {
            setIsLoggedIn(false);
            setCartCount(0);
        }
    }, [location.pathname]); // Recargar al cambiar de ruta (útil tras login)

    const fetchCartCount = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/api/shoppingcart/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const cart = await response.json();
                // Calcular total de items (suma de cantidades)
                const count = cart.products ? cart.products.reduce((acc, item) => acc + item.quantity, 0) : 0;
                setCartCount(count);
            }
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setCartCount(0);
        setIsMenuOpen(false);
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo y nombre */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">T</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Tienda
                            </span>
                        </Link>
                    </div>

                    {/* Enlaces del centro (desktop) */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Inicio
                        </Link>
                        {isLoggedIn && (
                            <>
                                {/* Puedes agregar más enlaces protegidos aquí */}
                            </>
                        )}
                    </div>

                    {/* Buscador (Solo visual por ahora) */}
                    <div className="hidden md:flex items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm transition-all shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Carrito y usuario */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {/* Carrito */}
                                <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L2 1H1m6 12a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm animate-bounce-in">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Usuario / Logout */}
                                <div className="flex items-center space-x-3 ml-2 border-l border-gray-200 dark:border-gray-600 pl-4">
                                    <Link
                                        to="/perfil"
                                        className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Mi Cuenta
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg text-sm font-medium transition-colors tooltips"
                                        title="Cerrar Sesión"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm px-3 py-2 transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}

                        {/* Botón menú móvil */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Menú móvil */}
                {isMenuOpen && (
                    <div className="md:hidden bg-gray-50 dark:bg-gray-700 rounded-b-lg shadow-inner">
                        <div className="px-4 pt-3 pb-4 space-y-2">
                            {/* Buscador Móvil */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <Link
                                to="/"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Inicio
                            </Link>

                            {isLoggedIn ? (
                                <>
                                    <Link
                                        to="/cart"
                                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span>Carrito</span>
                                        {cartCount > 0 && (
                                            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        to="/perfil"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Mi Cuenta
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;