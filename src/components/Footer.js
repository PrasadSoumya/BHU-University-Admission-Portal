"use client";
import { useState, useEffect } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import VisitorCounter from "./VisitorCount";

export default function Footer({ locale }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:1337/graphql";
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "";

  const translations = {
    en: {
      loading: "Loading footer content...",
      error: "Error loading footer content.",
      contactUs: "Contact Us",
      location: "Location",
      address: "Central Admission Committee, Banaras Hindu University, Varanasi, Uttar Pradesh, India – 221005",
      phone: "+91-542-2368558",
      email: "admission-help@bhu.ac.in, admission@bhu.ac.in",
      copyright: "© 2025 Banaras Hindu University. All rights reserved.",
      attachment: "Attachment",
      externalLink: "External link",
      opensInNewTab: "(opens in new tab)",
      mapTitle: "Location of Central Admission Cell, Banaras Hindu University",
      copyrightPolicy: "Copyright Policy",
      hyperlinkingPolicy: "Hyperlinking Policy",
      privacyPolicy: "Privacy Policy",
      disclaimer: "Disclaimer",
      termsOfUse: "Terms & Conditions",
      help: "Help",
    },
    "hi-IN": {
      loading: "फ़ूटर सामग्री लोड हो रही है...",
      error: "फ़ूटर सामग्री लोड करने में त्रुटि।",
      contactUs: "हमसे संपर्क करें",
      location: "स्थान",
      address: "केंद्रीय प्रवेश समिति, काशी हिंदू विश्वविद्यालय, वाराणसी, उत्तर प्रदेश, भारत – 221005",
      phone: "+91-542-2368558",
      email: "admission-help@bhu.ac.in, admission@bhu.ac.in",
      copyright: "© 2025 काशी हिंदू विश्वविद्यालय। सर्वाधिकार सुरक्षित।",
      attachment: "अनुलग्नक",
      externalLink: "बाहरी लिंक",
      opensInNewTab: "(नए टैब में खुलता है)",
      mapTitle: "केंद्रीय प्रवेश प्रकोष्ठ, काशी हिंदू विश्वविद्यालय का स्थान",
      copyrightPolicy: "कॉपीराइट नीति",
      hyperlinkingPolicy: "हाइपरलिंकिंग नीति",
      privacyPolicy: "गोपनीयता नीति",
      disclaimer: "अस्वीकरण",
      termsOfUse: "नियम एवं शर्तें",
      help: "सहायता",
    }
  };

  const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

  useEffect(() => {
    const GET_FOOTER_QUERY = `
      query GetFooters($locale: String!) {
        admissionFooters_connection(
          filters: { isVisible: { eq: true }, locale: { eq: $locale } }
        ) {
          nodes {
            documentId
            category
            order
            links {
              Title
              url
              order
              attachment {
                url
              }
              enums
              isVisible
            }
            isVisible
          }
        }
      }
    `;

    const fetchFooters = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(graphqlApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + strapiToken,
          },
          body: JSON.stringify({
            query: GET_FOOTER_QUERY,
            variables: { locale },
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorBody}`);
        }

        const json = await response.json();
        if (json.errors) throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
        setData(json.data);
      } catch (err) {
        console.error("Error fetching footers:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFooters();
  }, [graphqlApiUrl, locale, strapiToken]);

  return (
    <footer className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-gray-200 px-6 py-12 shadow-inner border-t border-slate-600" role="contentinfo" aria-label="Site Footer">
      <div className=" mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {loading && (
            <div className="col-span-full text-center py-4" role="status" aria-live="polite">
              <p className="text-gray-400">{t.loading}</p>
            </div>
          )}
          {error && (
            <div className="col-span-full text-center py-4" role="alert" aria-live="assertive">
              <p className="text-red-400">{t.error}</p>
            </div>
          )}

          {!loading && !error && data?.admissionFooters_connection?.nodes && (
            <>
              {data.admissionFooters_connection.nodes
                ?.filter(node => node.isVisible && node.links?.some(link => link.isVisible))
                ?.sort((a, b) => a.order - b.order)
                ?.map((categoryItem, index) => (
                  <nav key={index} aria-labelledby={`footer-category-${index}`}>
                    <h3 id={`footer-category-${index}`} className="text-white font-semibold text-lg mb-4 border-b border-slate-500 pb-1 tracking-wide uppercase">
                      {categoryItem.category || "Links"}
                    </h3>
                    <ul className="space-y-2">
                      {categoryItem.links
                        .filter(link => link.isVisible)
                        .sort((a, b) => a.order - b.order)
                        .map((link, linkIndex) => {
                          const href = link.enums === "attachment"
                            ? (strapiBaseUrl || "") + (link.attachment?.url || "")
                            : link.url || "#";
                          const isExternal = link.enums === "external" || link.enums === "attachment";

                          return (
                            <li key={linkIndex}>
                              <a
                                href={href}
                                target={isExternal ? "_blank" : "_self"}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group text-sm flex items-center space-x-2 hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
                                aria-label={`${link.Title || "Link"} ${isExternal ? t.opensInNewTab : ''}`}
                              >
                                {isExternal && (
                                  <svg
                                    className="w-4 h-4 text-indigo-400 group-hover:text-indigo-500 transition"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                )}
                                <span>{link.Title}</span>
                                {link.enums === "attachment" && (
                                  <span className="ml-2 px-2 py-0.5 bg-indigo-200 text-indigo-800 text-xs font-semibold rounded">
                                    {t.attachment}
                                  </span>
                                )}
                              </a>
                            </li>
                          );
                        })}
                    </ul>
                  </nav>
                ))}

              <div className="lg:col-span-2 flex flex-col md:flex-row justify-between gap-6">
                <div className="md:flex-1">
                  <h3 className="text-white font-semibold text-lg mb-4 border-b border-slate-500 pb-1 uppercase tracking-wide">
                    {t.contactUs}
                  </h3>
                  <address className="not-italic space-y-4 text-sm text-slate-300 leading-relaxed">
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-indigo-400 mt-1" />
                      <span>{t.address}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaPhoneAlt className="text-indigo-400 mt-1" />
                      <a href={`tel:${t.phone}`} className="hover:text-indigo-400 transition">{t.phone}</a>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaEnvelope className="text-indigo-400 mt-1" />
                      <a href={`mailto:${t.email}`} className="hover:text-indigo-400 transition">{t.email}</a>
                    </div>
                  </address>
                </div>

                <div className="md:flex-none w-full md:w-[320px]">
                  <h3 className="text-white font-semibold text-lg mb-4 border-b border-slate-500 pb-1 uppercase tracking-wide">
                    {t.location}
                  </h3>
                  <div className="rounded-lg overflow-hidden shadow-lg backdrop-blur-sm border border-slate-500">
                    <iframe
                      className="w-full h-32"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.1777879514166!2d82.9925116!3d25.2646041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e3180c35aa449%3A0xc58ce99f4cf2c162!2sCentral%20Office!5e0!3m2!1sen!2sin!4v1752827690831!5m2!1sen!2sin"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={t.mapTitle}
                      style={{ border: 0 }}
                    ></iframe>
                  </div>
                </div>
              </div>


            </>
          )}
        </div>

        <div className="border-t border-slate-600 mt-8 text-xs  flex flex-col md:flex-row justify-between items-center">
          <p className="text-center md:text-left">{t.copyright}</p>
          <div className="lg:col-span-4">
            <nav aria-label="Footer Policy Links">
              <ul className="flex flex-wrap justify-center gap-2 text-xs">
                {[
                  { href: `/${locale}/copyright-policy`, label: t.copyrightPolicy },
                  { href: `/${locale}/hyperlinking-policy`, label: t.hyperlinkingPolicy },
                  { href: `/${locale}/terms-conditions`, label: t.termsOfUse },
                  { href: `/${locale}/privacy-policy`, label: t.privacyPolicy },
                  { href: `/${locale}/disclaimer`, label: t.disclaimer },
                  { href: `/${locale}/help`, label: t.help },
                ].map(({ href, label }, i) => (
                  <li key={i}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-indigo-700 text-white hover:text-white px-3 py-1 rounded-full transition text-xm font-medium"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="text-center md:text-right">
            <VisitorCounter />
          </div>
        </div>
      </div>
    </footer>
  );
}
