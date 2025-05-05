"use client";
import { ProductSellerCard } from "@/components/cards/product-seller-card";
import { getProvider } from "@/services/blockchain";
import { getAllMySellerProducts } from "@/services/sellerProduct/sellerProductService";
import { ISellerProductStock } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";

const SellerProductListPage = ({ sellerPda }: { sellerPda: string }) => {
  const [products, setProducts] = useState<ISellerProductStock[]>([]);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  const fetchProducts = async () => {
    if (!program || !publicKey || !sellerPda) return;
    const p = await getAllMySellerProducts(program, sellerPda);
    setProducts(p);
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <div className="px-10 grid sm:grid-cols-3 gap-6">
      {products.map((p) => (
        <ProductSellerCard
          key={p.publicKey.toString()}
          sellerPda={p.publicKey.toString()}
          stock_quantity={Number(p.stock_quantity)}
          productPda={p.product_pda.toString()}
        />
      ))}
    </div>
  );
};

export default SellerProductListPage;
