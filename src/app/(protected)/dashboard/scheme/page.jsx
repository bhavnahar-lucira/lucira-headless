"use client";

import { useSelector } from "react-redux";
import ProfileForm from "@/components/scheme/profile/ProfileForm";
import useSWR from "swr";
import { fetcher } from "@/lib/scheme/fetcher";
import AddressCard from "@/components/scheme/profile/AddressCard";
//import NomineeCard from "@/components/scheme/profile/NomineeCard";
import { useDispatch  } from "react-redux";
import { clearCustomer } from "@/redux/features/scheme/customerSlice";
import { LogOut } from 'lucide-react';
import { useWindowSize } from "@/hooks/useWindowSize";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { width } = useWindowSize();
  const router = useRouter();
  const dispatch = useDispatch();
  const customer = useSelector(state => state.customer.customer);
  const mobile = customer?.mobile; // ✅ safe

  const { data, error, isLoading, mutate } = useSWR(
    mobile ? ["/api/scheme/customer/get", { mobile }] : null,
    ([url, body]) => fetcher(url, body)
  );

  const handleLogout = async () => {
      await fetch("/api/scheme/session/logout", { method: "POST" });
      dispatch(clearCustomer());
      router.push("/");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <ProfileForm
        data={data}
        error={error}
        isLoading={isLoading}
        onUpdated={mutate}
      />

      <AddressCard
        data={data}
        isLoading={isLoading}
        error={error}
        onUpdated={mutate}
      />
      {
        width < 1025  && 
        <div className="flex gap-4 ps-1 mt-4" >
          <Button variant="outline" size="lg" onClick={() => handleLogout()}>
            <LogOut size={20}/> Log-out
          </Button>
        </div>
      }
      

      {/* <NomineeCard
        data={data}
        isLoading={isLoading}
        error={error}
        onUpdated={mutate}
      /> */}
    </div>
  );
}
