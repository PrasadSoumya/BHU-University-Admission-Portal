"use client";
import { useState, useEffect } from "react";

export default function ProgramDetails({ programType, level, visibleProgramType, visibleLevel, locale }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [tempSearchTerm, setTempSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
            searchButton: "Search",
            title: "Title (English)",
            department: "Department",
            termType: "Term Type",
            totalTerms: "Total Terms",
            minDuration: "Min Duration (Months)",
            showingPrograms: "Showing",
            of: "of",
            programs: "programs.",
            pageOf: "Page of",
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
            searchButton: "खोजें",
            title: "शीर्षक (अंग्रेज़ी)",
            department: "विभाग",
            termType: "अवधि प्रकार",
            totalTerms: "कुल अवधि",
            minDuration: "न्यूनतम अवधि (महीनों में)",
            showingPrograms: "दिखा रहा है",
            of: "में से",
            programs: "प्रोग्राम।",
            pageOf: "का",
            paginationPrev: "पिछला पृष्ठ",
            paginationNext: "अगला पृष्ठ",
            paginationGoTo: "पृष्ठ पर जाएं"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        setSearchTerm("");
        setTempSearchTerm("");
        setCurrentPage(1);
    }, [programType, level]);

    useEffect(() => {
        const GET_PROGRAM_DETAILS_QUERY = `
            query GetProgramDetails($programmeType: String!, $levels: [String]!, $page: Int!, $pageSize: Int!, $searchTerm: String) {
                programmes_connection(
                    filters: {
                        programmeType: { eq: $programmeType },
                        level: { in: $levels },
                        programmeStatus: { eq: "ACTIVE" },
                        department : { name : { not : { containsi : "Paid Fee Course"} }}
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
                            levels: level === "POSTMASTER" ? ["POSTMASTER", "POSTDOCTORAL"] : [level],
                            page: currentPage,
                            pageSize: itemsPerPage,
                            searchTerm: searchTerm
                        }
                    }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
                }

                const json = await response.json();
                if (json.errors) throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);

                setData(json.data);
            } catch (err) {
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
    }, [graphqlApiUrl, strapiToken, programType, level, currentPage, itemsPerPage, searchTerm]);

    const programs = data?.programmes_connection?.nodes || [];
    const pageInfo = data?.programmes_connection?.pageInfo || { page: 1, pageSize: itemsPerPage, pageCount: 1, total: 0 };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pageInfo.pageCount) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    return (
        <section className="font-sans text-gray-800">
            <div className="max-w-full mx-auto bg-white rounded-xl shadow-2xl p-2">
                <h2 className="text-xl font-extrabold text-indigo-800 mb-8 text-center">
                    {t.pageHeading} <span className="text-purple-700">{visibleProgramType}</span> - <span className="text-purple-700">{visibleLevel}</span>
                </h2>

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="itemsPerPage" className="text-gray-700 text-sm font-medium">{t.show}</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                        >
                            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="text-gray-700 text-sm">{t.entries}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full sm:max-w-md space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={tempSearchTerm}
                            onChange={(e) => setTempSearchTerm(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                        />
                        <button
                            onClick={() => {
                                setSearchTerm(tempSearchTerm);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            {t.searchButton}
                        </button>
                    </div>

                </div>

                {/* Results Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-700 text-white text-sm font-semibold">
                            <tr>
                                <th className="px-4 py-2 text-left">{t.title}</th>
                                <th className="px-4 py-2 text-left">{t.department}</th>
                                <th className="px-4 py-2 text-left">{t.termType}</th>
                                <th className="px-4 py-2 text-left">{t.totalTerms}</th>
                                <th className="px-4 py-2 text-left">{t.minDuration}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map(program => (
                                <tr key={program.documentId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">{program.titleEnglish}</td>
                                    <td className="px-4 py-2">{program.department?.name || "N/A"}</td>
                                    <td className="px-4 py-2">{program.termType}</td>
                                    <td className="px-4 py-2">{program.totalTerms}</td>
                                    <td className="px-4 py-2">{Math.trunc(program.minimumDurationMonth)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700">
                        <div className="mb-2 sm:mb-0">
                            {t.showingPrograms} {(pageInfo.page - 1) * pageInfo.pageSize + 1}
                            &nbsp;{t.of}&nbsp;
                            {Math.min(pageInfo.page * pageInfo.pageSize, pageInfo.total)} {t.programs}
                        </div>
                        <div className="mb-2 sm:mb-0">
                            {t.pageOf} {pageInfo.page} {t.of} {pageInfo.pageCount}
                        </div>
                        <div>
                            Total: {pageInfo.total} {t.programs}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
