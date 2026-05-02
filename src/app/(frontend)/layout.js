import Footer from "@/components/common/Footer";
import Header from "@/components/header/Header";
import { AutoAuthPopup } from "@/components/auth/AutoAuthPopup";

export default function FrontendLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <AutoAuthPopup />
    </>
  );
}