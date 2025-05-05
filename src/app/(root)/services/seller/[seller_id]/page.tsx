"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Marker, Popup } from "react-leaflet";
import { ISeller, IOrder } from "@/utils/types";
import { getProvider } from "@/services/blockchain";
import {
  getSeller,
  withdrawSellerBalance,
} from "@/services/seller/sellerService";
import { getAllMyOrders } from "@/services/order/orderService";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderCard from "@/components/cards/order-card";
import SellerProductListPage from "@/pages/SellerProductListPage";
import { toast } from "sonner";
import WithdrawDrawer from "@/components/drawer/withdraw-drawer";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const Map = dynamic(
  () => import("@/components/shared/map").then((mod) => mod.Map),
  { ssr: false }
);
const SellerDetailPage = ({
  params: paramsPromise,
}: {
  params: Promise<{ seller_id: string }>;
}) => {
  const params = React.use(paramsPromise);
  const id = params.seller_id;
  const [seller, setSeller] = useState<ISeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isWithdrawDrawerOpen, setIsWithdrawDrawerOpen] = useState(false); // State for WithdrawDrawer
  const [amount, setAmount] = useState<number>(0);
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const fetchOrders = async () => {
    if (!program || !seller) return;
    const o = await getAllMyOrders(program, seller.publicKey.toString());
    setOrders(o);
  };
  const fetchSellerAndOrders = async () => {
    try {
      if (!program || !publicKey) return;

      const sellerData = await getSeller(program, id);
      setSeller(sellerData);
    } catch (err) {
      setError("Failed to load seller or order details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSellerAndOrders();
    console.log(seller);
  }, [program, id]);

  async function handleWithdrawBalance() {
    try {
      if (!program || !publicKey || !id) return;
      setLoading(true); // Set loading state to true
      const tx = await withdrawSellerBalance(
        program,
        id.toString(),
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
      setAmount(0); // Reset amount after successful withdrawal
      setIsWithdrawDrawerOpen(false); // Close the drawer
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Reset loading state
      fetchSellerAndOrders();
      handleCloseWithdrawDrawer();
    }
  }
  const handleCloseWithdrawDrawer = () => {
    setIsWithdrawDrawerOpen(!isWithdrawDrawerOpen); // Function to close the drawer
  };
  if (error || !seller)
    return <div className="container mx-auto p-6 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto pt-24 p-6 space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">
          {seller?.name || <Skeleton className="h-8 w-48" />}
        </h1>
        <Link href={`/services/seller/${id.toString()}/searchfororder`}>
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Create New Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Seller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              seller && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p>
                      {seller.owner.toBase58().slice(0, 8)}...
                      {seller.owner.toBase58().slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registered</p>
                    <p>
                      {new Date(
                        Number(seller.registered_at) * 1000
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Orders</p>
                    <p>{seller.order_count.toString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p>{seller.contact_info}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Description</p>
                    <p>{seller.description}</p>
                  </div>
                  <div className="">
                    <p className="text-muted-foreground">Balance</p>
                    <p>{Number(seller.balance.toString())/LAMPORTS_PER_SOL}</p>
                  </div>
                </div>
              )
            )}
          </CardContent>
          {seller?.balance > 0 && (
            <CardFooter>
              <WithdrawDrawer
                balance={Number(seller.balance)}
                handleWithdraw={handleWithdrawBalance}
                amount={amount}
                setAmount={setAmount}
                handleClose={handleCloseWithdrawDrawer} // Pass handleClose
                loading={loading} // Pass loading state
              />{" "}
            </CardFooter>
          )}
        </Card>

        <Card className="h-96">
          <CardHeader>
            <CardTitle>Seller Location</CardTitle>
          </CardHeader>
          <CardContent>
            {seller ? (
              <div className="h-72 rounded-lg overflow-hidden">
                <Map
                  center={[seller.latitude, seller.longitude]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <Marker position={[seller.latitude, seller.longitude]}>
                    <Popup>{seller.name}</Popup>
                  </Marker>
                </Map>
              </div>
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="myproducts">
        <TabsList className="grid w-[400px] mx-auto grid-cols-2">
          <TabsTrigger value="myproducts">My Products</TabsTrigger>
          <TabsTrigger value="orders">orders</TabsTrigger>
        </TabsList>
        <TabsContent value="myproducts">
          <SellerProductListPage sellerPda={seller.publicKey.toString()} />
        </TabsContent>
        <TabsContent value="orders">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Orders</h2>
              <Button variant="outline" onClick={() => fetchOrders()}>
                View All Orders
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <OrderCard
                    key={order.publicKey.toString()}
                    logisticPda={order.logistic_pda.toString()}
                    seller={seller!}
                    order={order}
                  />
                ))
              ) : (
                <p>No orders found for this seller.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export default SellerDetailPage;
