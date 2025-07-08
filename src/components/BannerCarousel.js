'use client';
import { useEffect, useState } from 'react';

export default function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
  const baseAssetUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'; // For constructing full image URLs

  useEffect(() => {
    const GET_BANNERS_QUERY = `
      query Query {
        banners_connection {
          nodes {
            title
            description
            order
            image {
              url
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
          },
          body: JSON.stringify({
            query: GET_BANNERS_QUERY,
          }),
          // For client-side fetch, next: { revalidate } is not applicable directly here
          // This would be for server-side fetch in Next.js Server Components
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
        }

        const json = await response.json();

        if (json.errors) {
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
  }, [baseApiUrl]); // Re-run if baseApiUrl changes (though typically it's static)

  const banners = data?.banners_connection?.nodes
    ?.filter((item) => item.isActive)
    ?.map((item) => {
      let imageUrl = "";
      if (baseAssetUrl && item.image?.url) {
        try {
          // Construct full URL using the baseAssetUrl (your Strapi instance base URL)
          // Strapi often returns /uploads/image.png, so we prepend the base URL
          imageUrl = new URL(item.image.url, baseAssetUrl).href;
        } catch (e) {
          console.error("Error constructing banner image URL:", e);
        }
      }

      return {
        id: item.id, // Assuming 'id' exists in your Strapi data
        title: item.title,
        description: item.description,
        buttonText: item.buttonTitle,
        buttonUrl: item.buttonUrl,
        image: imageUrl,
      };
    }) || [];

  useEffect(() => {
    if (banners.length <= 1) return; // No need for carousel if 0 or 1 banner
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <section className="w-full h-[60vh] flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading banners...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full h-[60vh] flex items-center justify-center bg-red-100">
        <p className="text-red-700 text-lg">Error loading banner data</p>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="w-full h-[60vh] flex items-center justify-center bg-gray-200">
        <p className="text-gray-600 text-lg">No banners available.</p>
      </section>
    );
  }

  const activeSlide = banners[activeIndex];

  return (
    <section className="relative w-full h-[60vh] overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-10 animate-fade-in"
        style={{
          backgroundImage: activeSlide?.image
            ? `url(${activeSlide.image})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {activeSlide.title}
          </h1>
          <p className="text-lg md:text-xl mb-6">{activeSlide.description}</p>
          <a
            href={activeSlide.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-xl transition duration-300"
          >
            {activeSlide.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}