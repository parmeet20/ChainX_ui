"use client";
import { ProductCardForInspector } from "@/components/cards/product-card-for-inspector";
import { getProvider } from "@/services/blockchain";
import { getAllProductsForInspector } from "@/services/product/productService";
import { IProduct } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";
import MyInspectedProductList from "../MyInspectedProductList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductInspectorService = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchNotInspectedProducts = async () => {
      if (!program) return;
      const p = await getAllProductsForInspector(program);
      setProducts(p);
    };
    fetchNotInspectedProducts();
  }, [program]);

  return (
    <div className="pt-24 container mx-auto px-4">
      <Tabs defaultValue="new-products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto mb-8">
          <TabsTrigger value="new-products">
            New Products to Inspect
          </TabsTrigger>
          <TabsTrigger value="inspected-products">
            My Inspected Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-products">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCardForInspector
                key={p.publicKey.toString()}
                product={p}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inspected-products">
          <MyInspectedProductList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductInspectorService;
