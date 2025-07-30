// src/app/[locale]/page.js
import BannerCarousel from "@/components/BannerCarousel";
import Announcement from "@/components/Announcement";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import AlbumGallery from "@/components/ImageGallery";
import AdmissionPortal from "@/components/AdmissionPortal";

export default async  function Home({ params }) {
  const locale = (await params).locale;
  

  return (
    <div className="">
      <BannerCarousel locale={locale} />
      <Announcement locale={locale} />
      <AdmissionPortal locale={locale}></AdmissionPortal>
      <Dashboard locale={locale} />
      <Sidebar locale={locale} />
      <AlbumGallery locale={locale}></AlbumGallery>
      <ScrollToTopButton></ScrollToTopButton>
    </div>
  );
}
