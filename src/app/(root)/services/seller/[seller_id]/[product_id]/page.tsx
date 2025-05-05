"use client";
import { getProvider } from "@/services/blockchain";
import { getProduct } from "@/services/product/productService";
import { getSellerProd } from "@/services/sellerProduct/sellerProductService";
import { IProduct, ISellerProductStock } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { buyProductAsCustomerHandler } from "@/services/customer/CustomerService";
import Image from "next/image";

const ProductDetailPageForCustomer = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const pathname = usePathname();
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const program = useMemo(() => {
    if (publicKey && signTransaction && sendTransaction) {
      try {
        return getProvider(publicKey, signTransaction, sendTransaction);
      } catch (error) {
        console.error("Error getting provider:", error);
        toast.error("Failed to initialize blockchain connection.");
        return null;
      }
    }
    return null;
  }, [publicKey, signTransaction, sendTransaction]);

  const [product, setProduct] = useState<IProduct | null>(null);
  const [sellerProduct, setSellerProduct] = useState<ISellerProductStock | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      if (!pathname || !program || !publicKey) return;

      const productId = pathname.split("/")[4];
      const sellerId = pathname.split("/")[3];

      const [productData, sellerProductData] = await Promise.all([
        getProduct(program, productId),
        getSellerProd(program, sellerId),
      ]);

      setProduct(productData);
      setSellerProduct(sellerProductData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [program, pathname]);

  if (loading) return <div className="pt-24 text-center">Loading...</div>;
  if (!product || !sellerProduct)
    return <div className="pt-24 text-center">Product not found</div>;

  const stockQuantity = Number(sellerProduct.stock_quantity);
  const productPrice = Number(sellerProduct.stock_price) / 100;

  const handleAddToCart = async () => {
    try {
      if (!program || !publicKey || !sellerProduct || !product) return;
      const tx = await buyProductAsCustomerHandler(
        program,
        quantity,
        sellerProduct.seller_pda.toString(),
        product.publicKey.toString(),
        sellerProduct.publicKey.toString(),
        publicKey
      );
      toast.success(
        `${quantity} ${product.product_name} purchased successfully`,
        {
          action: (
            <a
              href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Signature
            </a>
          ),
        }
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to add product to cart");
    } finally {
      fetchProduct();
    }
  };

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto">
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Product Image Section */}
          <div>
            <AspectRatio ratio={1} className="bg-muted rounded-lg overflow-hidden">
              {product.product_image ? (
                <Image
                  src={product.product_image}
                  alt={product.product_name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </AspectRatio>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                  {product.product_name}
                </h1>
                {product.quality_checked && (
                  <Badge variant="outline" className="text-green-600 border-green-500">
                    Quality Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">${productPrice.toFixed(2)}</span>
                <Badge className="px-2 bg-green-400 py-1">
                  {stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Availability</span>
                  <span className={`text-sm ${stockQuantity > 0 ? "text-green-500" : "text-red-500"}`}>
                    {stockQuantity > 0 ? `${stockQuantity} available` : "Sold Out"}
                  </span>
                </div>
                <Progress value={(stockQuantity / 100) * 100} className="h-2" />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Batch Number</p>
                  <p>{product.batch_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Manufacturer</p>
                  <p>{product.factory_id.toString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Description</p>
                  <p>{product.product_description || "No description available"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">MRP</p>
                  <p>${(Number(product.mrp) / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Input
                type="number"
                min="1"
                max={stockQuantity}
                value={quantity}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(stockQuantity, Number(e.target.value)));
                  setQuantity(value);
                }}
                className="w-24"
              />
              <Button
                onClick={handleAddToCart}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                disabled={stockQuantity === 0}
              >
                Add to Cart
              </Button>
            </div>

            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Seller PDA: {sellerProduct.seller_pda.toString()}</p>
                <p>Listed Price: ${productPrice.toFixed(2)}</p>
                <p>
                  Listed On:{" "}
                  {new Date(Number(sellerProduct.created_at) * 1000).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetailPageForCustomer;