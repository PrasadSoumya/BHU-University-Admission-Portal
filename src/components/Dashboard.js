'use client'

import React from 'react';
import NoticeSection from './Notices';
import AboutUs from './AboutUs';

export default function Dashboard({ locale }) {
    const translations = {
        en: {
            notices: "📢 Notices",
            noticeArchive: "Notice Archive",
            mainContentLabel: "Main Dashboard Content",
            noticesSectionLabel: "Notices Section"
        },
        "hi-IN": {
            notices: "📢 सूचनाएं",
            noticeArchive: "सूचना संग्रह",
            mainContentLabel: "मुख्य डैशबोर्ड सामग्री",
            noticesSectionLabel: "सूचनाएं अनुभाग"
        }
    };

    const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

    return (
        <main className="bg-gradient-to-br from-slate-600 to-slate-200 p-2" aria-label={t.mainContentLabel}>
            <div className="max-w-full grid grid-cols-1 lg:grid-cols-4 gap-y-4 gap-x-2 items-stretch">
                <section className="lg:col-span-3 flex flex-col h-full" aria-labelledby="about-us-heading">
                    <h2 id="about-us-heading" className="sr-only">About Us Content</h2>
                    <div className="mx-auto flex flex-col rounded-lg">
                        <AboutUs locale={locale} />
                    </div>
                </section>

                <aside className="lg:col-span-1 flex flex-col h-full" aria-label={t.noticesSectionLabel}>
                    <div className="bg-gray-200  border border-orange-200 rounded-lg shadow p-2 h-full flex flex-col">

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-orange-600" id="notices-heading">{t.notices}</h2>
                            <a
                                href={`/${locale}/archives`}
                                target='_blank'
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                aria-label={`${t.noticeArchive} (opens in new tab)`}
                                rel="noopener noreferrer"
                            >
                                📁 {t.noticeArchive}
                            </a>
                        </div>
                        <NoticeSection locale={locale} />
                    </div>
                </aside>
            </div>
        </main>
    );
}