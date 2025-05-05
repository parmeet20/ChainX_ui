"use client";
import { ISeller } from "@/utils/types";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ScrollArea } from "@/components/ui/scroll-area";
import SellerList from "../SellerList";
import { getAllSellers } from "@/services/seller/sellerService";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProvider } from "@/services/blockchain";

const MapComponent = dynamic(() => import("@/components/shared/MapComponent"), {
  ssr: false,
});

const SellerServicePage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const [sellers, setSellers] = useState<ISeller[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey || !program) {
        setLoading(false);
        return;
      }
      
      try {
        const s = await getAllSellers(program, publicKey);
        setSellers(s || []); // Ensure array even if null/undefined
      } catch (error) {
        console.error("Error fetching sellers:", error);
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [program, publicKey]);

  if (loading) {
    return <div className="flex h-screen pt-16 dark:bg-gray-900 items-center justify-center">
      Loading sellers...
    </div>;
  }

  return (
    <div className="flex h-screen pt-16 dark:bg-gray-900">
      <ScrollArea className="w-full md:w-1/3 p-6 overflow-y-auto border-r dark:border-gray-700">
        <SellerList sellers={sellers} />
      </ScrollArea>

      <div className="hidden md:block flex-1 p-6 bg-gray-50 dark:bg-gray-800">
        {sellers.length > 0 ? (
          <MapComponent
            locations={sellers.map((s) => ({
              lat: s.latitude,
              lng: s.longitude,
              name: s.name,
              id: s.seller_id,
            }))}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No sellers to display on map
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerServicePage;