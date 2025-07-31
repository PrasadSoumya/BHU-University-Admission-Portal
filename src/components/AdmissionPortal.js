'use client';
import { useEffect, useState } from 'react';
import NoticeSection from './Notices';

export default function AdmissionPortal({ locale = 'en' }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const baseAssetUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const translations = {
        en: {
            loading: "Loading portal information...",
            error: "Error loading portal content.",
            noBanners: "No portal items available.",
            prevSlide: "Previous",
            nextSlide: "Next",
            bannerImageAlt: "Portal item image for: ",
            notices: "📢 Notices",
            noticeArchive: "Notice Archive",
            mainContentLabel: "Main Dashboard Content",
            noticesSectionLabel: "Notices Section"
        },
        "hi-IN": {
            loading: "पोर्टल जानकारी लोड हो रही है...",
            error: "पोर्टल सामग्री लोड करने में त्रुटि।",
            noBanners: "कोई पोर्टल जानकारी उपलब्ध नहीं है।",
            prevSlide: "पिछला",
            nextSlide: "अगला",
            bannerImageAlt: "पोर्टल आइटम के लिए चित्र: ",
            notices: "📢 सूचनाएं",
            noticeArchive: "सूचना संग्रह",
            mainContentLabel: "मुख्य डैशबोर्ड सामग्री",
            noticesSectionLabel: "सूचनाएं अनुभाग"

        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    useEffect(() => {
        const GET_BANNERS_QUERY = `
      query Query($locale: String!) {
        banners_connection(
          filters: { isActive: { eq: true }, locale: { eq: $locale } }
        ) {
          nodes {
            title
            description
            order
            image {
              url
              formats
            }
            buttonTitle
            buttonUrl
            isActive
          }
        }
      }
    `;

        const fetchBanners = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(baseApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${strapiToken}`,
                    },
                    body: JSON.stringify({ query: GET_BANNERS_QUERY, variables: { locale } }),
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("GraphQL API Error Response:", errorBody);
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
                }

                const json = await response.json();
                console.log("GraphQL response:", json);

                if (json.errors) {
                    console.error("GraphQL Errors:", json.errors);
                    throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
                }

                setData(json.data);
            } catch (err) {
                console.error("Error fetching banners:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        console.log("Current locale:", locale);
        fetchBanners();
    }, [baseApiUrl, locale, strapiToken]);

    const banners = data?.banners_connection?.nodes
        ?.filter(item => item.isActive)
        ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Sort based on 'order'
        ?.map((item, index) => {
            let imageUrl = "";
            if (baseAssetUrl && item.image?.url) {
                try {
                    imageUrl = new URL(item.image.url, baseAssetUrl).href;
                } catch (e) {
                    console.error("Error constructing banner image URL:", e);
                }
            }

            return {
                id: index,
                title: item.title,
                description: item.description,
                buttonText: item.buttonTitle,
                buttonUrl: item.buttonUrl,
                image: {
                    original: item.image?.url ? new URL(item.image.url, baseAssetUrl).href : '',
                    large: item.image?.formats?.large?.url ? new URL(item.image.formats.large.url, baseAssetUrl).href : '',
                    medium: item.image?.formats?.medium?.url ? new URL(item.image.formats.medium.url, baseAssetUrl).href : '',
                    small: item.image?.formats?.small?.url ? new URL(item.image.formats.small.url, baseAssetUrl).href : '',
                    thumbnail: item.image?.formats?.thumbnail?.url ? new URL(item.image.formats.thumbnail.url, baseAssetUrl).href : '',
                    xsmall: item.image?.formats?.xsmall?.url ? new URL(item.image.formats.xsmall.url, baseAssetUrl).href : '',
                },
            };
        }) || [];






    if (loading) {
        return (
            <section className="w-full h-[60vh] flex items-center justify-center bg-gray-100" role="status" aria-live="polite">
                <p className="text-gray-600 text-lg">{t.loading}</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full h-[60vh] flex items-center justify-center bg-red-100" role="alert" aria-live="assertive">
                <p className="text-red-700 text-lg">{t.error}</p>
            </section>
        );
    }

    if (banners.length === 0) {
        return (
            <section className="w-full h-[60vh] flex items-center justify-center bg-gray-200" role="status" aria-live="polite">
                <p className="text-gray-600 text-lg">{t.noBanners}</p>
            </section>
        );
    }

    return (
        <section className="bg-gradient-to-b from-slate-500 to-slate-600 py-2 px-2">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left: Banner Grid */}
                <div className="w-full lg:w-2/3">
                    <div className=" overflow-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2">
                            {banners?.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center justify-between text-center h-36 transition-transform transform hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <p className="text-base font-semibold text-gray-800 mb-3">{item.title}</p>
                                    <div className="mt-auto">
                                        <a
                                            href={item.buttonUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition duration-300"
                                        >
                                            {item.buttonText}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Notice Section */}
                <aside
                    className="w-full lg:w-1/3 h-[600px] flex flex-col"
                    aria-label={t.noticesSectionLabel}
                >
                    <div className="bg-gray-200 border border-orange-200 rounded-lg shadow p-2 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-orange-600" id="notices-heading">
                                {t.notices}
                            </h2>
                            <a
                                href={`/${locale}/archives`}
                                target="_blank"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                aria-label={`${t.noticeArchive} (opens in new tab)`}
                                rel="noopener noreferrer"
                            >
                                📁 {t.noticeArchive}
                            </a>
                        </div>
                        <NoticeSection locale={locale} />
                    </div>
                </aside>
            </div>
        </section>

    );
}
