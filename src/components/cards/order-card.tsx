"use client";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IOrder, ISeller } from "@/utils/types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import useStore from "@/store/user_store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { getProvider } from "@/services/blockchain";
import { recieveProdctAsSeller } from "@/services/seller/sellerService";
import { toast } from "sonner";
const OrderCard = ({
  order,
  logisticPda,
  seller,
}: {
  order: IOrder;
  logisticPda?: string;
  seller?: ISeller;
}) => {
  const { user } = useStore();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  async function handleRecieveProduct() {
    try {
      setLoading(true);
      if (!program || !publicKey || !logisticPda || !order) return;
      const tx = await recieveProdctAsSeller(
        program,
        publicKey,
        logisticPda,
        order.publicKey.toString()
      );
      toast("Product Revieved", {
        description: `Product Revieved Successfully`,
        action: (
          <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
            Signature
          </a>
        ),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {}, [program, publicKey, order, loading]);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">Order #{order.order_id.toString()}</h3>
          <p className="text-sm text-muted-foreground">
            Product ID: {order.product_id.toString()}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            order.status === "delivered"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Total Price:</span>
          <span className="font-medium">
            {(order.total_price.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Stock:</span>
          <span className="font-medium">
            {order.product_stock.toString()} units
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Date:</span>
          <span className="font-medium">
            {new Date(order.timestamp.toNumber() * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
      {user?.role === "WAREHOUSE" && (
        <CardFooter>
          {" "}
          <Link
            href={`/services/warehouse/${
              pathname!.toString().split("/")[3]
            }/orderstoassign/${order.publicKey.toString()}`}
            className="w-full mt-4"
          >
            {" "}
            {order.status !== "DELIVERED" && (
              <Button className="w-full">Assign Logistic For This Order</Button>
            )}
          </Link>
        </CardFooter>
      )}
      {order.seller_pda.toString() === seller?.publicKey.toString() &&
        order.status !== "DELIVERED" && (
          <Button onClick={handleRecieveProduct} disabled={loading || order.status !== "DELIVERED"}>
            {!loading ? "Recieve Product" : "Recieving"}
          </Button>
        )}
      {order.status === "DELIVERED" && user?.role==="SELLER" &&(
        <Button onClick={handleRecieveProduct} disabled>
          Product Recieved
        </Button>
      )}
    </Card>
  );
};

export default OrderCard;
