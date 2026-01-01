'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useSidebar } from './SidebarContext';

interface DashboardHeaderProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
    userName: string;
    userEmail: string;
    companyName?: string;
    logoUrl?: string;
}

export default function DashboardHeader({
    lang,
    dictionary,
    userName,
    userEmail,
    companyName,
    logoUrl
}: DashboardHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const { toggleSidebar } = useSidebar();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                router.push(`/${lang}/auth/login`);
                router.refresh();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const displayName = companyName || userName;

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shadow-sm">
            {/* Left side - Hamburger + Title */}
            <div className="flex items-center gap-3">
                {/* Hamburger Menu Button - Only visible on mobile */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Page Title */}
                <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                    {dictionary.dashboard?.title || 'Dashboard'}
                </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <LanguageSwitcher currentLang={lang} />

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {/* Notification badge */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {/* Avatar or Logo */}
                        {logoUrl ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                                <img
                                    src={logoUrl}
                                    alt={companyName || 'Company Logo'}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-700">{displayName}</p>
                            <p className="text-xs text-gray-500">{userEmail}</p>
                        </div>
                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            {/* Backdrop to close dropdown */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                                    {logoUrl && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                                            <img
                                                src={logoUrl}
                                                alt={companyName || 'Company Logo'}
                                                className="w-full h-full object-contain p-0.5"
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{displayName}</p>
                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                </div>

                                <a
                                    href={`/${lang}/dashboard/settings`}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {dictionary.dashboard?.menu?.settings || 'Settings'}
                                </a>

                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        {isLoggingOut
                                            ? (dictionary.dashboard?.logging_out || 'Logging out...')
                                            : (dictionary.dashboard?.logout || 'Logout')
                                        }
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
