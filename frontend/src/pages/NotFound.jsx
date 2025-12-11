import { Link } from 'react-router';

const NotFound = () => {
    return (
        <main className="grid min-h-screen place-items-center bg-gray-100 dark:bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 dark:text-white sm:text-7xl">
                    Página no encontrada
                </h1>
                <p className="mt-6 text-lg font-medium text-pretty text-gray-600 dark:text-gray-400 sm:text-xl/8">
                    Lo sentimos, no pudimos encontrar la página que buscas.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        to="/"
                        className="rounded-md bg-blue-600 dark:bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 dark:hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                    <Link 
                        to="#" 
                        className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Contactar soporte <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default NotFound;