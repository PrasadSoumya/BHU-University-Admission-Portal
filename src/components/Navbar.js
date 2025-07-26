"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaGlobe, FaMinus, FaPlus } from 'react-icons/fa';
import { MdLanguage } from 'react-icons/md';
import { BiReset } from 'react-icons/bi';
import { FaVideo } from 'react-icons/fa'; // Import the new icon

export default function Navbar({ locale }) {
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const translations = {
        en: {
            visitBHU: "Visit BHU Official Website",
            english: "En", // Changed to En
            hindi: "Hi", // Changed to Hi
            loadingNavbar: "Loading Navigation...",
            errorNavbar: "Error loading Navigation data!",
            smaller: "Make Text Smaller",
            larger: "Make Text Larger",
            reset: "Reset Text Size",
            toggleMenu: "Toggle navigation menu",
            closeMenu: "Close navigation menu",
            bhuLogo: "Banaras Hindu University Logo",
            screenReader: "Activate Screen Reader"
        },
        "hi-IN": {
            visitBHU: "बीएचयू की आधिकारिक वेबसाइट पर जाएं",
            english: "अंग्रेज़ी", 
            hindi: "हिंदी", 
            loadingNavbar: "नेविगेशन लोड हो रहा है...",
            errorNavbar: "नेविगेशन डेटा लोड करने में त्रुटि!",
            smaller: "पाठ छोटा करें",
            larger: "पाठ बड़ा करें",
            reset: "पाठ आकार रीसेट करें",
            toggleMenu: "नेविगेशन मेनू टॉगल करें",
            closeMenu: "नेविगेशन मेनू बंद करें",
            bhuLogo: "काशी हिंदू विश्वविद्यालय का लोगो",
            screenReader: "स्क्रीन रीडर सक्रिय करें"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        const GET_NAVIGATION_ITEMS_QUERY = `
      query GetNavigationItems($locale: String!) {
        navbars_connection(filters: { locale: { eq: $locale } }) {
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
                        'Authorization': 'Bearer ' + strapiToken,
                    },
                    body: JSON.stringify({
                        query: GET_NAVIGATION_ITEMS_QUERY,
                        variables: { locale: locale || 'en' },
                    }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("GraphQL API Error Response:", errorBody);
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
                }

                const json = await response.json();

                if (json.errors) {
                    console.error("GraphQL Errors:", json.errors);
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
    }, [graphqlApiUrl, locale, strapiToken]);

    const handleLanguageChange = (newLocale) => {
        const segments = pathname.split('/').filter(Boolean);

        if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'hi-IN')) {
            segments[0] = newLocale;
        } else {
            segments.unshift(newLocale);
        }

        const newPath = '/' + segments.join('/');
        router.push(newPath);
    };

    const navigationItems = data?.navbars_connection?.nodes
        ?.find(nav => nav.locale === locale)
        ?.navbar_item
        ?.filter(item => item.isVisible)
        ?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        document.body.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 10));
    const resetFontSize = () => setFontSize(16);

    const activateScreenReader = () => {
        alert("Screen Reader functionality would be activated here.");
    };

    return (
        <section aria-label="Site Navigation and Accessibility Tools">
            <div className="bg-slate-500 text-sm text-black px-2 py-1 flex flex-col md:flex-row justify-between items-center font-sans gap-3 md:gap-0">
                <div className="flex justify-center items-center">
                    <a
                        href="https://bhu.ac.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#a54417] to-orange-500 text-white font-semibold py-2 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                        aria-label={`${t.visitBHU} (opens in new tab)`}
                    >
                        <FaGlobe aria-hidden="true" className="text-lg" />
                        {t.visitBHU}
                    </a>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2">
                    <div className="flex gap-2 items-center" role="group" aria-label="Language selection">
                        <button
                            onClick={() => handleLanguageChange('en')}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition duration-200 ease-in-out flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white ${locale === 'en'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-black hover:bg-gray-100'
                                }`}
                            aria-current={locale === 'en' ? "page" : undefined}
                            aria-label={t.english}
                        >
                            <MdLanguage className="text-xl" aria-hidden="true" />
                            {t.english}
                        </button>
                        <button
                            onClick={() => handleLanguageChange('hi-IN')}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition duration-200 ease-in-out flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white ${locale === 'hi-IN'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-black hover:bg-gray-100'
                                }`}
                            aria-current={locale === 'hi-IN' ? "page" : undefined}
                            aria-label={t.hindi}
                        >
                            <MdLanguage className="text-xl" aria-hidden="true" />
                            {t.hindi}
                        </button>
                    </div>

                    <div className="flex items-center gap-2" role="group" aria-label="Font size adjustment and screen reader">
                        <button
                            onClick={decreaseFontSize}
                            title={t.smaller}
                            className="px-3 py-1.5 bg-white text-black rounded-lg border hover:bg-gray-100 transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            aria-label={t.smaller}
                        >
                            <FaMinus aria-hidden="true" className="text-base" />
                        </button>
                        <button
                            onClick={resetFontSize}
                            title={t.reset}
                            className="px-3 py-1.5 bg-white text-black rounded-lg border hover:bg-gray-100 transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            aria-label={t.reset}
                        >
                            <BiReset aria-hidden="true" className="text-base" />
                        </button>
                        <button
                            onClick={increaseFontSize}
                            title={t.larger}
                            className="px-3 py-1.5 bg-white text-black rounded-lg border hover:bg-gray-100 transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            aria-label={t.larger}
                        >
                            <FaPlus aria-hidden="true" className="text-base" />
                        </button>
                        {/* New Screen Reader Button */}
                        <button
                            onClick={activateScreenReader}
                            title={t.screenReader}
                            className="px-3 py-1.5 bg-white text-black rounded-lg border hover:bg-gray-100 transition flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            aria-label={t.screenReader}
                        >
                            <FaVideo aria-hidden="true" className="text-base" />
                            <span className="sr-only md:not-sr-only">{t.screenReader}</span> {/* Visible on desktop, SR-only on mobile */}
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <header className="bg-slate-700 text-white py-4 px-6 flex items-center justify-center relative z-20" role="status" aria-live="polite">
                    <span className="text-gray-300 text-lg font-semibold animate-pulse">{t.loadingNavbar}</span>
                </header>
            )}

            {error && (
                <header className="bg-red-700 text-white py-4 px-6 flex items-center justify-center relative z-20" role="alert" aria-live="assertive">
                    <span className="text-white text-lg font-semibold">{t.errorNavbar}</span>
                </header>
            )}

            {!loading && !error && (
                <header className="bg-slate-700 text-white py-2 px-2 md:px-8 relative z-20 flex flex-col"> {/* Changed to flex-col for overall header structure */}
                    {/* Mobile: Logo and Hamburger in one row */}
                    <div className="flex items-center justify-between md:hidden w-full"> {/* Added mb-4 for spacing */}
                        <div className="flex-shrink-0">
                            <a href={`/${locale}`} aria-label="Home" className="block">
                                <img
                                    src={process.env.NEXT_PUBLIC_STRAPI_API_URL+"/uploads/logo_big_3_small_843dd9d936.png"}
                                    alt={t.bhuLogo}
                                    className="h-16" /* Adjusted height for mobile top row */
                                />
                            </a>
                        </div>
                        <button
                            onClick={toggleMenu}
                            className="text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded-md p-2"
                            aria-expanded={isOpen}
                            aria-controls="mobile-menu"
                            aria-label={t.toggleMenu}
                        >
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="hidden md:flex items-center justify-between w-full">
                        <div className="flex-shrink-0 mr-8">
                            <a href={`/${locale}`} aria-label="Home" className="block">
                                <img
                                    src={process.env.NEXT_PUBLIC_STRAPI_API_URL+"/uploads/logo_big_3_small_843dd9d936.png"}
                                    alt={t.bhuLogo}
                                    className="h-16"
                                />
                            </a>
                        </div>
                        <nav className="flex-grow flex justify-end space-x-10 text-xm font-semibold" aria-label="Main Navigation">
                            {navigationItems.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.enums === "external" ? link.url : `/${locale}${link.url}`}
                                    target={link.enums === "external" ? "_blank" : undefined}
                                    rel={link.enums === "external" ? "noopener noreferrer" : undefined}
                                    className="text-white hover:text-orange-300 uppercase transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 rounded-md px-3 py-2"
                                    aria-label={link.enums === "external" ? `${link.Title} (opens in new tab)` : link.Title}
                                >
                                    {link.Title}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {isOpen && (
                        <div id="mobile-menu" className="fixed inset-0 bg-slate-700 bg-opacity-95 flex flex-col z-1050 p-2" role="menu">
                            <div className="flex items-center justify-between w-full"> 
                                <a href={`/${locale}`} onClick={toggleMenu} aria-label="Home">
                                    <img
                                        src={process.env.NEXT_PUBLIC_STRAPI_API_URL+"/uploads/logo_big_3_small_843dd9d936.png"}
                                        alt={t.bhuLogo}
                                        className="h-20 " 
                                    />
                                </a>
                                <button
                                    onClick={toggleMenu}
                                    className="text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded-md p-2"
                                    aria-label={t.closeMenu}
                                >
                                    <svg
                                        className="w-10 h-10"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="square" strokeLinejoin="square" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {/* Second row within mobile menu: Navigation Links */}
                            <nav className="flex flex-col items-center space-y-6 flex-grow" aria-label="Mobile Navigation">
                                {navigationItems.map((link) => (
                                    <a
                                        key={`mobile-${link.id}`}
                                        href={link.enums === "external" ? link.url : `/${locale}${link.url}`}
                                        onClick={toggleMenu}
                                        target={link.enums === "external" ? "_blank" : undefined}
                                        rel={link.enums === "external" ? "noopener noreferrer" : undefined}
                                        className="text-white uppercase font-semibold text-xl hover:scale-105 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white px-4 py-2 rounded-md"
                                        aria-label={link.enums === "external" ? `${link.Title} (opens in new tab)` : link.Title}
                                        role="menuitem"
                                    >
                                        {link.Title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}
                </header>
            )}
        </section>
    );
}
