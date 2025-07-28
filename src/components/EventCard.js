import React from 'react'
import { generateSlug } from './slug';

export default function EventCard({ item, image }) {

    return (<div
        key={item.documentId}
        className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition duration-300 ease-in-out"
    >
        <a
            href={
                process.env.NEXT_PUBLIC_NEWS_PORTAL +
                "/activities/" +
                generateSlug(item?.title) +
                "/" +
                item?.documentId
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative aspect-[16/9] overflow-hidden">
                {item?.images?.map((element) => {
                    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
                    const imageUrl =
                        image === "large"
                            ? element?.url
                            : element?.formats?.thumbnail?.url;

                    return (
                        <img
                            key={element?.documentId}
                            src={baseUrl + imageUrl}
                            alt={item?.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    );
                })}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col justify-between flex-grow">
                <p className="text-xs text-gray-500 mb-1">
                    {new Date(item?.StartDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </p>

                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                    {item?.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2">
                    {item?.contentPreview}
                </p>
            </div>
        </a>
    </div>
    );
}