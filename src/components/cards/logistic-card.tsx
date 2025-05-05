"use client";

import { ILogistics } from "@/utils/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Truck,
  Calendar,
  MapPin,
  Currency,
  Wallet,
  Phone,
  Clock,
  PackageCheck,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { getProvider } from "@/services/blockchain";
// import { withdrawLogisticsBalance } from "@/services/logistics/logisticsService";
import WithdrawDrawer from "../drawer/withdraw-drawer";
import { sendLogisticToSeller } from "@/services/warehouse/warehouseService";
import { usePathname } from "next/navigation";
import AssignLogisticDrawer from "../drawer/AssignLogisticDrawer";
import { withdrawLogisticsBalance } from "@/services/logistic/logisticService";
import useStore from "@/store/user_store";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";

export const LogisticsCard = ({ logistics }: { logistics: ILogistics }) => {
  const balance = Number(logistics.balance);
  const shipmentStart = new Date(Number(logistics.shipment_started_at) * 1000);
  const shipmentEnd = new Date(Number(logistics.shipment_ended_at) * 1000);
  const cost = Number(logistics.shipment_cost);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();

  const [amount, setAmount] = useState<number>(0);

  const { user } = useStore();

  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  async function handleWithdraw() {
    try {
      if (!program || !publicKey) return;
      const tx = await withdrawLogisticsBalance(
        program,
        logistics.publicKey.toString(),
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

  async function assignOrderToLogistic() {
    if (!program || !publicKey || !pathname || !logistics) return;
    try {
      setLoading(true);
      const tx = await sendLogisticToSeller(
        program,
        logistics.publicKey.toString(),
        pathname.toString().split("/")[5].toString(),
        pathname.toString().split("/")[3].toString(),
        amount,
        publicKey
      );
      console.log("Tx success", tx);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-xl transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="rounded-t-xl bg-muted/40 border-b p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                {logistics.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {logistics.transportation_mode}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="default" className="capitalize">
              {logistics.status}
            </Badge>
            {logistics.delivered && (
              <Badge variant="default" className="flex items-center gap-1">
                <PackageCheck className="w-4 h-4" />
                Delivered
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Contact</p>
              <p className="text-sm text-muted-foreground">
                {logistics.contact_info}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Currency className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Shipment Cost
              </p>
              <p className="text-sm text-muted-foreground">
                {Number(cost / LAMPORTS_PER_SOL)} SOL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Shipment Dates
              </p>
              <p className="text-sm text-muted-foreground">
                {shipmentStart.toLocaleDateString()} -{" "}
                {shipmentEnd.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Current Location
              </p>
              <p className="text-sm text-muted-foreground">
                {logistics.latitude.toFixed(4)},{" "}
                {logistics.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Balance</p>
              {Number(logistics.balance) === 0 ? (
                <Badge variant="destructive" className="text-xs">
                  0
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {Number(logistics.balance / LAMPORTS_PER_SOL)}
                  SOL
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Product Stock
              </p>
              <p className="text-sm text-muted-foreground">
                {Number(logistics.product_stock).toLocaleString()} units
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {balance > 0 && logistics.status==="DELIVERED" ? (
        <CardFooter className="bg-muted/20 flex spce-y-3">
          <WithdrawDrawer
            balance={balance / LAMPORTS_PER_SOL}
            handleWithdraw={handleWithdraw}
            amount={amount}
            setAmount={setAmount}
          />
        </CardFooter>
      ) : (
        <div className="flex items-center justify-between border-t p-4">
          <span className="flex items-center text-sm text-muted-foreground gap-2">
            <Truck className="w-4 h-4" />
            Logistics ID: {logistics.logistic_id.toString()}
          </span>
          {!logistics.delivered && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              In Transit
            </Badge>
          )}
        </div>
      )}
      {user?.role === "WAREHOUSE" && (
        <CardFooter>
          <AssignLogisticDrawer
            balance={5} // Use shipment cost as maximum fee
            handleAssignLogistic={assignOrderToLogistic}
            setAmount={setAmount}
            amount={amount}
            loading={loading}
          />
        </CardFooter>
      )}
    </Card>
  );
};
