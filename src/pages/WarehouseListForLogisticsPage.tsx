"use client";
import { WarehouseCard } from "@/components/cards/warehouse-card";
import { getProvider } from "@/services/blockchain";
import { lookForOrderAsLogistics } from "@/services/logistic/logisticService";
import { IWarehouse } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";

const WarehouseListForLogisticsPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  const fetch = async () => {
    if (!program) return;
    const w = await lookForOrderAsLogistics(program);
    setWarehouses(w);
  };
  useEffect(() => {
    fetch();
  }, [program, publicKey]);
  return (
    <div className="px-10 grid sm:grid-cols-3 gap-6">
      {warehouses.length === 0 ? (
        <>No Warehouses Found</>
      ) : (
        warehouses.map((w) => (
          <WarehouseCard key={w.publicKey.toString()} warehouse={w} />
        ))
      )}
    </div>
  );
};

export default WarehouseListForLogisticsPage;
