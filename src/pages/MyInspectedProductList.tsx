"use client";
import { getProvider } from "@/services/blockchain";
import { getAllMyInspectedProducts } from "@/services/inspector/inspectorService";
import { IProductInspector } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";
import { InspectedProductCard } from "@/components/cards/inspected-product-card";

const MyInspectedProductList = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [inspectedProducts, setInspectedProducts] = useState<
    IProductInspector[]
  >([]);

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!program || !publicKey) return;
      const p = await getAllMyInspectedProducts(program, publicKey);
      setInspectedProducts(p);
    };
    fetchProducts();
  }, [program, publicKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inspectedProducts.map((product, index) => (
        <InspectedProductCard key={index} product={product} />
      ))}
      {inspectedProducts.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-12">
          No inspected products found
        </div>
      )}
    </div>
  );
};

export default MyInspectedProductList;
