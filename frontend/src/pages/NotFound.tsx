import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-9xl font-black text-gray-200 dark:text-gray-700">404</h1>
                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mt-4">
                    Uh-oh!
                </p>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                    We can't find that page.
                </p>
                <Link
                    to="/home"
                    className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
