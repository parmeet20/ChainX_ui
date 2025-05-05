"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProvider } from "@/services/blockchain";
import { buyStockForWarehouse } from "@/services/warehouse/warehouseService";
import { toast } from "sonner";

interface ProductDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product_id: number;
  product_pda: string;
  factory_id: number;
  warehouse_id: number;
}

export function ProductDrawer({
  isOpen,
  onOpenChange,
  product_id,
  product_pda,
  factory_id,
  warehouse_id,
}: ProductDrawerProps) {
  const [stockCount, setStockCount] = useState(0);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);
  async function onSubmit() {
    if (!program || !publicKey) return;
    const tx = await buyStockForWarehouse(
      program,
      product_id,
      product_pda,
      factory_id,
      warehouse_id,
      stockCount,
      publicKey
    );
    toast("Transaction successful", {
      description: `${stockCount} products purchased successfully`,
    });
    console.log(tx);
  }

  const handleIncrement = () => setStockCount((prev) => prev + 1);
  const handleDecrement = () => setStockCount((prev) => Math.max(0, prev - 1));

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] w-[500px] mx-auto z-[1000]">
        {" "}
        {/* Added z-50 */}
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              Select Product Quantity
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleDecrement}
                disabled={stockCount === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="flex-1 text-center">
                <div className="text-5xl font-bold tracking-tighter text-primary">
                  {stockCount}
                </div>
                <div className="text-xs uppercase text-muted-foreground">
                  units
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-sm font-medium">
                Or enter custom quantity
              </label>
              <Input
                type="number"
                value={stockCount}
                onChange={(e) =>
                  setStockCount(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="text-center text-lg font-semibold"
                min={0}
              />
            </div>
          </div>

          <DrawerFooter className="pt-4">
            <Button size="lg" onClick={() => onSubmit()} className="w-full">
              Add to Cart
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="mt-2">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
