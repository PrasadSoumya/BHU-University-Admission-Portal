'use client'

import React, { useState, useEffect, useMemo } from 'react';

const AlbumCard = ({ album, onClick, translations }) => (
    <div
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
        onClick={() => onClick(album)}
        role="button"
        tabIndex="0"
        aria-label={`${album.title}: ${album.description}`}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onClick(album);
            }
        }}
    >
        <img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-48 object-cover rounded-t-xl"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                    "https://placehold.co/400x300/cccccc/000000?text=Image+Error";
            }}
        />
        <div className="p-4">
            <h3 className="text-lg font-semibold text-indigo-800 mb-1">
                {album.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{album.description}</p>
        </div>
    </div>
);

const AlbumDetailModal = ({ album, onClose, translations }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const t = translations;

    const goToNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % album.images.length);
    };

    const goToPrev = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + album.images.length) % album.images.length
        );
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = "unset";
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-3xl font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label={t.closeModal}
                >
                    &times;
                </button>

                <h2 id="modal-title" className="text-2xl font-bold text-indigo-800 mb-4 text-center">
                    {album.title}
                </h2>

                <div className="relative flex-grow flex items-center justify-center mb-4">
                    <img
                        src={album.images[currentImageIndex]}
                        alt={`${album.title} - ${t.image} ${currentImageIndex + 1} ${t.of} ${album.images.length}`}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/800x600/cccccc/000000?text=Image+Error";
                        }}
                    />
                    {album.images.length > 1 && (
                        <>
                            <button
                                onClick={goToPrev}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                aria-label={t.previousImage}
                            >
                                &#8249;
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                aria-label={t.nextImage}
                            >
                                &#8250;
                            </button>
                        </>
                    )}
                </div>

                <p className="text-center text-gray-700 text-sm" aria-live="polite">
                    {t.image} {currentImageIndex + 1} {t.of} {album.images.length}
                </p>
            </div>
        </div>
    );
};

export default function AlbumGallery({ locale }) {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const translations = {
        en: {
            pageTitle: "Campus Life Photo Gallery",
            searchPlaceholder: "Search albums by title or description...",
            show: "Show:",
            entries: "albums per page",
            noAlbums: "No albums found.",
            noMatchingAlbums: "No albums match your search for",
            loadingAlbums: "Loading albums...",
            errorFetching: "Error fetching albums:",
            previous: "Previous",
            next: "Next",
            image: "Image",
            of: "of",
            totalAlbums: "Showing {start} to {end} of {total} albums. Page {currentPage} of {pageCount}.",
            closeModal: "Close album details",
            previousImage: "Previous image",
            nextImage: "Next image",
            paginationNav: "Pagination for albums"
        },
        "hi-IN": {
            pageTitle: "कैम्पस जीवन फोटो गैलरी",
            searchPlaceholder: "शीर्षक या विवरण द्वारा एल्बम खोजें...",
            show: "दिखाएँ:",
            entries: "एल्बम प्रति पृष्ठ",
            noAlbums: "कोई एल्बम नहीं मिला।",
            noMatchingAlbums: "आपकी खोज से कोई एल्बम मेल नहीं खाता",
            loadingAlbums: "एल्बम लोड हो रहे हैं...",
            errorFetching: "एल्बम प्राप्त करने में त्रुटि:",
            previous: "पिछला",
            next: "अगला",
            image: "छवि",
            of: "का",
            totalAlbums: "{start} से {end} तक {total} एल्बम दिखा रहा है। पृष्ठ {currentPage} का {pageCount}।",
            closeModal: "एल्बम विवरण बंद करें",
            previousImage: "पिछली छवि",
            nextImage: "अगली छवि",
            paginationNav: "एल्बमों के लिए पेजिंग"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    const GET_ALBUMS_QUERY = `
    query GetGalleries($locale: String!) {
      admissionGalleries_connection(
        sort: "createdAt:desc"
        filters: { isVisible: { eq: true }, locale: { eq: $locale } }
        pagination: { pageSize: 100 }
      ) {
        nodes {
          documentId
          title
          description
          coverImage { url }
          images { url }
        }
      }
    }
  `;

    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(graphqlApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${strapiToken}`,
                    },
                    body: JSON.stringify({
                        query: GET_ALBUMS_QUERY,
                        variables: { locale },
                    }),
                });
                if (!res.ok) throw new Error(await res.text());

                const { data, errors } = await res.json();
                if (errors) throw new Error(`GraphQL Errors: ${JSON.stringify(errors)}`);

                const nodes = data.admissionGalleries_connection.nodes;
                const formatted = nodes.map(n => ({
                    id: n.documentId,
                    title: n.title,
                    description: n.description,
                    coverImage: process.env.NEXT_PUBLIC_STRAPI_API_URL + n.coverImage?.url || '',
                    images: Array.isArray(n.images) ? n.images.map(i => process.env.NEXT_PUBLIC_STRAPI_API_URL + i.url) : [],
                }));

                setAlbums(formatted);
            } catch (err) {
                console.error("Error fetching albums:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, [locale, graphqlApiUrl, strapiToken, GET_ALBUMS_QUERY]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const filtered = useMemo(() => {
        const term = debouncedSearchTerm.toLowerCase();
        return term
            ? albums.filter(a =>
                a.title.toLowerCase().includes(term) ||
                a.description.toLowerCase().includes(term)
            )
            : albums;
    }, [albums, debouncedSearchTerm]);

    const pageCount = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAlbums = filtered.slice(startIndex, startIndex + itemsPerPage);
    const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pageCount) {
            setCurrentPage(page);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const openAlbumModal = (album) => {
        setSelectedAlbum(album);
    };

    const closeAlbumModal = () => {
        setSelectedAlbum(null);
    };

    const getPaginationRange = (currentPage, pageCount) => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let lastPageAdded;

        range.push(1);

        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i < pageCount && i > 1) {
                range.push(i);
            }
        }

        if (pageCount > 1) {
            range.push(pageCount);
        }

        const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

        uniqueRange.forEach(page => {
            if (lastPageAdded) {
                if (page - lastPageAdded === 2) {
                    rangeWithDots.push(lastPageAdded + 1);
                } else if (page - lastPageAdded !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(page);
            lastPageAdded = page;
        });

        return rangeWithDots;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-700" role="status" aria-live="polite">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-500"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-500 delay-75"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse bg-indigo-500 delay-150"></div>
                    <span>{t.loadingAlbums}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 font-sans text-red-700" role="alert" aria-live="assertive">
                <div className="p-6 bg-white rounded-lg shadow-xl border border-red-300">
                    <h3 className="text-lg font-semibold mb-2">{t.errorFetching}</h3>
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-200 font-sans text-gray-800">
            <section className="max-w-full mx-auto bg-gray-200 rounded-xl shadow-2xl p-4" aria-labelledby="gallery-title">
                <h2 id="gallery-title" className="text-3xl font-extrabold text-indigo-800 mb-8 text-center">
                    {t.pageTitle}
                </h2>

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="itemsPerPage" className="text-gray-700 text-sm font-medium">{t.show}</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-gray-700"
                            aria-controls="album-grid"
                        >
                            <option value={4}>4</option>
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                            <option value={16}>16</option>
                        </select>
                        <span className="text-gray-700 text-sm">{t.entries}</span>
                    </div>

                    <div className="relative w-full sm:max-w-sm">
                        <label htmlFor="search-input" className="sr-only">{t.searchPlaceholder}</label>
                        <input
                            type="text"
                            id="search-input"
                            placeholder={t.searchPlaceholder}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-gray-700"
                            aria-controls="album-grid"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                {currentAlbums.length > 0 ? (
                    <div id="album-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="grid">
                        {currentAlbums.map((album) => (
                            <AlbumCard key={album.id} album={album} onClick={openAlbumModal} translations={t} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200" role="status" aria-live="polite">
                        <h3 className="text-lg font-semibold mb-2">{t.noAlbums}</h3>
                        {searchTerm && <p className="mt-2 text-sm text-gray-500">{t.noMatchingAlbums} "<span className="font-medium">{searchTerm}</span>".</p>}
                    </div>
                )}

                {pageCount > 1 && (
                    <nav className="flex justify-center items-center mt-8 space-x-2" aria-label={t.paginationNav}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 text-indigo-700 border-2 border-indigo-700 hover:scale-105 rounded transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            aria-label={t.previous}
                        >
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                className="w-5 h-5 mr-2 transform rotate-180"
                                aria-hidden="true"
                            >
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span>{t.previous}</span>
                        </button>

                        {getPaginationRange(currentPage, pageCount).map((pageNumber, idx) =>
                            pageNumber === "..." ? (
                                <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500" aria-hidden="true">...</span>
                            ) : (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all duration-300 ease-in-out ${currentPage === pageNumber
                                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:scale-105"
                                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                    aria-label={`Page ${pageNumber}`}
                                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                                >
                                    {pageNumber}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pageCount}
                            className="flex items-center px-4 py-2 text-indigo-700 border-2 border-indigo-700 hover:scale-105 rounded transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            aria-label={t.next}
                        >
                            <span>{t.next}</span>
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                className="w-5 h-5 ml-2"
                                aria-hidden="true"
                            >
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </nav>
                )}

                {filtered.length > 0 && (
                    <div className="text-center text-sm text-gray-600 mt-4" aria-live="polite">
                        {t.totalAlbums
                            .replace('{start}', startIndex + 1)
                            .replace('{end}', endIndex)
                            .replace('{total}', filtered.length)
                            .replace('{currentPage}', currentPage)
                            .replace('{pageCount}', pageCount)}
                    </div>
                )}
            </section>

            {selectedAlbum && (
                <AlbumDetailModal album={selectedAlbum} onClose={closeAlbumModal} translations={t} />
            )}
        </div>
    );
}