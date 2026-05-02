import Footer from "@/components/common/Footer";
import Header from "@/components/header/Header";
import { AutoAuthPopup } from "@/components/auth/AutoAuthPopup";
import PopularSearches from "@/components/common/PopularSearches";

export default function FrontendLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <PopularSearches />
      <AutoAuthPopup />
    </>
  );
}