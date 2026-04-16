import Footer from "@/components/common/Footer";
import Header from "@/components/header/Header";

export default function FrontendLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}