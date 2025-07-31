'use client'

import React from 'react';

import AboutUs from './AboutUs';

export default function Dashboard({ locale }) {
    const translations = {
        en: {
            mainContentLabel: "Main Dashboard Content",
        },
        "hi-IN": {
            mainContentLabel: "मुख्य डैशबोर्ड सामग्री",
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    return (
        <main className="bg-gradient-to-b from-slate-800 to-slate-900 p-2" aria-label={t.mainContentLabel}>
            <div className="max-w-full grid grid-cols-1 lg:grid-cols-4 gap-y-4 gap-x-2 items-stretch">
                <section className="lg:col-span-4 flex flex-col h-full" aria-labelledby="about-us-heading">
                    <h2 id="about-us-heading" className="sr-only">About Us Content</h2>
                    <div className="mx-auto flex flex-col rounded-lg">
                        <AboutUs locale={locale} />
                    </div>
                </section>

                
            </div>
        </main>
    );
}