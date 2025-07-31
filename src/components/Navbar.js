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
                <header className="bg-slate-900 text-gray-800 py-2 px-2 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between">
                    {/* Logo */}
                    <div className="flex justify-between items-center w-full md:w-auto  md:mb-0">
                        <a href={`/${locale}`} aria-label="Home">
                            <img
                                src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/uploads/logo_big_3_small_843dd9d936.png`}
                                alt={t.bhuLogo}
                                className="h-20 w-auto object-contain"
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

                    <div className="hidden md:flex flex-col flex-grow space-y-1 w-full">
                        <div className="flex justify-end items-center gap-1.5 flex-wrap text-sm">
                            {/* Visit BHU Website */}
                            <a
                                href="https://bhu.ac.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                aria-label={`${t.visitBHU} (opens in new tab)`}
                            >
                                <FaGlobe className="text-xs" />
                                {t.visitBHU}
                            </a>

                            <button
                                onClick={() => handleLanguageChange(locale === 'en' ? 'hi-IN' : 'en')}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition bg-white text-gray-700 border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                aria-label={`Switch to ${locale === 'en' ? t.hindi : t.english}`}
                                title={`Switch to ${locale === 'en' ? t.hindi : t.english}`}
                            >
                                <MdLanguage className="text-sm" />
                                {locale === 'en' ? t.english : t.hindi}
                            </button>


                          
                            {[{ icon: <FaMinus />, action: decreaseFontSize, label: t.smaller },
                            { icon: <BiReset />, action: resetFontSize, label: t.reset },
                            { icon: <FaPlus />, action: increaseFontSize, label: t.larger }]
                                .map(({ icon, action, label }, idx) => (
                                    <button
                                        key={idx}
                                        onClick={action}
                                        className="px-1.5 py-0.5 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        title={label}
                                        aria-label={label}
                                    >
                                        {icon}
                                    </button>
                                ))}

                            <button
                                onClick={activateScreenReader}
                                className="inline-flex items-center gap-1 px-1.5  py-0.5 text-xs bg-white order border-gray-300 rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                title="Screen Reader Instructions"
                                aria-label="Screen Reader Instructions"
                            >
                                <FaVideo className="text-sm" />
                            </button>
                        </div>


                        {/* Main Nav Links */}
                        <section className="flex flex-col min-h-full">
                            <header className="bg-slate-900 text-gray-800 py-4 px-4 md:px-8 shadow-sm  flex flex-col flex-grow">

                                <nav className="mt-auto flex justify-center flex-wrap gap-10 font-semibold uppercase text-sm text-gray-100 w-full border-t border-slate-500 pt-4">
                                    {navigationItems.map(link => (
                                        <a
                                            key={link.id}
                                            href={link.enums === 'external' ? link.url : `/${locale}${link.url}`}
                                            target={link.enums === 'external' ? '_blank' : undefined}
                                            rel={link.enums === 'external' ? 'noopener noreferrer' : undefined}
                                            className="text-white hover:text-orange-500 transition-transform transform hover:scale-110"
                                        >
                                            {link.Title}
                                        </a>
                                    ))}
                                </nav>
                            </header>
                        </section>

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
                                <button
                                    onClick={() => handleLanguageChange(locale === 'en' ? 'hi-IN' : 'en')}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded border bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    title={`Switch to ${locale === 'en' ? 'Hi' : 'En'}`}
                                    aria-label={`Switch to ${locale === 'en' ? 'Hi' : 'En'}`}
                                >
                                    <MdLanguage className="text-lg" />
                                    {locale === 'en' ? 'En' : 'Hi'}
                                </button>


                                <button onClick={decreaseFontSize} className="p-2 border rounded bg-white"><FaMinus /></button>
                                <button onClick={resetFontSize} className="p-2 border rounded bg-white"><BiReset /></button>
                                <button onClick={increaseFontSize} className="p-2 border rounded bg-white"><FaPlus /></button>
                                <button
                                    onClick={activateScreenReader}
                                    className="p-2 border rounded bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    title="Screen Reader Instructions"
                                    aria-label="Screen Reader Instructions"
                                >
                                    <FaVideo className="text-lg" />
                                </button>
                            </div>
                        </div>
                    )}
                </header>
            )}


        </section>
    );
}
