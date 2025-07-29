'use client';
import { useEffect, useState } from 'react';

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

  console.log("Mapped banners:", banners);

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
      className="relative w-full h-[40vh] sm:h-[35vh] md:h-[45vh] lg:h-[50vh] xl:h-[50vh] overflow-hidden z-0" role="region"
      aria-label="Image Carousel"
    >
      <div
        className="relative w-full h-full"
        role="group"
        aria-roledescription="carousel"
        aria-label="Dynamic Banners"
      >
        <div
          className="absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out"
          aria-live="polite"
          aria-atomic="true"
        >
          <picture>
            <source media="(min-width: 1024px)" srcSet={activeSlide.image.original} />
            <source media="(min-width: 640px)" srcSet={activeSlide.image.medium || activeSlide.image.large || activeSlide.image.original} />
            <source media="(min-width: 480px)" srcSet={activeSlide.image.small || activeSlide.image.medium || activeSlide.image.large || activeSlide.image.original} />
            <source media="(max-width: 479px)" srcSet={activeSlide.image.xsmall || activeSlide.image.thumbnail || activeSlide.image.small || activeSlide.image.medium || activeSlide.image.large || activeSlide.image.original} />
            <img
              src={activeSlide.image.original}
              alt={`${t.bannerImageAlt} ${activeSlide.title}`}
              className="absolute top-0 left-0 w-full h-full object-cover z-10"
              aria-current="true"
              loading="eager"
            />
          </picture>
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-15 pointer-events-none"></div>

          <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4 animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">{activeSlide.title}</h1>
            <p className="text-lg md:text-xl mb-6">{activeSlide.description}</p>
            {activeSlide.buttonUrl && activeSlide.buttonText && (
              <a
                href={activeSlide.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#a54417] hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                aria-label={`${activeSlide.buttonText} (opens in new tab)`}
              >
                {activeSlide.buttonText}
              </a>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 z-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={t.prevSlide}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 z-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label={t.nextSlide}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full ${activeIndex === index ? 'bg-white' : 'bg-gray-400'} hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white`}
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
