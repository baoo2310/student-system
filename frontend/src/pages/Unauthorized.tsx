import React from 'react'

export default function Unauthorized() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">401</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Unauthorized</p>
                <p className="text-gray-500 dark:text-gray-500 mb-8">You do not have permission to access this page</p>
                <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Go to Home
                </a>
            </div>
        </div>
    )
}