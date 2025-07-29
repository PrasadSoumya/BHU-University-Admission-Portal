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
            screenReader: ""
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
            screenReader: ""
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
        alert(
            `🧏‍♂️ How to Start Your Screen Reader\n\n` +
            `🪟 Windows:\nCtrl + Windows + Enter (Narrator)\n\n` +
            `🍏 macOS:\nCmd + F5 (VoiceOver)\n\n` +
            `📱 iPhone/iPad:\nSettings > Accessibility > VoiceOver\n\n` +
            `🤖 Android:\nSettings > Accessibility > TalkBack`
        );
    };

    return (
        <section aria-label="Site Navigation and Accessibility Tools">
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
                <header className="bg-slate-900 text-gray-800 py-4 px-4 md:px-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between">
                    {/* Logo */}
                    <div className="flex justify-between items-center w-full md:w-auto mb-4 md:mb-0">
                        <a href={`/${locale}`} aria-label="Home">
                            <img
                                src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/logo_big_3_small_843dd9d936.png`}
                                alt={t.bhuLogo}
                                className="h-24 w-auto object-contain"
                            />
                        </a>

                        {/* Mobile Hamburger */}
                        <button
                            onClick={toggleMenu}
                            aria-expanded={isOpen}
                            aria-controls="mobile-menu"
                            aria-label={t.toggleMenu}
                            className="md:hidden text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 p-2"
                        >
                            {!isOpen ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="hidden md:flex flex-col flex-grow space-y-2 w-full">
                        <div className="flex justify-end items-center gap-1 flex-wrap text-sm">
                            <a
                                href="https://bhu.ac.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-lg transition transform hover:scale-105"
                                aria-label={`${t.visitBHU} (opens in new tab)`}
                            >
                                <FaGlobe className="inline-block mr-1" />
                                {t.visitBHU}
                            </a>

                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1 ${locale === 'en'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                aria-label={t.english}
                            >
                                <MdLanguage />
                                {t.english}
                            </button>
                            <button
                                onClick={() => handleLanguageChange('hi-IN')}
                                className={`px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1 ${locale === 'hi-IN'
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                aria-label={t.hindi}
                            >
                                <MdLanguage />
                                {t.hindi}
                            </button>

                            {/* Font Tools */}
                            <button onClick={decreaseFontSize} className="px-2 py-1.5 bg-white border rounded hover:bg-gray-100" title={t.smaller} aria-label={t.smaller}>
                                <FaMinus />
                            </button>
                            <button onClick={resetFontSize} className="px-2 py-1.5 bg-white border rounded hover:bg-gray-100" title={t.reset} aria-label={t.reset}>
                                <BiReset />
                            </button>
                            <button onClick={increaseFontSize} className="px-2 py-1.5 bg-white border rounded hover:bg-gray-100" title={t.larger} aria-label={t.larger}>
                                <FaPlus />
                            </button>

                            {/* Screen Reader */}
                            <button onClick={activateScreenReader} className="px-3 py-1.5 bg-white border rounded hover:bg-gray-100 flex items-center gap-1" title={t.screenReader} aria-label={t.screenReader}>
                                <FaVideo />
                                <span className="hidden lg:inline">{t.screenReader}</span>
                            </button>
                        </div>

                        {/* Main Nav Links */}
                        <nav className="flex justify-center flex-wrap gap-10 font-semibold uppercase text-sm text-gray-100 w-full pt-4 border-t border-slate-800">
                            {navigationItems.map(link => (
                                <a
                                    key={link.id}
                                    href={link.enums === 'external' ? link.url : `/${locale}${link.url}`}
                                    target={link.enums === 'external' ? '_blank' : undefined}
                                    rel={link.enums === 'external' ? 'noopener noreferrer' : undefined}
                                    className="text-white hover:text-orange-500 transition-transform transform hover:scale-105"
                                >
                                    {link.Title}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Mobile Menu: nav + tools */}
                    {isOpen && (
                        <div id="mobile-menu" className="md:hidden mt-4 w-full space-y-6">
                            <nav className="flex flex-col items-center space-y-4">
                                {navigationItems.map(link => (
                                    <a
                                        key={`mobile-${link.id}`}
                                        href={link.enums === 'external' ? link.url : `/${locale}${link.url}`}
                                        onClick={toggleMenu}
                                        target={link.enums === 'external' ? '_blank' : undefined}
                                        rel={link.enums === 'external' ? 'noopener noreferrer' : undefined}
                                        className="text-white uppercase font-semibold text-lg hover:text-orange-500"
                                        aria-label={link.Title}
                                    >
                                        {link.Title}
                                    </a>
                                ))}
                            </nav>

                            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-gray-300">
                                <a
                                    href="https://bhu.ac.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2 rounded-full shadow hover:shadow-lg"
                                >
                                    {t.visitBHU}
                                </a>
                                <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1.5 rounded border ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t.english}</button>
                                <button onClick={() => handleLanguageChange('hi-IN')} className={`px-3 py-1.5 rounded border ${locale === 'hi-IN' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t.hindi}</button>
                                <button onClick={decreaseFontSize} className="p-2 border rounded bg-white"><FaMinus /></button>
                                <button onClick={resetFontSize} className="p-2 border rounded bg-white"><BiReset /></button>
                                <button onClick={increaseFontSize} className="p-2 border rounded bg-white"><FaPlus /></button>
                                <button onClick={activateScreenReader} className="p-2 border rounded bg-white"><FaVideo /></button>
                            </div>
                        </div>
                    )}
                </header>
            )}


        </section>
    );
}
