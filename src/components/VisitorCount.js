'use client'

import React, { useEffect, useState } from 'react';

export default function VisitorCounter() {

    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchVisitorCount = async () => {
            try {
                const res = await fetch("/api/visitor", {
                    method: 'POST',
                    cache: 'no-store',
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setCount(data?.count ?? 0);
            } catch (error) {
                console.error("Error fetching visitor count:", error); 
            }
        };

        fetchVisitorCount();

    }, []); 

    return (
        <>
           
            {count > 0 && (
                <div className=" text-white px-3 py-2  text-xs  flex items-center gap-2">
                    <span className="font-semibold tracking-wide">Visitor No.:</span>
                    <span className="text-emerald-400 font-bold">{count}</span>
                </div>
            )}
        </>
    );
}