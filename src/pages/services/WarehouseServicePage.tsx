"use client";
import { getProvider } from "@/services/blockchain";
import { getProductsForWarehouse } from "@/services/warehouse/warehouseService";
import { IProduct } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardForInspector } from "@/components/cards/product-card-for-inspector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MyWarehouseList from "../MyWarehouseList";

const WarehouseServicePage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!program || !publicKey) return;
      try {
        const p = await getProductsForWarehouse(program);
        setProducts(p);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [program, publicKey]);
  return (
    <div className="py-8 p-10 pt-24">
      <h1 className="text-3xl font-bold mb-8">Warehouse Services</h1>

      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="buy">Create Warehouse</TabsTrigger>
          <TabsTrigger value="warehouses">My Warehouses</TabsTrigger>
        </TabsList>

        <TabsContent value="buy">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCardForInspector
                  key={product.publicKey.toString()}
                  product={product}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="warehouses">
          <MyWarehouseList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarehouseServicePage;
