"use client";
import { WarehouseCard } from "@/components/cards/warehouse-card";
import { getProvider } from "@/services/blockchain";
import { productsReadyForOrderList } from "@/services/order/orderService";
import { IWarehouse } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const SearchForProductPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const pathname = usePathname();

  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  useEffect(() => {
    const fetch = async () => {
      if (!program || !publicKey) return;
      const w = await productsReadyForOrderList(program);
      setWarehouses(w);
    };
    fetch();
  }, [program, publicKey]);
  if (warehouses.length === 0) {
    return <>No warehouses found</>;
  }
  return (
    <div className="pt-24 p-8 sm:grid sm:grid-cols-3 gap-8">
      {warehouses.map((w) => (
        <WarehouseCard
          key={w.publicKey.toString()}
          warehouse={w}
          seller_pda={pathname?.split("/")[3].toString()}
        />
      ))}
    </div>
  );
};

export default SearchForProductPage;
