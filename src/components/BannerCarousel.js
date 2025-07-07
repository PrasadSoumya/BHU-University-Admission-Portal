'use client';
import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_BANNERS = gql`
  query {
    banners_connection {
      nodes {
        banner_item {
          id
          Title
          description
          buttonTitle
          buttonUrl
          Image {
            url
          }
        }
      }
    }
  }
`;

export default function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, loading, error } = useQuery(GET_BANNERS);

  const baseApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;

  const banners =
    data?.banners_connection?.nodes?.[0]?.banner_item?.map((item) => {
      let imageUrl = '';
      if (baseApiUrl && item.Image?.url) {
        try {
          imageUrl = new URL(item.Image.url, baseApiUrl).href;
        } catch (e) {
          console.error('Error constructing banner image URL:', e);
        }
      }

      return {
        id: item.id,
        title: item.Title,
        description: item.description,
        buttonText: item.buttonTitle,
        buttonUrl: item.buttonUrl,
        image: imageUrl,
      };
    }) || [];

  useEffect(() => {
    if (banners.length <= 1) return;
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
