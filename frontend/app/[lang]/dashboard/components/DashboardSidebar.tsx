'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSidebar } from './SidebarContext';

interface DashboardSidebarProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
}

export default function DashboardSidebar({ lang, dictionary }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { isOpen, isCollapsed, toggleCollapse, closeSidebar } = useSidebar();

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

    const menuItems = [
        {
            name: dictionary.dashboard?.menu?.overview || 'Overview',
            href: `/${lang}/dashboard`,
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: dictionary.dashboard?.menu?.projects || 'Projects',
            href: `/${lang}/dashboard/projects`,
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            name: dictionary.dashboard?.menu?.reports || 'Reports',
            href: `/${lang}/dashboard/reports`,
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    const isActive = (href: string) => {
        if (href === `/${lang}/dashboard`) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    // Handle click on link for mobile - close sidebar
    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 z-40 h-screen bg-[#081F2E] text-white
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                    ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                    w-64
                `}
            >
                {/* Logo & Toggle Button */}
                <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'md:flex-col md:py-4 md:gap-2 md:px-2' : 'justify-between px-4 h-16'
                    }`}>
                    <Link
                        href={`/${lang}/dashboard`}
                        className={`block relative transition-all duration-300 ${isCollapsed ? 'md:w-12 md:h-12' : 'w-36 h-10'
                            }`}
                        onClick={handleLinkClick}
                    >
                        <img
                            src="/images/logo/BrixAurea_full_transparent.png"
                            alt="BrixAurea"
                            className={`h-full object-contain transition-all duration-300 ${isCollapsed ? 'md:object-center w-full' : 'w-full object-left'
                                }`}
                        />
                    </Link>

                    {/* Toggle Button - Hidden on mobile, visible on md+ */}
                    <button
                        onClick={toggleCollapse}
                        className={`hidden md:flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'
                            }`}
                        aria-label="Toggle Sidebar"
                    >
                        <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className={`
                                        flex items-center rounded-lg py-3 text-sm font-medium 
                                        transition-all duration-200 group
                                        ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-4'}
                                        ${isActive(item.href)
                                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-4 border-cyan-400'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    {item.icon}
                                    <span className={`${isCollapsed ? 'md:hidden' : ''}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Bottom Section */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 border-t border-cyan-500/20 space-y-2`}>
                    <Link
                        href={`/${lang}/dashboard/settings`}
                        onClick={handleLinkClick}
                        className={`
                            flex items-center rounded-lg py-3 text-sm font-medium transition-colors
                            ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-4'}
                            ${isActive(`/${lang}/dashboard/settings`)
                                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-l-4 border-cyan-400'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }
                        `}
                        title={isCollapsed ? (dictionary.dashboard?.menu?.settings || 'Settings') : ''}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className={`${isCollapsed ? 'md:hidden' : ''}`}>
                            {dictionary.dashboard?.menu?.settings || 'Settings'}
                        </span>
                    </Link>

                    <Link
                        href={`/${lang}`}
                        onClick={handleLinkClick}
                        className={`
                            flex items-center rounded-lg py-3 text-sm font-medium 
                            text-gray-400 hover:bg-white/5 hover:text-white transition-colors
                            ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-4'}
                        `}
                        title={isCollapsed ? (dictionary.dashboard?.menu?.back_to_site || 'Back to Site') : ''}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className={`${isCollapsed ? 'md:hidden' : ''}`}>
                            {dictionary.dashboard?.menu?.back_to_site || 'Back to Site'}
                        </span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`
                            flex items-center rounded-lg py-3 text-sm font-medium 
                            text-gray-400 hover:bg-red-500/10 hover:text-red-400 
                            transition-colors w-full disabled:opacity-50
                            ${isCollapsed ? 'md:justify-center md:px-2' : 'gap-3 px-4'}
                        `}
                        title={isCollapsed ? (dictionary.dashboard?.logout || 'Logout') : ''}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className={`${isCollapsed ? 'md:hidden' : ''}`}>
                            {isLoggingOut
                                ? (dictionary.dashboard?.logging_out || 'Logging out...')
                                : (dictionary.dashboard?.logout || 'Logout')
                            }
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

