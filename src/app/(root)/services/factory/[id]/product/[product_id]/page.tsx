"use client";
import { getProvider } from "@/services/blockchain";
import { getProduct } from "@/services/product/productService";
import { IFactory, IProduct } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Factory,
  Barcode,
  CheckCircle2,
  ShoppingCart,
  CalendarDays,
  PackageOpen,
  ShieldCheck,
} from "lucide-react";
import { SiSolana } from "react-icons/si";
import useStore from "@/store/user_store";
import { getFactoryFromProduct } from "@/services/factory/factoryService";
import { InspectProductDialog } from "@/components/shared/dialog/inspect-product-dialog";
import { AddToCartDialog } from "@/components/shared/dialog/add-to-cart-dialog";
import { Lens } from "@/components/ui/lens";
import Image from "next/image";

const ProductDetailPage = () => {
  const params = useParams<{ product_id: string }>();
  const product_id = params?.product_id;
  const [product, setProduct] = useState<IProduct | null>(null);
  const [factory, setFactory] = useState<IFactory | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openCartDialog, setOpenCartDialog] = useState<boolean>(false);
  const [hovering, setHovering] = useState(false);

  const { user } = useStore();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (program && product_id) {
        try {
          const p = await getProduct(program, product_id);
          setProduct(p);
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }
    };
    fetchProduct();
  }, [program, product_id, publicKey]);

  useEffect(() => {
    const fetchProductPubKey = async () => {
      if (program && product?.publicKey) {
        try {
          const res = await getFactoryFromProduct(
            program,
            product.publicKey.toString()
          );
          setFactory(res);
          console.log("Factory details:", res);
        } catch (error) {
          console.error("Error fetching factory details:", error);
        }
      }
    };
    fetchProductPubKey();
  }, [program, product]);

  if (!product) {
    return <div className="container py-8 pt-24">Product Not Found</div>;
  }

  const productPrice = Number(product.product_price) || 0;
  const productStock = Number(product.product_stock) || 0;
  const createdDate = product.created_at
    ? new Date(Number(product.created_at) * 1000).toLocaleDateString()
    : "N/A";

  return (
    <div className="container pt-24 px-3 py-8 max-w-7xl">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="grid gap-8 md:grid-cols-2 p-6">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <Lens hovering={hovering} setHovering={setHovering}>
                <Image
                  src={product.product_image}
                  alt={product.product_name || "Product Image"}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.png"; // Fallback image
                  }}
                />
              </Lens>
              <Badge
                variant="outline"
                className="absolute bg-slate-200/80 backdrop-blur-2xl top-2 right-2"
              >
                {productStock} in stock
              </Badge>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {product.product_name || "Unnamed Product"}
                </h1>
                {product.quality_checked ? (
                  <Badge variant="secondary" className="gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Quality Checked
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-500" />
                    Quality Not Checked
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold flex items-center">
                  <SiSolana className="h-6 w-6 mr-2" />
                  {productPrice}
                </span>
              </div>
            </div>
            {user?.role !== "FACTORY" &&
              user?.role !== "INSPECTOR" &&
              user?.role !== "WAREHOUSE" && (
                <>
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => setOpenCartDialog(true)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                </>
              )}

            {user?.role === "WAREHOUSE" && (
              <>
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => setOpenCartDialog(true)}
                >
                  Become Warehouse
                </Button>
                <AddToCartDialog
                  open={openCartDialog}
                  product={product}
                  setOpen={setOpenCartDialog}
                />
              </>
            )}
            {user?.role === "FACTORY" &&
              (!product.quality_checked ? (
                <Button size="lg" disabled className="w-full bg-red-400 gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Not Inspected Yet
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled
                  className="w-full bg-green-400 gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Product Inspected
                </Button>
              ))}
            {user?.role === "INSPECTOR" && (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setOpenDialog(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Inspect Product Now
                </Button>

                {factory && product.publicKey && (
                  <InspectProductDialog
                    open={openDialog}
                    p_id={Number(product.product_id) || 0}
                    prod_pda={product.publicKey.toString()}
                    factoty_pda={factory.publicKey.toString()}
                    setOpen={setOpenDialog}
                  />
                )}
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Factory className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Factory ID</p>
                  <p className="font-medium">
                    {product.factory_id?.toString() || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Barcode className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-medium">{product.batch_number || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Inspection ID</p>
                  <p className="font-medium">
                    {product.inspection_id?.toString() || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Manufactured</p>
                  <p className="font-medium">{createdDate}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Product Description</h3>
              <p className="text-muted-foreground">
                {product.product_description || "No description available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <PackageOpen className="h-6 w-6" />
            Blockchain Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Product ID</p>
              <p className="font-mono font-medium">
                {product.product_id?.toString() || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Public Key</p>
              <p className="font-mono font-medium truncate">
                {publicKey?.toString().slice(0, 4) +
                  "..." +
                  publicKey?.toString().slice(-4) || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
