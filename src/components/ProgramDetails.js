"use client";
import { useState, useEffect, useRef, useMemo } from "react"; // Added useRef

export default function ProgramDetails({ programType, level, visibleProgramType, visibleLevel, locale }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // Removed [debounceTimeout, setDebounceTimeout] state
    const debounceTimeoutRef = useRef(null); // Added useRef for debounceTimeout

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const translations = {
        en: {
            loading: "Loading programs...",
            errorTitle: "Error fetching data:",
            errorHint: "Please try again or check your API configuration.",
            noPrograms: "No programs found",
            noProgramsMessage: "No programs found for",
            noResults: "Your search for",
            yieldedNoResults: "yielded no results.",
            pageHeading: "Program Details for",
            show: "Show:",
            entries: "entries",
            searchPlaceholder: "Search programs...",
            title: "Title (English)",
            department: "Department",
            termType: "Term Type",
            totalTerms: "Total Terms",
            minDuration: "Min Duration (Months)",
            showingPrograms: "Showing",
            of: "of",
            programs: "programs. Page",
            pageOf: "of",
            paginationPrev: "Previous page",
            paginationNext: "Next page",
            paginationGoTo: "Go to page"
        },
        "hi-IN": {
            loading: "प्रोग्राम लोड हो रहे हैं...",
            errorTitle: "डेटा प्राप्त करने में त्रुटि:",
            errorHint: "कृपया पुनः प्रयास करें या अपनी API कॉन्फ़िगरेशन जांचें।",
            noPrograms: "कोई प्रोग्राम नहीं मिला",
            noProgramsMessage: "के लिए कोई प्रोग्राम नहीं मिला",
            noResults: "आपकी खोज",
            yieldedNoResults: "का कोई परिणाम नहीं मिला।",
            pageHeading: "के लिए प्रोग्राम विवरण",
            show: "दिखाएँ:",
            entries: "प्रविष्टियाँ",
            searchPlaceholder: "प्रोग्राम खोजें...",
            title: "शीर्षक (अंग्रेज़ी)",
            department: "विभाग",
            termType: "अवधि प्रकार",
            totalTerms: "कुल अवधि",
            minDuration: "न्यूनतम अवधि (महीनों में)",
            showingPrograms: "दिखा रहा है",
            of: "में से",
            programs: "प्रोग्राम। पृष्ठ",
            pageOf: "का",
            paginationPrev: "पिछला पृष्ठ",
            paginationNext: "अगला पृष्ठ",
            paginationGoTo: "पृष्ठ पर जाएं"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setCurrentPage(1);
    }, [programType, level]);

    // Changed to use useRef for the debounce timeout
    useEffect(() => {
        // Clear any existing timeout before setting a new one
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset page on new search
        }, 500);

        // Store the timeout ID in the ref's .current property
        debounceTimeoutRef.current = handler;

        // Cleanup function: This runs when the component unmounts
        // or before the effect re-runs if `searchTerm` changes again
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchTerm]); // Dependency array only includes searchTerm

    useEffect(() => {
        const GET_PROGRAM_DETAILS_QUERY = `
            query GetProgramDetails($programmeType: String!, $level: String!, $page: Int!, $pageSize: Int!, $searchTerm: String) {
                programmes_connection(
                    filters: {
                        programmeType: { eq: $programmeType },
                        level: { eq: $level },
                        programmeStatus: { eq: "ACTIVE" },
                        or: [
                            { titleEnglish: { containsi: $searchTerm } },
                            { department: { name: { containsi: $searchTerm } } },
                            { termType: { containsi: $searchTerm } }
                        ]
                    }
                    pagination: { page: $page, pageSize: $pageSize }
                ) {
                    nodes {
                        documentId
                        programmeType
                        termType
                        totalTerms
                        minimumDurationMonth
                        programmeStatus
                        titleEnglish
                        department {
                            name
                        }
                    }
                    pageInfo {
                        page
                        pageSize
                        pageCount
                        total
                    }
                }
            }`;

        const fetchProgramDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(graphqlApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + strapiToken
                    },
                    body: JSON.stringify({
                        query: GET_PROGRAM_DETAILS_QUERY,
                        variables: {
                            programmeType: programType,
                            level: level,
                            page: currentPage,
                            pageSize: itemsPerPage,
                            searchTerm: debouncedSearchTerm
                        }
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
                console.error("Error fetching program details:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (programType && level) {
            fetchProgramDetails();
        } else {
            setLoading(false);
            setData(null);
        }
    }, [graphqlApiUrl, strapiToken, programType, level, currentPage, itemsPerPage, debouncedSearchTerm]);

    const programs = data?.programmes_connection?.nodes || [];
    const pageInfo = data?.programmes_connection?.pageInfo || { page: 1, pageSize: itemsPerPage, pageCount: 1, total: 0 };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pageInfo.pageCount) {
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
                    <span>{t.loading}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 font-sans text-red-700" role="alert" aria-live="assertive">
                <div className="p-6 bg-white rounded-lg shadow-xl border border-red-300">
                    <h3 className="text-lg font-semibold mb-2">{t.errorTitle}</h3>
                    <p>{error.message}</p>
                    <p className="text-sm text-gray-500 mt-2">{t.errorHint}</p>
                </div>
            </div>
        );
    }

    if (!data || !data.programmes_connection || pageInfo.total === 0) {
        return (
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 p-10 to-indigo-100 font-sans text-gray-600" role="status" aria-live="polite">
                <div className="p-6 bg-white rounded-lg shadow-xl">
                    <h3 className="text-lg font-semibold mb-2">{t.noPrograms}</h3>
                    <p>{t.noProgramsMessage} <span className="font-medium text-indigo-600">{visibleProgramType}</span> - <span className="font-medium text-indigo-600">{visibleLevel}</span>.</p>
                    {searchTerm && <p className="mt-2 text-sm text-gray-500">{t.noResults} &quot;{searchTerm}&quot; {t.yieldedNoResults}</p>}
                </div>
            </div>
        );
    }

    return (
        <section className="font-sans text-gray-800" aria-labelledby="program-details-heading">
            <div className="max-w-full mx-auto bg-white rounded-xl shadow-2xl p-2">
                <h2 id="program-details-heading" className="text-xl font-extrabold text-indigo-800 mb-8 text-center">
                    {t.pageHeading} <span className="text-purple-700">{visibleProgramType}</span> - <span className="text-purple-700">{visibleLevel}</span>
                </h2>

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="itemsPerPage" className="text-gray-700 text-sm font-medium">{t.show}</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                            aria-controls="program-table"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
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
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                            aria-controls="program-table"
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                    <table id="program-table" className="min-w-full divide-y divide-gray-200" role="table" aria-live="polite">
                        <thead className="bg-indigo-700">
                            <tr>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">{t.title}</th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">{t.department}</th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">{t.termType}</th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">{t.totalTerms}</th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">{t.minDuration}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map((program) => (
                                <tr key={program.documentId} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="py-3 px-4 text-sm text-gray-800">{program.titleEnglish}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{program.department?.name || 'N/A'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{program.termType}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{program.totalTerms}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{parseInt(program.minimumDurationMonth).toString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pageInfo.pageCount > 1 && (
                    <nav className="flex justify-center items-center mt-8 space-x-2" aria-label="Program pagination">
                        <button
                            onClick={() => handlePageChange(pageInfo.page - 1)}
                            disabled={pageInfo.page === 1}
                            className="flex items-center justify-center w-10 h-10 text-indigo-700 border-2 border-indigo-700 hover:scale-105 rounded-full transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            aria-label={t.paginationPrev}
                        >
                            <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        {getPaginationRange(pageInfo.page, pageInfo.pageCount).map((pageNumber, idx) =>
                            pageNumber === "..." ? (
                                <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500" aria-hidden="true">...</span>
                            ) : (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all duration-300 ease-in-out ${pageInfo.page === pageNumber
                                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:scale-105"
                                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                    aria-label={`${t.paginationGoTo} ${pageNumber}`}
                                    aria-current={pageInfo.page === pageNumber ? 'page' : undefined}
                                >
                                    {pageNumber}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => handlePageChange(pageInfo.page + 1)}
                            disabled={pageInfo.page === pageInfo.pageCount}
                            className="flex items-center justify-center w-10 h-10 text-indigo-700 border-2 border-indigo-700 hover:scale-105 rounded-full transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            aria-label={t.paginationNext}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </nav>
                )}

                {pageInfo.total > 0 && (
                    <div className="text-center text-sm text-gray-600 mt-4" aria-live="polite">
                        {`${t.showingPrograms} ${programs.length} ${t.of} ${pageInfo.total} ${t.programs}. ${t.page} ${pageInfo.page} ${t.pageOf} ${pageInfo.pageCount}.`}
                    </div>
                )}
            </div>
        </section>
    );
}