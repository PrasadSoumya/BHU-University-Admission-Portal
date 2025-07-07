"use client";
import { gql, useQuery } from "@apollo/client";


const GET_ANNOUNCEMENTS = gql`
  query Query {
  annouuncements_connection {
    nodes {
      Announcementmarquee {
        title
        order
        isVisible
        url
      }
    }
  }
}
`;

export default function Announcement() {
  const { data, loading, error } = useQuery(GET_ANNOUNCEMENTS);

  if (loading) {
    return (
      <div className="bg-bhuOrange text-white py-2 px-4">
        <span className="text-sm font-semibold tracking-wide">📢 Loading announcements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-700 text-white py-2 px-4">
        <span className="text-sm font-semibold tracking-wide">⚠️ Failed to load announcements.</span>
      </div>
    );
  }

  // Combine announcements into a single string (if there are many)
  const announcementText = data.annouuncements_connection.nodes
  .filter((node) => node.Announcementmarquee.isVisible) 
  .sort((a, b) => a.Announcementmarquee.order - b.Announcementmarquee.order) 
  .map((node) => node.Announcementmarquee.title) 
  .join(" | "); // Join with " | "

  return (
    <div className="bg-bhuOrange text-white py-2 px-4 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap text-sm font-semibold tracking-wide">
        {announcementText}
      </div>
    </div>
  );
}



