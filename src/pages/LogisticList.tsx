"use client";
import { LogisticsCard } from "@/components/cards/logistic-card";
import { getProvider } from "@/services/blockchain";
import { getAllMyLogistics } from "@/services/logistic/logisticService";
import { ILogistics } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";

const LogisticList = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [logistics, setLogistics] = useState<ILogistics[]>([]);
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  async function getAllLogistics() {
    if (!program || !publicKey) return;
    const l = await getAllMyLogistics(program, publicKey);
    setLogistics(l);
  }

  useEffect(() => {
    getAllLogistics();
  }, []);

  return (
    <div className="px-10 sm:grid sm:grid-cols-3 sm:gap-6">
      {logistics.length === 0 ? (
        <>No Logistics Found For This Account</>
      ) : (
        logistics.map((l) => (
          <LogisticsCard key={l.publicKey.toString()} logistics={l} />
        ))
      )}
    </div>
  );
};

export default LogisticList;
