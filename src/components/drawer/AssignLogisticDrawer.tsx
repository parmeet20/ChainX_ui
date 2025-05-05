// components/drawer/assign-logistic-drawer.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Minus, Plus, Truck } from "lucide-react";
import useStore from "@/store/user_store";
import { useState, useEffect } from "react";

interface AssignLogisticDrawerProps {
  balance: number;
  handleAssignLogistic: () => Promise<void>;
  amount: number;
  setAmount: (value: number) => void;
  loading?: boolean;
}

const AssignLogisticDrawer = ({
  balance,
  handleAssignLogistic,
  amount,
  setAmount,
  loading = false,
}: AssignLogisticDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(amount.toString());
  const { user } = useStore();

  useEffect(() => {
    setInputValue(amount.toString());
  }, [amount]);

  const handleInputChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setInputValue(numericValue);
    const newAmount = Math.min(Number(numericValue), balance);
    if (!isNaN(newAmount)) setAmount(newAmount);
  };

  const handleConfirm = async () => {
    try {
      await handleAssignLogistic();
      setIsOpen(false);
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  if (!user) return <div>Page not found</div>;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">Assign Order</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] w-[500px] mx-auto z-[1000]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Assign Logistics Order
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-8 py-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAmount(Math.max(0, amount - 1))}
              disabled={amount <= 0 || loading}
            >
              <Minus className="w-4 h-4" />
            </Button>

            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold">{amount}</span>
              <span className="text-sm text-muted-foreground">
                Maximum Fee: {(balance / 1e9).toLocaleString()} SOL
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setAmount(Math.min(balance, amount + 1))}
              disabled={amount >= balance || loading}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter shipment fee"
              className="text-center"
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground text-center">
              Enter fee in SOL
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={loading || amount <= 0 || amount > balance}
          >
            {loading ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AssignLogisticDrawer;