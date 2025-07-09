"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar({ locale }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    const pathname = usePathname();
    const router = useRouter();

    // State for managing fetched data, loading, and error
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';

    useEffect(() => {
        const GET_NAVIGATION_ITEMS_QUERY = `
            query GetNavigationItems {
                navbars_connection {
                    nodes {
                        documentId
                        locale
                        navbar_item {
                            id
                            Title
                            url
                            order
                            attachment {
                                previewUrl
                            }
                            enums
                            isVisible
                        }
                    }
                }
            }
        `;

        const fetchNavigationItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(graphqlApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_STRAPI_TOKEN
                    }, body: JSON.stringify({
                        query: GET_NAVIGATION_ITEMS_QUERY,
                    }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
                }

                const json = await response.json();

                if (json.errors) {
                    throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
                }

                setData(json.data);
            } catch (err) {
                console.error("Error fetching navigation items:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNavigationItems();
    }, [graphqlApiUrl]);

    const handleLanguageChange = (newLocale) => {
        const currentPathSegments = pathname.split('/');
        // Find the index of the current locale in the path segments
        const localeIndex = currentPathSegments.indexOf(locale);

        if (localeIndex !== -1) {
            // Replace the existing locale with the new one
            currentPathSegments[localeIndex] = newLocale;
        } else {
            // If locale is not found (e.g., initial load on root without locale),
            // insert it right after the first segment (which is usually empty for root '/')
            currentPathSegments.splice(1, 0, newLocale);
        }
        router.push(currentPathSegments.join('/'));
    };

    const navigationItems = data?.navbars_connection?.nodes
        ?.find(nav => nav.locale === locale)
        ?.navbar_item
        ?.filter(item => item.isVisible)
        ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    return (
        <>
            {loading && (
                <header className="bg-bhuBlue text-white py-4 px-6 flex items-center justify-between relative z-20">
                    <span className="text-gray-300">Loading Navbar...</span>
                </header>
            )}
            {error && (
                <header className="bg-red-700 text-white py-4 px-6 flex items-center justify-between relative z-20">
                    <span className="text-white">Error loading Navbar data!</span>
                </header>
            )}
            {!loading && !error && (
                <header className="bg-slate-700 text-white py-2 px-2 flex items-center justify-between relative z-20">
                    <div className="flex items-center space-x-4">
                        <a href="/">
                            <img
                                src="https://api.bhu.edu.in/uploads/logo_big_3_small_843dd9d936.png"
                                alt="BHU Logo"
                                className="h-20"
                            />
                        </a>
                    </div>

                    <nav className="md:flex space-x-6 text-lg font-medium">
                        {data?.navbars_connection?.nodes[0]?.navbar_item?.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target={link.enums === "external" ? "_blank" : undefined}
                                rel={link.enums === "external" ? "noopener noreferrer" : undefined}
                                className=" hover:text-bhuOrange hover:scale-110 transition-colors duration-200"
                            >
                                {link.Title}
                            </a>
                        ))}
                        <div className=" hover:scale-110 ">
                            <select
                                id="language-select-desktop"
                                className="mobile-nav-link rounded-md bg-slate-700 text-white appearance-none cursor-pointer text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                value={locale}
                            >
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                            </select>
                        </div>
                    </nav>

                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {isOpen && (
                        <div className="fixed inset-0 bg-bhuBlue bg-opacity-95 flex flex-col items-center justify-center space-y-8 text-xl font-bold md:hidden z-50 animate-fade-in">
                            <button onClick={toggleMenu} className="absolute top-4 right-6 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="square" strokeLinejoin="square" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {data?.navbars_connection?.nodes[0]?.navbar_item?.map((link) => (
                                <a
                                    key={`mobile-${link.id}`}
                                    onClick={toggleMenu}
                                    href={link.url}
                                    target={link.enums === "external" ? "_blank" : undefined}
                                    rel={link.enums === "external" ? "noopener noreferrer" : undefined}
                                    className="text-white hover:underline hover:text-bhuOrange transition-colors duration-200"
                                >
                                    {link.Title}
                                </a>
                            ))}
                            <div className="select-wrapper hover:scale-105">
                                <select
                                    id="language-select-mobile"
                                    className="custom-select mobile-nav-link rounded-md bg-slate-700 text-white p-2 appearance-none cursor-pointer"
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    value={locale}
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                </select>
                            </div>
                        </div>
                    )}
                </header>
            )}
        </>
    );
}