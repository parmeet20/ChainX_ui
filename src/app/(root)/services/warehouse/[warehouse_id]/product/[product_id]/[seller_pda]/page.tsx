"use client";
import { getProvider } from "@/services/blockchain";
import { getProduct } from "@/services/product/productService";
import { getSeller } from "@/services/seller/sellerService";
import { getWarehouse } from "@/services/warehouse/warehouseService";
import { IProduct, ISeller, IWarehouse } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createNewOrder } from "@/services/order/orderService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const OrderProductFromWarehouseProductDetailPage = () => {
  const pathname = usePathname();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [quantity, setQuantity] = useState("");
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const [seller, setSeller] = useState<ISeller | null>(null);
  const [warehouse, setWarehouse] = useState<IWarehouse | null>(null);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!program || !publicKey || !pathname) return;
      const w = await getWarehouse(program, pathname.split("/")[3].toString());
      const p = await getProduct(program, pathname.split("/")[5].toString());
      const s = await getSeller(
        program,
        pathname.split("/")[6].toString().slice(0, -3)
      );
      setWarehouse(w);
      setProduct(p);
      setSeller(s);
    };
    fetchData();
  }, [program, publicKey, pathname]);

  const handleOrder = async () => {
    try {
      setLoading(true);
      if (
        !program ||
        !publicKey ||
        !pathname ||
        !seller ||
        !product ||
        !warehouse
      )
        return;
      const tx = await createNewOrder(
        program,
        seller.publicKey.toString(),
        Number(product.product_id),
        Number(quantity),
        warehouse.publicKey.toString(),
        product.publicKey.toString(),
        publicKey
      );
      toast("Order Created", {
        description: `order created successfully `,
        action: (
          <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
            Signature
          </a>
        ),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!seller || !product || !warehouse) return null;

  return (
    <div className="pt-28 max-w-6xl mx-auto px-4 space-y-8 grid grid-cols-2">
      <h1 className="text-4xl font-bold tracking-tight">Product Order</h1>

      {/* Product Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{product.product_name}</CardTitle>
              <CardDescription className="mt-2">
                {product.product_description}
              </CardDescription>
            </div>
            <Badge
              variant={product.quality_checked ? "default" : "destructive"}
            >
              {product.quality_checked
                ? "Quality Approved"
                : "Pending Inspection"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Batch Number</Label>
              <p className="font-medium">{product.batch_number}</p>
            </div>
            <div className="space-y-1">
              <Label>Available Stock</Label>
              <p className="font-medium">{product.product_stock.toString()}</p>
            </div>
            <div className="space-y-1">
              <Label>Unit Price</Label>
              <p className="font-medium">${Number(product.product_price)}</p>
            </div>
            <div className="space-y-1">
              <Label>MRP</Label>
              <p className="font-medium">${Number(product.mrp)}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Order Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                max={product.product_stock.toString()}
              />
            </div>
            {!loading ? (
              <Button size="lg" className="w-full" onClick={handleOrder}>
                Place Order
              </Button>
            ) : (
              <Button disabled>
                <Loader2 className="animate-spin w-full" />
                Please wait
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{warehouse.name}</CardTitle>
          <CardDescription>{warehouse.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Location Coordinates</Label>
              <p className="font-medium">
                {warehouse.latitude.toFixed(4)},{" "}
                {warehouse.longitude.toFixed(4)}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Contact Information</Label>
              <p className="font-medium">{warehouse.contact_details}</p>
            </div>
            <div className="space-y-1">
              <Label>Warehouse Capacity</Label>
              <p className="font-medium">
                {warehouse.warehouse_size.toString()} units
              </p>
            </div>
            <div className="space-y-1">
              <Label>Current Balance</Label>
              <p className="font-medium">${Number(warehouse.balance) / 1e9}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Product Information</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm">
                  Current Stock: {warehouse.product_count.toString()}
                </p>
                <p className="text-sm">
                  Managed Logistics: {warehouse.logistic_count.toString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  Factory ID: {warehouse.factory_id.toString()}
                </p>
                <p className="text-sm">
                  Product PDA: {warehouse.product_pda.toString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderProductFromWarehouseProductDetailPage;
