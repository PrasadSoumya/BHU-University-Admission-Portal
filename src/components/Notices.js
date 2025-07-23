"use client";
import { useState, useEffect } from "react";

const formatSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 50);
};

export default function NoticeSection({ locale }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const translations = {
        en: {
            loading: "Loading notices...",
            errorTitle: "Error loading data",
            noNotices: "No notices found",
            readMore: "Read More"
        },
        "hi-IN": {
            loading: "सूचनाएं लोड हो रही हैं...",
            errorTitle: "डेटा लोड करने में त्रुटि",
            noNotices: "कोई सूचना नहीं मिली",
            readMore: "और पढ़ें"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        const GET_NOTICE_DETAILS_QUERY = `
        query GetNoticeDetails($locale : String!) {
            admissionNotices_connection(
                sort: "startDate:desc", 
                pagination: { pageSize: 20 },
                filters: { isVisible: { eq: true }, locale: { eq: $locale } }
            ) {
                nodes {
                    documentId
                    title
                    startDate
                    endDate
                    content
                    isVisible
                    links {
                        Title
                        url
                        attachment { url }
                        isVisible
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

        const fetchNoticeDetails = async () => {
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
                        query: GET_NOTICE_DETAILS_QUERY,
                        variables: { locale }
                    }),
                });

                if (!res.ok) {
                    const errorBody = await res.text();
                    console.error("GraphQL API Error Response:", errorBody);
                    throw new Error(`HTTP error! status: ${res.status}, details: ${errorBody}`);
                }

                const json = await res.json();
                if (json.errors) {
                    console.error("GraphQL Errors:", json.errors);
                    throw new Error(JSON.stringify(json.errors));
                }

                setData(json.data);
            } catch (err) {
                console.error("Error fetching notice details:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNoticeDetails();
    }, [graphqlApiUrl, strapiToken, locale]);

    const notices = data?.admissionNotices_connection?.nodes || [];

    const today = new Date();
    const filteredNotices = notices.filter(notice => {
        const endDate = new Date(notice.endDate);
        endDate.setHours(23, 59, 59, 999);
        return endDate >= today;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-700" role="status" aria-live="polite">
                <div className="animate-pulse text-center space-x-2 text-lg font-medium text-indigo-700">
                    <span>{t.loading}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-full bg-red-50 font-sans text-red-600" role="alert" aria-live="assertive">
                <div className="p-6 bg-white rounded shadow-md text-center border border-red-300">
                    <h3 className="text-xl font-semibold">{t.errorTitle}</h3>
                    <p className="text-sm mt-2">{error.message}</p>
                </div>
            </div>
        );
    }

    if (!filteredNotices.length) {
        return (
            <div className="flex items-center justify-center p-10 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-600 font-sans min-h-full" role="status" aria-live="polite">
                <div className="p-6 bg-white rounded shadow text-center">
                    <h3 className="text-xl font-semibold">{t.noNotices}</h3>
                </div>
            </div>
        );
    }

    return (
        <section className="p-2 mt-2 font-sans text-gray-800 h-[700px] overflow-y-auto" aria-labelledby="notices-list-heading">
            <h2 id="notices-list-heading" className="sr-only">Active Notices</h2>
            <div className="space-y-2 max-w-3xl mx-auto">
                {filteredNotices.map((notice) => (
                    <div
                        key={notice.documentId}
                        className="bg-white rounded-lg shadow p-2 transition hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
                        role="article"
                        aria-labelledby={`notice-title-${notice.documentId}`}
                    >
                        <h3 id={`notice-title-${notice.documentId}`} className="text-lg font-semibold text-indigo-700">{notice.title}</h3>

                        <div className="flex justify-between items-center mt-3 text-sm text-[#a54417]">
                            <a
                                href={`/${locale}/notice/${formatSlug(notice.title)}/${notice.documentId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:scale-105 inline-flex items-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                aria-label={`${t.readMore}: ${notice.title} (opens in new tab)`}
                            >
                                {t.readMore}
                                <svg
                                    className="ml-1 w-4 h-4 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-200"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                            </a>

                            <time dateTime={notice.startDate} className="text-gray-600">
                                {new Date(notice.startDate).toLocaleDateString(locale === "hi-IN" ? "hi-IN" : "en-GB")}
                            </time>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}