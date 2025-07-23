"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FaqPage() {
  const params = useParams();
  const locale = params.locale;

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  const t = {
    title: locale === "hi-IN" ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions",
    loading: locale === "hi-IN" ? "प्रश्न लोड हो रहे हैं…" : "Loading FAQs…",
    errorPrefix: locale === "hi-IN" ? "त्रुटि" : "Error",
    empty: locale === "hi-IN" ? "कोई प्रश्न उपलब्ध नहीं हैं।" : "No FAQs available."
  };

  const GET_FAQS_QUERY = `
    query GetFaqs($locale : String!) {
      admissionFaqs_connection(
        sort: "order:asc"
        filters: { isVisible: { eq: true }, locale: { eq: $locale } }
        pagination: { pageSize: 100 }
      ) {
        nodes {
          documentId
          question
          answer
          order
        }
      }
    }
  `;

  useEffect(() => {
    async function fetchFaqs() {
      try {
        setLoading(true);
        const res = await fetch(graphqlApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapiToken}`,
          },
          body: JSON.stringify({ query: GET_FAQS_QUERY, variables: { locale } }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status}: ${body}`);
        }

        const json = await res.json();
        if (json.errors) throw new Error(JSON.stringify(json.errors));

        setFaqs(json.data.admissionFaqs_connection.nodes);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, [graphqlApiUrl, strapiToken, locale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
        <p className="text-indigo-700 text-lg font-medium">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <p className="text-red-600 font-medium text-center p-6">
          {t.errorPrefix}: {error.message}
        </p>
      </div>
    );
  }

  if (!faqs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600 font-medium text-center">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 px-4 py-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">
          {t.title}
        </h1>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div key={item.documentId} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <span className="text-lg font-medium text-gray-900">{item.question}</span>
                <svg
                  className={`w-6 h-6 text-indigo-500 transform transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeIndex === index && (
                <div className="px-6 pb-5 pt-2 text-gray-700 prose max-w-none transition-opacity duration-300">
                  <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
