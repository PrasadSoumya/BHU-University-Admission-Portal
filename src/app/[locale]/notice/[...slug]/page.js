
import NoticeDetailsClient from "@/components/NoticeDetailsClient";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function generateMetadata({ params }) {
    const locale = (await params).locale;
    const slug = (await params).slug;

    if (!slug || slug.length < 2) {
        return {
            title: locale === "hi-IN" ? "अमान्य सूचना" : "Invalid Notice",
            description: locale === "hi-IN" ? "अमान्य URL पैरामीटर।" : "Invalid URL parameters.",
        };
    }

    const documentID = slug[1];

    const graphqlApiUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:1337/graphql';
    const strapiToken = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

    const query = `
    query GetSingleNotice($documentId: ID!, $locale: String!) {
      admissionNotices_connection(filters: { documentId: { eq: $documentId }, locale: { eq: $locale } }) {
        nodes {
          title
          content
        }
      }
    }
  `;

    try {
        const res = await fetch(graphqlApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${strapiToken}`,
            },
            body: JSON.stringify({
                query,
                variables: { documentId: documentID, locale },
            }),
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch metadata");
        }

        const json = await res.json();
        const notice = json.data?.admissionNotices_connection?.nodes[0];

        if (!notice) {
            return {
                title: locale === "hi-IN" ? "सूचना नहीं मिली" : "Notice Not Found",
                description: locale === "hi-IN" ? "यह सूचना उपलब्ध नहीं है।" : "This notice is not available.",
            };
        }

        const plainDescription = notice.content
            ? notice.content.replace(/<[^>]+>/g, "").slice(0, 160)
            : "";

            console.log(notice.title);

        return {
            title: notice.title ,
            description:
                plainDescription,
            openGraph: {
                title: notice.title,
                description: plainDescription,
            },
            twitter: {
                card: "summary",
                title: notice.title,
                description: plainDescription,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            title: locale === "hi-IN" ? "त्रुटि" : "Error",
            description: locale === "hi-IN" ? "मेटाडेटा लोड करने में समस्या।" : "Problem loading metadata.",
        };
    }
}

export default function Page() {
    return <NoticeDetailsClient />;
}
