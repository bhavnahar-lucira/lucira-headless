import Footer from "@/components/common/Footer";
import Header from "@/components/header/Header";
import { AutoAuthPopup } from "@/components/auth/AutoAuthPopup";
import VisitorTracking from "@/components/common/VisitorTracking";

export default function FrontendLayout({ children }) {
  return (
    <>
      <Header />
      <VisitorTracking />
      {children}
      <Footer />
      <AutoAuthPopup />
    </>
  );
}
