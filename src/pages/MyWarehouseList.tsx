"use client";
import { WarehouseCard } from "@/components/cards/warehouse-card";
import { getProvider } from "@/services/blockchain";
import { getAllMyWarehouses } from "@/services/warehouse/warehouseService";
import { IWarehouse } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";

const MyWarehouseList = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!program || !publicKey) return;
      const w = await getAllMyWarehouses(program, publicKey);
      setWarehouses(w);
    };
    fetch();
  }, [program, publicKey]);
  return (
    <div className=" px-10 grid sm:grid-cols-3 gap-6">
      {warehouses.map((w) => (
        <WarehouseCard key={w.warehouse_id} warehouse={w} />
      ))}
    </div>
  );
};

export default MyWarehouseList;
