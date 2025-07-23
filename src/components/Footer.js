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

  const graphqlApiUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:1337/graphql";
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "";

  const translations = {
    en: {
      loading: "Loading footer content...",
      error: "Error loading footer content.",
      contactUs: "Contact Us",
      location: "Location",
      address: "Central Admission Cell, Banaras Hindu University, Varanasi, Uttar Pradesh, India – 221005",
      phone: "+91-542-2368558",
      email: "admission-help@bhu.ac.in",
      copyright: "© 2025 Banaras Hindu University. All rights reserved.",
      attachment: "Attachment",
      externalLink: "External link",
      opensInNewTab: "(opens in new tab)",
      mapTitle: "Location of Central Admission Cell, Banaras Hindu University"
    },
    "hi-IN": {
      loading: "फ़ूटर सामग्री लोड हो रही है...",
      error: "फ़ूटर सामग्री लोड करने में त्रुटि।",
      contactUs: "हमसे संपर्क करें",
      location: "स्थान",
      address: "केंद्रीय प्रवेश प्रकोष्ठ, काशी हिंदू विश्वविद्यालय, वाराणसी, उत्तर प्रदेश, भारत – 221005",
      phone: "+91-542-2368558",
      email: "admission-help@bhu.ac.in",
      copyright: "© 2025 काशी हिंदू विश्वविद्यालय। सर्वाधिकार सुरक्षित।",
      attachment: "अनुलग्नक",
      externalLink: "बाहरी लिंक",
      opensInNewTab: "(नए टैब में खुलता है)",
      mapTitle: "केंद्रीय प्रवेश प्रकोष्ठ, काशी हिंदू विश्वविद्यालय का स्थान"
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
          console.error("GraphQL API Error Response:", errorBody);
          throw new Error(
            `HTTP error! status: ${response.status}, details: ${errorBody}`
          );
        }

        const json = await response.json();

        if (json.errors) {
          console.error("GraphQL Errors:", json.errors);
          throw new Error(`GraphQL Errors: ${JSON.stringify(json.errors)}`);
        }

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
    <footer className="bg-slate-700 text-gray-300 px-6 py-10" role="contentinfo" aria-label="Site Footer">
      <div className="max-w-full mx-auto">
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
                ?.filter(
                  (node) =>
                    node.isVisible && node.links?.some((link) => link.isVisible)
                )
                ?.sort((a, b) => a.order - b.order)
                ?.map((categoryItem, index) => (
                  <nav key={index} aria-labelledby={`footer-category-${index}`}>
                    <h3 id={`footer-category-${index}`} className="text-white font-semibold text-lg mb-4">
                      {categoryItem.category || "Links"}
                    </h3>
                    <ul className="space-y-2">
                      {categoryItem.links
                        .filter((link) => link.isVisible)
                        .sort((a, b) => a.order - b.order)
                        .map((link, linkIndex) => {
                          const href =
                            link.enums === "attachment"
                              ? (strapiBaseUrl || "") +
                              (link.attachment?.url || "")
                              : link.url || "#";
                          const isExternal =
                            link.enums === "external" || link.enums === "attachment";
                          const linkLabel = `${link.Title || "Link"} ${isExternal ? t.opensInNewTab : ''}`;

                          return (
                            <li key={linkIndex}>
                              <a
                                href={href}
                                target={isExternal ? "_blank" : "_self"}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="hover:text-white transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                aria-label={linkLabel}
                              >
                                {isExternal && (
                                  <svg
                                    className="w-4 h-4 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    focusable="false"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                )}
                                <span>{link.Title || "Link"}</span>
                                {link.enums === "attachment" && (
                                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full" aria-label={t.attachment}>
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
                  <h3 className="text-white font-semibold text-lg mb-4">
                    {t.contactUs}
                  </h3>
                  <address className="not-italic space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-indigo-400 mt-1 flex-shrink-0" aria-hidden="true" />
                      <span>
                        {t.address}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaPhoneAlt className="text-indigo-400 mt-1 flex-shrink-0" aria-hidden="true" />
                      <a href={`tel:${t.phone}`} className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" aria-label={`Call us at ${t.phone}`}>
                        {t.phone}
                      </a>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaEnvelope className="text-indigo-400 mt-1 flex-shrink-0" aria-hidden="true" />
                      <a href={`mailto:${t.email}`} className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" aria-label={`Email us at ${t.email}`}>
                        {t.email}
                      </a>
                    </div>
                  </address>
                </div>

                <div className="md:flex-none w-full md:w-[320px]">
                  <h3 className="text-white font-semibold text-lg mb-4">
                    {t.location}
                  </h3>
                  <div className="w-full h-48 rounded-md overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.1777879514166!2d82.99251161258324!3d25.264604077574457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e3180c35aa449%3A0xc58ce99f4cf2c162!2sCentral%20Office!5e0!3m2!1sen!2sin!4v1752827690831!5m2!1sen!2sin"
                      width="600"
                      height="450"
                      style={{ border: '0px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-white pt-6 text-xs text-white flex justify-between items-center">
          <div className="text-center flex-1">
            <p>{t.copyright}</p>
          </div>
          <div className="flex-shrink-0">
            <VisitorCounter />
          </div>
        </div>
      </div>
    </footer>
  );
}