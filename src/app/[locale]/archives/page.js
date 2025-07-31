"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const formatSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
};

export default function ArchivedNotices() {
  const params = useParams();
  const locale = params.locale;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempQuery, setTempQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const graphqlApiUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:1337/graphql";
  const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  const translations = {
    en: {
      loading: "Loading archived notices...",
      errorTitle: "Error loading data",
      noNotices: "No archived notices found",
      readMore: "Read More",
      searchPlaceholder: "Search by title...",
      searchButton: "Search",
    },
    "hi-IN": {
      loading: "पुरानी सूचनाएं लोड हो रही हैं...",
      errorTitle: "डेटा लोड करने में त्रुटि",
      noNotices: "कोई पुरानी सूचना नहीं मिली",
      readMore: "और पढ़ें",
      searchPlaceholder: "शीर्षक से खोजें...",
      searchButton: "खोजें",
    },
  };

  const t = translations[locale === "hi-IN" ? "hi-IN" : "en"];

  useEffect(() => {
    const GET_NOTICE_DETAILS_QUERY = `
      query GetNoticeDetails($locale: String!, $page: Int!, $pageSize: Int!, $search: String) {
        admissionNotices_connection(
          sort: "startDate:desc"
          pagination: { page: $page, pageSize: $pageSize }
          filters: {
            isVisible: { eq: true }
            locale: { eq: $locale }
            endDate: { lt: "${new Date().toISOString()}" }
            title: { containsi: $search }
          }
        ) {
          nodes {
            documentId
            title
            endDate
          }
          pageInfo {
            page
            pageSize
            pageCount
            total
          }
        }
      }
    `;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(graphqlApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapiToken}`,
          },
          body: JSON.stringify({
            query: GET_NOTICE_DETAILS_QUERY,
            variables: {
              locale,
              page: currentPage,
              pageSize,
              search: searchQuery,
            },
          }),
        });

        if (!res.ok) throw new Error(await res.text());

        const json = await res.json();
        if (json.errors) throw new Error(JSON.stringify(json.errors));

        const result = json.data.admissionNotices_connection;
        setData(result.nodes || []);
        setTotalPages(result.pageInfo.pageCount || 1);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [graphqlApiUrl, strapiToken, locale, currentPage, searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-700">
        <div className="animate-pulse text-center text-lg font-medium text-indigo-700">
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 font-sans text-red-600">
        <div className="p-6 bg-white rounded shadow-md text-center border border-red-300">
          <h3 className="text-xl font-semibold">{t.errorTitle}</h3>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-600 font-sans">
        <div className="flex items-center space-x-2 mb-6 max-w-2xl w-full">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={tempQuery}
            onChange={(e) => setTempQuery(e.target.value)}
            className="flex-grow px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() => {
              setSearchQuery(tempQuery);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            {t.searchButton}
          </button>
        </div>
        <div className="p-6 bg-white rounded shadow text-center">
          <h3 className="text-xl font-semibold">{t.noNotices}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-200 min-h-screen">
      <div className="mx-auto">
        {/* Search */}
        <div className="flex items-center space-x-2 mb-6 max-w-2xl w-full">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={tempQuery}
            onChange={(e) => setTempQuery(e.target.value)}
            className="flex-grow px-4 py-2 bg-white border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={() => {
              setSearchQuery(tempQuery);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            {t.searchButton}
          </button>
        </div>

        {/* Notices */}
        <div className="space-y-4">
          {data.map((notice) => (
            <div key={notice.documentId} className="bg-white p-4 rounded-lg shadow hover:shadow-md">
              <h2 className="text-lg font-semibold text-indigo-700">{notice.title}</h2>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <a
                  href={`/${locale}/notice/${formatSlug(notice.title)}/${notice.documentId}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  {t.readMore}
                </a>
                <span>{new Date(notice.endDate).toLocaleDateString("en-GB")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              } hover:bg-indigo-500 hover:text-white transition`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
