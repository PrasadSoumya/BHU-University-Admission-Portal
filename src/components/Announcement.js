"use client";
import { useState, useEffect } from "react";

export default function Announcement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';

  useEffect(() => {
    const GET_ANNOUNCEMENTS_QUERY = `
      query {
        announcements_connection {
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
          },
          body: JSON.stringify({
            query: GET_ANNOUNCEMENTS_QUERY,
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

        setData(json.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [graphqlApiUrl]);

  if (loading) {
    return (
      <div className="bg-bhuOrange text-black py-2 px-4">
        <span className="text-sm font-semibold tracking-wide">
          📢 Loading announcements...
        </span>
      </div>
    );
  }

  if (error || !data?.announcements_connection?.nodes) {
    return (
      <div className="bg-red-700 text-black py-2 px-4">
        <span className="text-sm font-semibold tracking-wide">
          ⚠️ Failed to load announcements.
        </span>
      </div>
    );
  }

  const announcements = data.announcements_connection.nodes
    ?.filter((item) => item?.isVisible)
    ?.sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order, handling undefined

  return (
    <div className="text-white bg-[#FF6F00] py-2 px-4 overflow-hidden">
      <div className="whitespace-nowrap flex gap-8 animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {announcements.length > 0 ? (
          announcements.map((item, index) => (
            <a
              key={index}
              href={item.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-sm font-semibold tracking-wide border-r-2 pr-10"
            >
              {item.title}
            </a>
          ))
        ) : (
          <span>📢 No announcements available.</span>
        )}
      </div>
    </div>
  );
}