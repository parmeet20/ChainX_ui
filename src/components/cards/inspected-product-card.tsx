"use client";

import { IProductInspector } from "@/utils/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  ClipboardCheck,
  Calendar,
  MapPin,
  Currency,
  Wallet,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { getProvider } from "@/services/blockchain";
import { withdrawInspectedProductBalance } from "@/services/inspector/inspectorService";
import WithdrawDrawer from "../drawer/withdraw-drawer";
import { toast } from "sonner";

export const InspectedProductCard = ({
  product,
}: {
  product: IProductInspector;
}) => {
  const balance = Number(product.balance);
  const inspectionDate = new Date(Number(product.inspection_date) * 1000);
  const fee = Number(product.fee_charge_per_product);

  const [amount, setAmount] = useState<number>(0);

  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  async function handleWithdraw() {
    try {
      if (!program || !publicKey) return;
      const tx = await withdrawInspectedProductBalance(
        program,
        product.publicKey.toString(),
        amount,
        publicKey
      );
      toast("Withdraw successful", {
        description: `Withdrawed ${amount} SOL`,
        action: (
          <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
            Signature
          </a>
        ),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Card className="rounded-xl transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="rounded-t-xl bg-muted/40 border-b p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.notes}
              </p>
            </div>
          </div>
          <Badge variant="default" className="capitalize">
            {product.inspection_outcome}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Inspection Date
              </p>
              <p className="text-sm text-muted-foreground">
                {inspectionDate.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Currency className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Fee</p>
              <p className="text-sm text-muted-foreground">
                {fee.toLocaleString()} SOL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Payment</p>
              {balance === 0 ? (
                <Badge variant="destructive" className="text-xs">
                  Payment Pending
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {(balance / 1e9).toLocaleString()} SOL
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Location</p>
              <p className="text-sm text-muted-foreground">
                {product.latitude.toFixed(4)}, {product.longitude.toFixed(4)}
              </p>
            </div>
          </div>
          {Number(product.balance) > 0 && (
            <span className="flex items-center  border-t p-4 text-sm text-muted-foreground  gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Inspection ID: {product.inspector_id}
            </span>
          )}
        </div>
      </CardContent>
      {Number(product.balance) > 0 && (
        <CardFooter className="bg-muted/20 flex spce-y-3">
          <WithdrawDrawer
            balance={Number(product.balance)}
            handleWithdraw={handleWithdraw}
            amount={amount}
            setAmount={setAmount}
          />
        </CardFooter>
      )}
      {Number(product.balance) === 0 && (
        <span className="flex items-center  border-t p-4 text-sm text-muted-foreground  gap-2">
          <ClipboardCheck className="w-4 h-4" />
          Inspection ID: {product.inspector_id}
        </span>
      )}
    </Card>
  );
};
