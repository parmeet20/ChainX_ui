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
import { IFactory, IProduct } from "@/utils/types";
import { ProductCard } from "@/components/cards/product-card";
import { getProvider } from "@/services/blockchain";
import {
  getFactory,
  withdrawFactoryBalance,
} from "@/services/factory/factoryService";
import { getAllFactoryProducts } from "@/services/product/productService";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import WithdrawDrawer from "@/components/drawer/withdraw-drawer";
import { toast } from "sonner";

const Map = dynamic(
  () => import("@/components/shared/map").then((mod) => mod.Map),
  { ssr: false }
);

const FactoryDetailPage = ({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) => {
  const params = React.use(paramsPromise);
  const id = params.id; // Correctly destructure id from params
  const [factory, setFactory] = useState<IFactory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawDrawerOpen, setIsWithdrawDrawerOpen] = useState(false); // State for WithdrawDrawer
  const [amount, setAmount] = useState<number>(0);
  const [products, setProducts] = useState<IProduct[]>([]);
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const fetchFactoryAndProducts = async () => {
    try {
      if (!program) return;

      // Fetch factory data
      const factoryData = await getFactory(program, id);
      setFactory(factoryData);

      // Fetch products using the factory_id from the fetched data
      if (factoryData?.factory_id) {
        const factoryProducts = await getAllFactoryProducts(
          program,
          factoryData.publicKey.toString()
        );
        setProducts(factoryProducts || []);
      }
    } catch (err) {
      setError("Failed to load factory or product details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  async function handleWithdrawBalance() {
    try {
      if (!program || !publicKey || !id) return;
      setLoading(true); // Set loading state to true
      const tx = await withdrawFactoryBalance(
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
      fetchFactoryAndProducts();
      handleCloseWithdrawDrawer();
    }
  }
  const handleCloseWithdrawDrawer = () => {
    setIsWithdrawDrawerOpen(!isWithdrawDrawerOpen); // Function to close the drawer
  };

  useEffect(() => {
    fetchFactoryAndProducts();
  }, [program, id]);

  if (error || !factory)
    return <div className="container mx-auto p-6 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto pt-24 p-6 space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">
          {factory?.name || <Skeleton className="h-8 w-48" />}
        </h1>
        <Link
          href={`/services/factory/${factory?.publicKey?.toString()}/product/create`}
        >
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Manufacture New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Factory Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              factory && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p>
                      {factory.owner.toBase58().slice(0, 8)}...
                      {factory.owner.toBase58().slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Established</p>
                    <p>
                      {new Date(factory.created_at * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Products Created</p>
                    <p>{factory.product_count.toString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Factory Balance</p>
                    <p>{(factory.balance / LAMPORTS_PER_SOL).toString()} SOL</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Description</p>
                    <p>{factory.description}</p>
                  </div>
                </div>
              )
            )}
          </CardContent>
          {factory?.balance > 0 && (
            <CardFooter>
              <WithdrawDrawer
                balance={Number(factory.balance)}
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
            <CardTitle>Factory Location</CardTitle>
          </CardHeader>
          <CardContent>
            {factory ? (
              <div className="h-72 rounded-lg overflow-hidden">
                <Map
                  center={[factory.latitude, factory.longitude]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <Marker position={[factory.latitude, factory.longitude]}>
                    <Popup>{factory.name}</Popup>
                  </Marker>
                </Map>
              </div>
            ) : (
              <Skeleton className="h-72 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Manufactured Products</h2>
          <Button variant="outline">View All Products</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.publicKey.toString()}
                product={product}
              />
            ))
          ) : (
            <p>No products found for this factory.</p>
          )}
        </div>
      </div>
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

export default FactoryDetailPage;
