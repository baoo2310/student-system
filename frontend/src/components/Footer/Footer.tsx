export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start space-x-6 md:order-2 text-sm text-gray-500 dark:text-gray-400">
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">About</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-base text-gray-400 dark:text-gray-500">
                            &copy; {currentYear} Student System Platform. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
