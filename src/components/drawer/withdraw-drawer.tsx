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
import { Minus, Plus, Wallet } from "lucide-react";

interface WithdrawDrawerProps {
  balance: number;
  handleWithdraw: () => void;
  amount: number;
  setAmount: (value: number) => void;
  handleClose?: () => void; // Add handleClose as an optional prop
  loading?: boolean; // Add loading as an optional prop
}

const WithdrawDrawer = ({
  balance,
  handleWithdraw,
  amount,
  setAmount,
  handleClose,
  loading = false,
}: WithdrawDrawerProps) => {
  const validateAndSetAmount = (value: string) => {
    const newAmount = Math.min(Number(value), balance);
    if (!isNaN(newAmount)) setAmount(newAmount);
  };

  const onConfirmWithdraw = () => {
    handleWithdraw();
    if (handleClose) handleClose(); // Close the drawer after withdrawal if handleClose is provided
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">Withdraw Balance</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] w-[500px] mx-auto z-[1000]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Withdraw Funds
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
                Available: {(balance / 1e9).toLocaleString()} SOL
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
              value={amount}
              onChange={(e) => validateAndSetAmount(e.target.value)}
              placeholder="Enter custom amount"
              className="text-center"
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground text-center">
              Enter amount in SOL
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button
            size="lg"
            onClick={onConfirmWithdraw}
            disabled={loading || amount <= 0 || amount > balance}
          >
            {loading ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default WithdrawDrawer;