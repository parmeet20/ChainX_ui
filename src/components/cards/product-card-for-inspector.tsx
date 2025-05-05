"use client";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/utils/types";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Calendar, 
  Package, 
  Currency, 
  Factory 
} from "lucide-react";
import { SiSolana } from "react-icons/si";

export const ProductCardForInspector = ({ product }: { product: IProduct }) => {
  const router = useRouter();

  return (
    <Card className="rounded-xl transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="rounded-t-xl bg-muted/40 border-b p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Factory className="w-5 h-5 text-muted-foreground" />
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
          <Badge variant={product.quality_checked ? "default" : "destructive"}>
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
              <Package className="w-5 h-5 text-muted-foreground" />
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
              <p className="text-sm font-medium text-foreground">Manufactured</p>
              <p className="text-sm text-muted-foreground">
                {new Date(Number(product.created_at) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t p-4">
        <Button
          variant="secondary"
          className="w-full rounded-full"
          onClick={() => {
            router.push(
              `/services/factory/${product.factory_id.toString()}/product/${product.publicKey.toString()}`
            );
          }}
        >
          View Product Details
        </Button>
      </CardFooter>
    </Card>
  );
};