"use client";
import { useState, useEffect } from "react";

export default function Announcement({ locale }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;


  const translations = {
    en: {
      loading: "📢 Loading announcements...",
      error: "⚠️ Failed to load announcements.",
      noAnnouncements: "📢 No announcements available."
    },
    "hi-IN": {
      loading: "📢 घोषणाएँ लोड हो रही हैं...",
      error: "⚠️ घोषणाएँ लोड करने में विफल।",
      noAnnouncements: "📢 कोई घोषणा उपलब्ध नहीं है।"
    }
  };

  const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

  useEffect(() => {
    const GET_ANNOUNCEMENTS_QUERY = `
      query GetAnnouncements($locale: String!) {
        announcements_connection(
          filters: { isVisible: { eq: true }, locale: { eq: $locale } }
        ) {
          nodes {
            title
            order
            url
            isVisible
          }
        }
      }
    `;

    const fetchAnnouncements = async () => {
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
            query: GET_ANNOUNCEMENTS_QUERY,
            variables: { locale }
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("GraphQL API Error Response:", errorBody);
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
        }

        const json = await response.json();

        if (json.errors) {
          console.error("GraphQL Errors:", json.errors);
          throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
        }

        setData(json.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [graphqlApiUrl, locale, strapiToken]);

  if (loading) {
    return (
      <div className="bg-bhuOrange text-black py-2 px-4" role="status" aria-live="polite">
        <span className="text-sm font-semibold tracking-wide">
          {t.loading}
        </span>
      </div>
    );
  }

  if (error || !data?.announcements_connection?.nodes) {
    return (
      <div className="bg-red-700 text-white py-2 px-4" role="alert" aria-live="assertive">
        <span className="text-sm font-semibold tracking-wide">
          {t.error}
        </span>
      </div>
    );
  }

  const announcements = data.announcements_connection.nodes
    ?.filter(item => item?.isVisible)
    ?.sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="text-white bg-[#a54417] py-2 px-4 overflow-hidden" aria-label="Latest Announcements">
      <div
        className="whitespace-nowrap flex gap-8 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]"
        role="marquee"
        aria-label="Important Announcements Scrolling"
      >
        {announcements.length > 0 ? (
          <ul className="flex gap-8" aria-live="off" aria-atomic="false">
            {announcements.map((item, index) => {
              const isLast = index === announcements.length - 1;
              return (
                <li key={index} className={`${!isLast ? 'border-r-2 pr-10 border-white' : ''}`}>
                  <a
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <span
            className="text-sm font-semibold tracking-wide"
            role="status"
            tabIndex="0"
          >
            {t.noAnnouncements}
          </span>
        )}
      </div>
    </section>
  );
}