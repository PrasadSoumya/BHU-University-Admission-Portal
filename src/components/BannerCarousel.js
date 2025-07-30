'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // ✅ Use Next.js Image

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default function BannerCarousel({ locale = 'en' }) {
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
            order
            image {
              url
              formats
            }                        
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

  const activeSlide = banners[activeIndex];

  return (
    <section
      className="relative w-full z-30 h-[200px] sm:h-[240px] md:h-[300px] lg:h-[320px] xl:h-[360px] overflow-hidden"
      role="region"
      aria-label="Image Carousel"
    >
      <div
        className="relative w-full h-full"
        role="group"
        aria-roledescription="carousel"
        aria-label="Dynamic Banners"
      >
        <div className="relative w-full h-full">
          <Image
            src={activeSlide.image.original}
            alt={`${t.bannerImageAlt} ${activeSlide.title || ''}`}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-opacity duration-700 ease-in-out"
          />
          <div className="absolute inset-0  bg-opacity-30 z-10" />
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 z-20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={t.prevSlide}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 z-20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={t.nextSlide}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full ${activeIndex === index ? 'bg-white' : 'bg-gray-400'} hover:bg-white transition-colors`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={activeIndex === index ? 'true' : 'false'}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
