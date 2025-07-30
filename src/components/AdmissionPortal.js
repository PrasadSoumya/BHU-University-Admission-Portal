'use client';
import { useEffect, useState } from 'react';

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
            loading: "Loading banners...",
            error: "Error loading banner data.",
            noBanners: "No banners available.",
            prevSlide: "Previous Slide",
            nextSlide: "Next Slide",
            bannerImageAlt: "Banner image for: ",
        },
        "hi-IN": {
            loading: "बैनर लोड हो रहे हैं...",
            error: "बैनर डेटा लोड करने में त्रुटि।",
            noBanners: "कोई बैनर उपलब्ध नहीं है।",
            prevSlide: "पिछली स्लाइड",
            nextSlide: "अगली स्लाइड",
            bannerImageAlt: "बैनर चित्र इसके लिए: ",
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


    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handlePrev = () => {
        console.log("Previous clicked");
        setActiveIndex(prev => (prev - 1 + banners.length) % banners.length);
    };

    const handleNext = () => {
        console.log("Next clicked");
        setActiveIndex(prev => (prev + 1) % banners.length);
    };

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
        <section class="bg-gradient-to-b from-slate-500 to-slate-600  py-4 px-4 ">
            <div class="mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">

                {banners?.map(item => {
                    return <div class="bg-white shadow-md rounded-lg p-3 text-center flex flex-col justify-center">
                        <p class="text-sm font-semibold mb-1">{item.title}</p>
                        <a href={item.buttonUrl} target='_blank' class="text-sm font-semibold text-white bg-orange-500 px-2 py-1 rounded-md cursor-pointer hover:bg-orange-600 transition duration-300 w-fit mx-auto">
                            {item.buttonText}
                        </a>
                    </div>
                })}


            </div>
        </section>
    );
}
