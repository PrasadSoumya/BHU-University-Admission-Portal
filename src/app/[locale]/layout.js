import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function HomeLayout({ children, params }) {
    const locale = (await params).locale;

    return (
        <div lang={locale} >
            <Navbar locale={locale} />
            {children}
            <Footer locale={locale}></Footer>

        </div>
    );
}
