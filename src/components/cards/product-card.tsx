"use client";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/utils/types";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  ClipboardList,
  Calendar,
  Currency,
  Factory,
  CheckCircle,
} from "lucide-react";
import { SiSolana } from "react-icons/si";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { getProvider } from "@/services/blockchain";
import { payInspectorForInspection } from "@/services/inspector/inspectorService";
import { toast } from "sonner";
import Image from "next/image";
// import Image from "next/image";

export const ProductCard = ({ product }: { product: IProduct }) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const pathname = usePathname();
  const id = pathname!.split("/")[3];
  const router = useRouter();

  const onPayInspectionFee = async () => {
    if (!program || !publicKey) return;
    const tx = await payInspectorForInspection(
      program,
      product.inspector_pda.toString(),
      product.publicKey.toString(),
      product.inspection_id,
      product.product_id,
      publicKey
    );
    toast("Transaction successful", {
      description: `Paid Inspection Fee`,
      action: (
        <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
          Signature
        </a>
      ),
    });
    console.log("Tx success: ", tx);
  };

  return (
    <Card className="rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
      <CardHeader className="rounded-t-xl bg-muted/40 border-b p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4 w-full">
            {/* Product Image */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              {product.product_image ? (
                <Image
                  src={product.product_image}
                  alt={product.product_name}
                  className="object-cover rounded-md"
                  sizes="(max-width: 640px) 64px, 80px"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold text-foreground line-clamp-1">
                {product.product_name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.product_description}
              </p>
            </div>
          </div>
          <Badge
            variant={product.quality_checked ? "default" : "destructive"}
            className="sm:self-start"
          >
            {product.quality_checked ? "Approved" : "Pending"}
          </Badge>
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
              <p className="text-sm text-muted-foreground">
                {product.product_stock.toString()}
              </p>
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
        <Button
          variant="secondary"
          className="rounded-full flex-1"
          onClick={() => {
            router.push(
              `/services/factory/${id}/product/${product.publicKey.toString()}`
            );
          }}
        >
          View Details
        </Button>

        {product.quality_checked && !product.inspection_fee_paid && (
          <Button
            variant="destructive"
            className="rounded-full flex-1"
            onClick={onPayInspectionFee}
          >
            Pay Fee
          </Button>
        )}

        {product.inspection_fee_paid && (
          <Button
            variant="default"
            className="rounded-full flex-1 gap-2"
            disabled
          >
            <CheckCircle className="h-4 w-4" />
            Fee Paid
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};