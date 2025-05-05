"use client";
import React, { useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProvider } from "@/services/blockchain";
import { toast } from "sonner";
import { updatePlatformFee } from "@/services/owner/ContractOwnerService";

interface PlatformFeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlatformFeeDrawer: React.FC<PlatformFeeDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();

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

  const [fee, setFee] = useState<number>(1); // Default fee is 1

  const handleIncrement = () => {
    if (fee < 5) {
      setFee(fee + 1);
    }
  };

  const handleDecrement = () => {
    if (fee > 1) {
      setFee(fee - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!program || !publicKey) return;
      const tx = await updatePlatformFee(program, publicKey, fee);
      toast("Fee updated successfully", {
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
      });
    } catch (error) {
      console.log(error);
    }
    onClose(); // Close the drawer after submission
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose(); // Only call onClose when the drawer is closing
      }}
    >
      <DrawerContent className="mx-auto max-w-md">
        <div className="p-6">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold text-center mb-4">
              Platform Fee Adjustment
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDecrement}
                disabled={fee <= 1}
                className="h-12 w-12 rounded-full text-xl"
              >
                -
              </Button>

              <Input
                value={`${fee}%`}
                readOnly
                className="w-24 text-center text-xl font-bold"
              />

              <Button
                variant="outline"
                size="lg"
                onClick={handleIncrement}
                disabled={fee >= 5}
                className="h-12 w-12 rounded-full text-xl"
              >
                +
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Fee can be adjusted between 1% to 5%
            </p>
          </div>

          <DrawerFooter className="pt-6">
            <Button onClick={handleSubmit} size="lg">
              Confirm Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PlatformFeeDrawer;