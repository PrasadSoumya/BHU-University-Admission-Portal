import React from 'react'
import { generateSlug } from './slug';

export default function EventCard({ item, image }) {

    return (<div key={item.documentId} className="flex rounded relative bg-white flex-col hover:scale-105 text-gray-700 shadow-white bg-clip-border">
        <a href={"/activities/" + generateSlug(item?.title) + "/" + item?.documentId} target='_blank'>
            <div
                className="relative overflow-hidden text-white bg-clip-border h-40  shadow-blue-gray-500/40">
                <div className="overflow-hidden">
                    <div className="">
                        {item?.images?.map((element) => {
                            const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
                            const imageUrl = image === "large"
                                ? element?.url
                                : element?.formats?.thumbnail?.url;


                            return (
                                <div className="" key={element?.documentId}>
                                    <img
                                        className="h-full w-full object-cover rounded"
                                        alt={item?.title}
                                        src={baseUrl + imageUrl}
                                    />
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>
            <div className="p-2 relative">
                <p className="font-sans antialiased leading-snug text-black text-xs tracking-normal text-blue-gray-900">
                    {new Date(item?.StartDate).toDateString()}
                </p>
            </div>
            <div className="p-2 relative">
                <h5 className="block font-sans text-[15px] antialiased font-bold text-gray-800 leading-snug tracking-normal text-blue-gray-900">
                    {item?.title}
                </h5>
            </div>
            <div className="p-1 mb-2 line-clamp-2 max-h-[calc(2*1.25rem)] align-bottom">
                <p className="text-[13px]" >{item?.contentPreview}</p>
            </div>
        </a>
    </div>);
}