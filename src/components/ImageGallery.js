"use client";

import { useState, useEffect } from "react";
import EventCard from "./EventCard";

export default function RecentEvent({ locale }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:1337/graphql";
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  const translations = {
    en: {
      loading: "🔄 Loading events...",
      error: "⚠️ Failed to load events.",
      noEvents: "📅 No events available.",
      activities: "Activities",
      viewMore: "View More",
    },
    "hi-IN": {
      loading: "🔄 घटनाएँ लोड हो रही हैं...",
      error: "⚠️ घटनाएँ लोड करने में विफल।",
      noEvents: "📅 कोई घटना उपलब्ध नहीं है।",
      activities: "गतिविधियाँ",
      viewMore: "और देखें",
    },
  };

  const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

  const GET_EVENTS_QUERY = `
    query GetRecentEvents {
      events_connection(sort: "StartDate:DESC", pagination: { limit: 15 }) {
        nodes {
          documentId
          title
          StartDate
          EndDate
          isImportant
          contentPreview
          isHomepage
          content
          slug
          images {
            documentId
            url
            formats
          }
        }
      }
    }
  `;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(graphqlApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapiToken}`,
          },
          body: JSON.stringify({ query: GET_EVENTS_QUERY }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! ${response.status}: ${errorBody}`);
        }

        const json = await response.json();
        if (json.errors) {
          throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
        }

        setEvents(json.data?.events_connection?.nodes || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [graphqlApiUrl, strapiToken]);

  if (loading) {
    return (
      <div className="py-6 px-4 text-center text-white bg-slate-700" role="status" aria-live="polite">
        {t.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 text-center bg-red-700 text-white" role="alert" aria-live="assertive">
        {t.error}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="py-6 px-4 text-center text-white bg-slate-600" role="status" tabIndex={0}>
        {t.noEvents}
      </div>
    );
  }

  return (
    <section
      className="px-4 py-10 sm:px-8 lg:px-12 bg-gradient-to-b from-slate-500 to-slate-700 text-white"
      aria-label={t.activities}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-white pb-2 mb-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-wide uppercase">
          {t.activities}
        </h2>
        <a
          href={process.env.NEXT_PUBLIC_NEWS_PORTAL + "/activities"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 text-white border-2 border-white hover:border-white hover:bg-white/10 hover:text-white transition-all duration-200 px-5 py-2.5 rounded-lg text-sm font-medium backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          {t.viewMore}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {events.map((item) => (
          <EventCard key={item.documentId} item={item} image="thumbnail" />
        ))}
      </div>
    </section>

  );
}
