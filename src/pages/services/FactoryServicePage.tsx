"use client";
import { getProvider } from "@/services/blockchain";
import { getMyFactories } from "@/services/factory/factoryService";
import { IFactory } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";
import { FactoryList } from "@/components/shared/FactoryList";
import { ScrollArea } from "@/components/ui/scroll-area";

const MapComponent = dynamic(() => import("@/components/shared/MapComponent"), {
  ssr: false,
});

const FactoryServicePage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [factories, setFactories] = useState<IFactory[]>([]);

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    const fetchMyFactories = async () => {
      if (!program || !publicKey) return;
      const f = await getMyFactories(program, publicKey);
      setFactories(f);
    };
    fetchMyFactories();
  }, [program, publicKey]);

  return (
    <div className="flex h-screen pt-16 dark:bg-gray-900">
      {/* Left Panel */}
      <ScrollArea className="w-full md:w-1/3 p-6 overflow-y-auto border-r dark:border-gray-700">
        <FactoryList factories={factories} />
      </ScrollArea>

      {/* Right Panel */}
      <div className="hidden md:block flex-1 p-6 bg-gray-50 dark:bg-gray-800">
        {factories.length > 0 ? (
          <MapComponent
            locations={factories.map((factory) => ({
              lat: factory.latitude,
              lng: factory.longitude,
              name: factory.name,
              id: factory.factory_id,
            }))}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No factories to display on map
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryServicePage;
