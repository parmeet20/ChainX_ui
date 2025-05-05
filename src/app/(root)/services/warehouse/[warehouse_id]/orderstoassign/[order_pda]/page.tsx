"use client";
import { LogisticsCard } from "@/components/cards/logistic-card";
import { getProvider } from "@/services/blockchain";
import { getAllAvailableLogisticsForSeller } from "@/services/logistic/logisticService";
import { ILogistics } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";

const AvailableLogistics = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [Logistics, setLogistics] = useState<ILogistics[]>([]);
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  const fetchLogistis = async () => {
    const l = await getAllAvailableLogisticsForSeller(program!);
    setLogistics(l);
  };
  useEffect(() => {
    fetchLogistis();
  }, [program, publicKey]);
  if (Logistics.length === 0) {
    return <>No Logistics Available</>;
  }
  return (
    <div className="px-10 grid grid-cols-3 gap-6 pt-24">
      {Logistics.map((l) => (
        <LogisticsCard key={l.publicKey.toString()} logistics={l} />
      ))}
    </div>
  );
};

export default AvailableLogistics;
