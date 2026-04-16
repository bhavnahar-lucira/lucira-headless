import CheckoutHeader from "@/components/common/CheckoutHeader";
import CheckoutFooter from "@/components/common/CheckoutFooter";

export default function CheckoutLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CheckoutHeader />
      <main className="flex-grow">
        {children}
      </main>
      <div className="bg-[#F9F9FB]">
        <CheckoutFooter />
      </div>
    </div>
  );
}
