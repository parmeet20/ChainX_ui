"use client";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/utils/types";
import {
  Package,
  ClipboardList,
  Calendar,
  Currency,
  Factory,
} from "lucide-react";
import { SiSolana } from "react-icons/si";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { getProvider } from "@/services/blockchain";
import { getProduct } from "@/services/product/productService";
import Link from "next/link";

export const CustomerProductCard = ({
  productPda,
  stock_quantity,
  customerProductPda,
}: {
  productPda: string;
  customerProductPda?: string;
  stock_quantity: number;
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [product, setProduct] = useState<IProduct | null>(null);
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const fetchProduct = async () => {
    if (!program || !productPda) return;
    const prod = await getProduct(program, productPda);
    setProduct(prod);
  };
  useEffect(() => {
    fetchProduct();
  }, []);

  if (!product) return null;

  return (
    <Card className="rounded-xl transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="rounded-t-xl bg-muted/40 border-b p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {product.product_name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.product_description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Batch No.</p>
              <p className="text-sm text-muted-foreground">
                {product.batch_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Currency className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Price</p>
              <div className="flex items-center gap-2">
                <SiSolana className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">
                  {product.product_price.toString()} SOL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Factory className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Stock</p>
              <p className="text-sm text-muted-foreground">{stock_quantity}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Manufactured
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(
                  Number(product.created_at) * 1000
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t p-4 gap-3">
        <Link href={`/services/product/${customerProductPda}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
