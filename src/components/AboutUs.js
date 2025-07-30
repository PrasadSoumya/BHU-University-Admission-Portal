'use client'

import React, { useState, useEffect } from 'react'

export default function AboutUs({ locale }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || '';

    const translations = {
        en: {
            loading: "Loading...",
            error: "Error:",
            aboutTitle: "About the Committee",
            leadershipTitle: "Central Admission Committee",
            noPhoto: "N/A",
        },
        "hi-IN": {
            loading: "लोड हो रहा है...",
            error: "त्रुटि:",
            aboutTitle: "समिति के बारे में",
            leadershipTitle: "केंद्रीय प्रवेश समिति",
            noPhoto: "फ़ोटो नहीं",
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        const GET_ABOUTUS_DETAILS_QUERY = `
        query GetAboutUsDetails($locale: I18NLocaleCode!) {
            aboutus(locale: $locale) {
                documentId
                content
                isVisible
                members {
                    order
                    designation
                    employee {
                        contact {
                            officialEmail
                        }
                        professional {
                            organizationUnit
                            designation
                        }
                        personal {
                            title
                            firstName
                            middleName
                            lastName
                        }
                        photo {
                            url
                        }
                    }
                }
            }
        }`;

        const fetchAboutUsDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(graphqlApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${strapiToken}`,
                    },
                    body: JSON.stringify({ query: GET_ABOUTUS_DETAILS_QUERY, variables: { locale } }),
                });

                if (!res.ok) throw new Error(await res.text());

                const json = await res.json();
                if (json.errors) throw new Error(JSON.stringify(json.errors));

                setData(json.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutUsDetails();
    }, [graphqlApiUrl, strapiToken, locale]);

    const renderMemberCard = (member) => {
        const employee = member?.employee;
        const personal = employee?.personal;
        const professional = employee?.professional;
        const contact = employee?.contact;
        const photo = employee?.photo;

        const fullName = `${personal?.title || ''} ${personal?.firstName || ''} ${personal?.middleName || ''} ${personal?.lastName || ''}`.trim();

        return (
            <div className="flex-shrink-0">
                <div className="text-center mb-2 text-lg font-semibold bg-gray-50 text-gray-700">{member.designation}</div>
                <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition">
                    <div className="flex justify-center mb-2">
                        {photo?.url ? (
                            <img
                                src={strapiBaseUrl + photo.url}
                                alt={fullName}
                                className="w-30 h-30 rounded-full object-fit border"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {t.noPhoto}
                            </div>
                        )}
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{fullName}</h4>
                    <p className="text-xs text-gray-600">{professional?.designation}</p>
                    <p className="text-xs text-gray-500">{professional?.organizationUnit}</p>
                </div>
            </div>
        );
    };

    return (
        <section className=" p-2 bg-gray-100 rounded items-center shadow min-h-[780px]">
            <div className="h-full min-w-full">
                {loading && <p className="text-gray-600">{t.loading}</p>}
                {error && <p className="text-red-600">{t.error} {error.message}</p>}

                {!loading && !error && data?.aboutus?.isVisible && (
                    <>
                        {data.aboutus.members?.length > 0 && (
                            <div className="max-w-7xl mx-auto justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
                                <h2 className="text-3xl sm:text-3xl font-extrabold text-indigo-700 text-center mb-10">
                                    {t.leadershipTitle}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {data.aboutus.members
                                        .slice()
                                        .sort((a, b) => a.order - b.order)
                                        .map((member, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white hover:shadow-lg rounded-lg transition-shadow duration-300 ease-in-out"
                                            >
                                                {renderMemberCard(member)}
                                            </div>
                                        ))}
                                </div>
                            </div>

                        )}

                        <div className="mb-6 rounded shadow bg-white p-4">
                            <h2 className="text-2xl font-bold text-indigo-600 text-center justify-center px-2">
                                {t.aboutTitle}
                            </h2>


                            <div
                                className="text-gray-800 leading-relaxed prose text-xm max-w-none"
                                dangerouslySetInnerHTML={{ __html: data?.aboutus?.content }}
                            />
                        </div>


                    </>
                )}
            </div>
        </section>
    );
}
