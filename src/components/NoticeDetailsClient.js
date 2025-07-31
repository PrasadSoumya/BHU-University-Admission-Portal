// src/app/[locale]/notice/[...slug]/NoticeDetailsClient.js

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

function capitalizeAndJoin(str) {
    if (!str) return '';
    return str.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function NoticeDetails() {
    const params = useParams();
    const locale = params.locale;

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const t = {
        loading: locale === "hi-IN" ? "सूचना विवरण लोड हो रहे हैं..." : "Loading notice details...",
        errorTitle: locale === "hi-IN" ? "सूचना लोड करने में त्रुटि:" : "Error loading notice:",
        notFoundTitle: locale === "hi-IN" ? "सूचना नहीं मिली" : "Notice not found",
        notFoundMessage: (id) =>
            locale === "hi-IN"
                ? `ID "${id}" वाली सूचना नहीं मिली।`
                : `The notice with ID "${id}" could not be found.`,
        published: locale === "hi-IN" ? "प्रकाशित:" : "Published:",
        expires: locale === "hi-IN" ? "समाप्ति:" : "Expires:",
        relevantLinks: locale === "hi-IN" ? "संबंधित लिंक:" : "Relevant Links:",
        backToNotices: locale === "hi-IN" ? "सूचनाओं पर वापस जाएं" : "Back to Notices",
        attachmentLabel: locale === "hi-IN" ? "अनुलग्नक" : "Attachment",
    };

    useEffect(() => {
        const { slug } = params;

        if (!slug || slug.length < 2) {
            setLoading(false);
            setError(new Error(locale === "hi-IN" ? "अमान्य URL पैरामीटर।" : "Invalid URL parameters for notice details."));
            return;
        }

        const documentID = slug[1];
        if (!documentID) {
            setLoading(false);
            setError(new Error(locale === "hi-IN" ? "URL में कोई दस्तावेज़ ID नहीं है।" : "No document ID provided in URL."));
            return;
        }

        const GET_SINGLE_NOTICE_QUERY = `
          query GetSingleNotice($documentId: ID!, $locale : String!) {
            admissionNotices_connection(filters: { documentId: { eq: $documentId }, locale : {eq : $locale} },pagination: { limit: 1000 }) {
              nodes {
                documentId
                title
                startDate
                endDate
                content
                links {
                  Title
                  url
                  attachment { url }
                  isVisible
                  enums
                }
              }
            }
          }
        `;

        const fetchNoticeDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(graphqlApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${strapiToken}`,
                    },
                    body: JSON.stringify({
                        query: GET_SINGLE_NOTICE_QUERY,
                        variables: { documentId: documentID, locale },
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

                const fetchedNotice = json.data?.admissionNotices_connection?.nodes[0];
                setNotice(fetchedNotice);

            } catch (err) {
                console.error("Error fetching notice details:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNoticeDetail();
    }, [params, graphqlApiUrl, strapiToken, locale]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-700">
                <div className="animate-pulse text-center space-x-2 text-lg font-medium text-indigo-700">
                    <span>{t.loading}</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 font-sans text-red-600">
                <div className="p-6 bg-white rounded shadow-md text-center border border-red-300">
                    <h3 className="text-xl font-semibold">{t.errorTitle}</h3>
                    <p className="text-sm mt-2">{error.message}</p>
                </div>
            </div>
        );
    }

    const currentDocumentID = params?.slug ? capitalizeAndJoin(params.slug[0]) : 'N/A';

    if (!notice) {
        return (
            <div className="flex items-center justify-center p-10 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-600">
                <div className="p-6 bg-white rounded shadow text-center">
                    <h3 className="text-xl font-semibold">{t.notFoundTitle}</h3>
                    <p className="text-sm mt-2">{t.notFoundMessage(currentDocumentID)}</p>
                </div>
            </div>
        );
    }

    const dateLocale = locale === "hi-IN" ? "hi-IN" : "en-GB";

    return (
        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 flex justify-center ">
            <div className="max-w-7xl w-full bg-white rounded-xl shadow-2xl p-8">
                <h1 className="text-2xl font-extrabold text-indigo-800 mb-4">{notice.title}</h1>

                <div className="text-sm text-gray-600 mb-6 flex justify-between items-center flex-wrap">
                    <div className="flex-1">
                        <span className="flex items-center text-green-700 font-medium">
                            {/* Published Icon */}
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {t.published} {new Date(notice.startDate).toLocaleDateString(dateLocale)}
                        </span>
                    </div>
                    {notice.endDate && (
                        <div className="flex-1 text-right">
                            <span className="flex justify-end items-center text-red-600 font-medium">
                                {/* Expires Icon */}
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                {t.expires} {new Date(notice.endDate).toLocaleDateString(dateLocale)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="prose max-w-none text-gray-700 leading-relaxed mb-8">
                    <div dangerouslySetInnerHTML={{ __html: notice.content }}></div>
                </div>

                {notice.links && notice.links.filter(link => link.isVisible).length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-indigo-700 mb-4">{t.relevantLinks}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notice.links.filter(link => link.isVisible).map((link, index) => {
                                const href = link.enums === 'attachment'
                                    ? (process.env.NEXT_PUBLIC_STRAPI_API_URL || '') + (link.attachment?.url || '')
                                    : link.url || '#';
                                const isExternal = link.enums === 'external' || link.enums === 'attachment';

                                return (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                                        <a
                                            href={href}
                                            target={isExternal ? "_blank" : "_self"}
                                            rel={isExternal ? "noopener noreferrer" : ""}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                        >
                                            {isExternal && (
                                                <svg
                                                    className="mr-2 w-5 h-5 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                </svg>
                                            )}
                                            <span className="flex-grow">{link.Title || "Link"}</span>
                                            {link.enums === 'attachment' && (
                                                <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">{t.attachmentLabel}</span>
                                            )}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex flex-col  items-center h-full">
                    <button
                        onClick={() => router.push("/")}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        {t.backToNotices}
                    </button>
                </div>

            </div>
        </div>
    );
}
