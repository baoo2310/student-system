import { MoonIcon, SunIcon, ComputerDesktopIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { useState, useRef, useEffect } from 'react';

export default function ModeSelector() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const themeOptions = [
        { value: 'light', label: 'Light', icon: SunIcon, color: 'text-yellow-500' },
        { value: 'dark', label: 'Dark', icon: MoonIcon, color: 'text-blue-400' },
        { value: 'system', label: 'System', icon: ComputerDesktopIcon, color: 'text-gray-400' },
    ] as const;

    const currentOption = themeOptions.find(t => t.value === theme) || themeOptions[2];
    const CurrentIcon = currentOption.icon;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <CurrentIcon className={`w-5 h-5 ${currentOption.color}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                    {currentOption.label}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="py-1 uppercase text-xs font-semibold text-gray-400 tracking-wider px-3 mb-1 mt-1">
                        Theme
                    </div>
                    {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = theme === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left transition-colors ${isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isSelected ? option.color : 'text-gray-400'}`} />
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
