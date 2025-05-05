"use client";

import { CustomerProductCard } from "@/components/cards/CustomerProductCard";
import { getProvider } from "@/services/blockchain";
import { getAllMyProducts } from "@/services/customer/CustomerService";
import { ICustomerProduct } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CustomerProductsList = () => {
  const [products, setProducts] = useState<ICustomerProduct[]>([]);
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  // Ensure program is initialized correctly
  const program = useMemo(() => {
    if (publicKey && signTransaction && sendTransaction) {
      try {
        // Pass signTransaction as is, assuming getProvider expects the specific type
        return getProvider(publicKey, signTransaction, sendTransaction);
      } catch (error) {
        console.error("Error getting provider:", error);
        toast.error("Failed to initialize blockchain connection.");
        return null;
      }
    }
    return null;
  }, [publicKey, signTransaction, sendTransaction]);
  const fetchProducts = async () => {
    try {
      if (!program || !publicKey) return;
      const p = await getAllMyProducts(program, publicKey);
      setProducts(p);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [program, publicKey]);
  if (products.length === 0) {
    return (
      <div className="pt-24 p-8 text-center justify-center content-center flex flex-col py-auto">
        No products found
      </div>
    );
  }
  return (
    <div className="pt-24 p-8 sm:grid sm:grid-cols-3 gap-8">
      {products.map((p) => (
        <CustomerProductCard
          key={p.publicKey.toString()}
          productPda={p.product_pda.toString()}
          customerProductPda={p.publicKey.toString()}
          stock_quantity={Number(p.stock_quantity)}
        />
      ))}
    </div>
  );
};

export default CustomerProductsList;
