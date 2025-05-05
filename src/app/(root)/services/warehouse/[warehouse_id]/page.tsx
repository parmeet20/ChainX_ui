"use client";

import { getProvider } from "@/services/blockchain";
import {
  getWarehouse,
  withdrawWarehouseBalance,
} from "@/services/warehouse/warehouseService";
import { IOrder, IProduct, IWarehouse } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Map } from "@/components/shared/map";
import { Marker } from "react-leaflet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProductDrawer } from "@/components/drawer/ProductDrawer";
import { getProduct } from "@/services/product/productService";
import {
  Barcode,
  Boxes,
  CalendarDays,
  Contact2,
  Factory,
  Globe,
  ListOrderedIcon,
  MapPin,
  Package,
  Scale,
  ShieldCheck,
  Truck,
  TruckIcon,
  Warehouse,
} from "lucide-react";
import { SiSolana } from "react-icons/si";
import { getAllWarehouseOrders } from "@/services/order/orderService";
import OrderCard from "@/components/cards/order-card";
import WithdrawDrawer from "@/components/drawer/withdraw-drawer";
import useStore from "@/store/user_store";
import { createLogistic } from "@/services/logistic/logisticService";
import { toast } from "sonner";
import { LogisticDrawer } from "@/components/shared/dialog/LogisticDrawer";
import { Lens } from "@/components/ui/lens";
import Image from "next/image";

const WarehousPdaPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [warehouse, setWarehouse] = useState<IWarehouse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWithdrawDrawerOpen, setIsWithdrawDrawerOpen] = useState(false);
  const [isLogisticDrawerOpen, setIsLogisticDrawerOpen] = useState(false);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [hovering, setHovering] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const params = useParams<{ warehouse_id: string }>();
  const warehouse_id = params?.warehouse_id;

  const program = useMemo(() => {
    if (!publicKey) return null;
    return getProvider(publicKey, signTransaction, sendTransaction);
  }, [publicKey, sendTransaction, signTransaction]);

  const { user } = useStore();

  const fetchData = async () => {
    if (!program || !publicKey || !warehouse_id) {
      setLoading(false);
      return;
    }
    try {
      const w = await getWarehouse(program, warehouse_id);
      if (!w || !w.product_pda) {
        throw new Error("Warehouse or product_pda not found");
      }
      setWarehouse(w);
      const p = await getProduct(program, w.product_pda.toString());
      if (!p) {
        throw new Error("Product not found");
      }
      setProduct(p);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  function getShortenedString(product: string) {
    const str = product.toString();
    if (str.length <= 8) return str;
    return str.slice(0, 4) + "...." + str.slice(-4);
  }

  async function handleBecomeLogistic(
    name: string,
    role: string,
    stock: number,
    latitude: number,
    longitude: number,
    contact_info: string
  ) {
    try {
      setLoading(true);
      if (!program || !publicKey || !warehouse) return;
      const tx = await createLogistic(
        program,
        name,
        role,
        stock,
        latitude,
        longitude,
        contact_info,
        warehouse.publicKey.toString(),
        publicKey
      );
      toast("Logistic Partner Created!", {
        description: "Transaction confirmed successfully",
        action: (
          <a href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}>
            Signature
          </a>
        ),
      });
      setIsLogisticDrawerOpen(false);
    } catch (error) {
      console.error(error);
      toast("Error Creating Logistic", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  const fetchOrders = async () => {
    if (!program || !warehouse) return;
    const o = await getAllWarehouseOrders(
      program,
      warehouse.publicKey.toString()
    );
    setOrders(o);
  };

  async function handleWithdrawBalance() {
    try {
      if (!program || !publicKey || !warehouse_id) return;
      setWithdrawLoading(true);
      const tx = await withdrawWarehouseBalance(
        program,
        warehouse_id.toString(),
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
      setAmount(0);
      setIsWithdrawDrawerOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setWithdrawLoading(false);
      fetchData();
      fetchOrders();
      handleCloseWithdrawDrawer();
    }
  }

  const handleCloseWithdrawDrawer = () => {
    setIsWithdrawDrawerOpen(!isWithdrawDrawerOpen);
  };

  useEffect(() => {
    fetchData();
    fetchOrders();
  }, [program, publicKey, warehouse_id]);

  if (loading) {
    return (
      <div className="max-w-6xl pt-24 mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="max-w-6xl pt-24 mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Warehouse not found</h1>
        <p className="text-muted-foreground">ID: {warehouse_id}</p>
      </div>
    );
  }
  if (!product) {
    return <>Product Not Found</>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 pt-24 space-y-8 dark:bg-slate-900 min-h-screen">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Warehouse className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight dark:text-white">
            {warehouse.name}
          </h1>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            ID: {warehouse.warehouse_id.toString()}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground dark:text-slate-300">
          {warehouse.description}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        {user?.role === "WAREHOUSE" &&
          user.owner.toString() === publicKey?.toString() && (
            <TabsList className="ggrid sm:w-[450px] mx-4 sm:mx-auto sm:grid-cols-2">
              <TabsTrigger value="overview" className="text-sm">
                <Globe className="w-4 h-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="text-sm">
                <Package className="w-4 h-4 mr-2" /> Products
              </TabsTrigger>
              <TabsTrigger value="financials" className="text-sm">
                <SiSolana className="w-4 h-4 mr-2" /> Financials
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-sm">
                <ListOrderedIcon className="w-4 h-4 mr-2" /> Orders
              </TabsTrigger>
            </TabsList>
          )}

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-lg dark:border-slate-700">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Location
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Latitude: {warehouse.latitude}, Longitude:{" "}
                  {warehouse.longitude}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] p-0">
                <Map
                  center={[warehouse.latitude, warehouse.longitude]}
                  zoom={13}
                  className="h-full w-full rounded-b-lg"
                >
                  <Marker
                    position={[warehouse.latitude, warehouse.longitude]}
                  />
                </Map>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" /> Warehouse Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <DetailItem
                    icon={<Boxes className="h-5 w-5" />}
                    label="Capacity"
                    value={`${Number(warehouse.warehouse_size)} sq.ft`}
                  />
                  <DetailItem
                    icon={<Truck className="h-5 w-5" />}
                    label="Logistics"
                    value={Number(warehouse.logistic_count)}
                  />
                  <DetailItem
                    icon={<CalendarDays className="h-5 w-5" />}
                    label="Established"
                    value={new Date(
                      Number(warehouse.created_at) * 1000
                    ).toLocaleDateString()}
                  />
                  <DetailItem
                    icon={<Scale className="h-5 w-5" />}
                    label="Products Stored"
                    value={Number(warehouse.product_count)}
                  />
                </CardContent>
                {user!.role === "LOGISTICS" && (
                  <CardFooter>
                    <Button onClick={() => setIsLogisticDrawerOpen(true)}>
                      <TruckIcon className="mr-2 h-4 w-4" />
                      Become Logistic Of This Warehouse
                    </Button>
                    <LogisticDrawer
                      isOpen={isLogisticDrawerOpen}
                      onOpenChange={setIsLogisticDrawerOpen}
                      onSubmit={(data) =>
                        handleBecomeLogistic(
                          data.name,
                          data.role,
                          data.stock,
                          data.latitude,
                          data.longitude,
                          data.contact_info
                        )
                      }
                      loading={loading}
                    />
                  </CardFooter>
                )}
              </Card>

              <Card className="dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Contact2 className="h-5 w-5" /> Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-muted-foreground text-sm font-mono break-words">
                      {warehouse.owner.toString()}
                    </p>
                  </div>
                  <Separator className="dark:bg-slate-700" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Contact Details</p>
                    <p className="text-muted-foreground text-sm">
                      {warehouse.contact_details}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> Stored Product
                </CardTitle>
                <Button onClick={() => setIsDrawerOpen(true)}>
                  Purchase Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative aspect-square rounded-xl bg-muted/50 p-6 overflow-hidden">
                  <div className="absolute top-4 right-4 flex gap-2 z-[500]">
                    <Badge variant="secondary">
                      Stock: {Number(warehouse.product_count)}
                    </Badge>
                    <Badge
                      variant={
                        product.quality_checked ? "default" : "destructive"
                      }
                    >
                      {product.quality_checked
                        ? "Quality Verified"
                        : "Pending Inspection"}
                    </Badge>
                  </div>
                  {product.product_image ? (
                    <Lens hovering={hovering} setHovering={setHovering}>
                      <Image
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "";
                          target.className = "hidden";
                        }}
                      />
                    </Lens>
                  ) : (
                    <Package className="h-full w-full text-muted-foreground/20" />
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold dark:text-white">
                      {product.product_name}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {product.product_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                      icon={<SiSolana className="h-5 w-5" />}
                      label="Price"
                      value={`{Number(product.product_price)} SOL`}
                    />
                    <DetailItem
                      icon={<Barcode className="h-5 w-5" />}
                      label="Batch Number"
                      value={product.batch_number}
                    />
                    <DetailItem
                      icon={<Factory className="h-5 w-5" />}
                      label="Factory ID"
                      value={product.factory_id.toString()}
                    />
                    <DetailItem
                      icon={<ShieldCheck className="h-5 w-5" />}
                      label="Inspection ID"
                      value={product.inspection_id.toString()}
                    />
                    <DetailItem
                      icon={<CalendarDays className="h-5 w-5" />}
                      label="Manufacture Date"
                      value={new Date(
                        Number(product.created_at) * 1000
                      ).toLocaleDateString()}
                    />
                    <DetailItem
                      icon={<SiSolana className="h-5 w-5" />}
                      label="MRP"
                      value={`$${Number(product.mrp)}`}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold dark:text-white">
                      Blockchain Information
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <DetailItem
                        icon={<span className="text-sm">🆔</span>}
                        label="Product PDA"
                        value={getShortenedString(product.publicKey.toString())}
                        truncate
                      />
                      <DetailItem
                        icon={<span className="text-sm">🔒</span>}
                        label="Inspector PDA"
                        value={getShortenedString(
                          product.inspector_pda.toString()
                        )}
                        truncate
                      />
                      <DetailItem
                        icon={<span className="text-sm">💸</span>}
                        label="Inspection Fee"
                        value={product.inspection_fee_paid ? "Paid" : "Pending"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <Card className="dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SiSolana className="h-5 w-5" /> Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold dark:text-white">
                  Warehouse Finances
                </h3>
                <div className="space-y-2">
                  <DetailItem
                    icon={<SiSolana className="h-5 w-5" />}
                    label="Current Balance"
                    value={`${Number(warehouse.balance)} SOL`}
                  />
                  <DetailItem
                    icon={<SiSolana className="h-5 w-5" />}
                    label="Total Product Value"
                    value={`$${
                      Number(product.product_price) *
                      Number(warehouse.product_count)
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold dark:text-white">
                  Product Economics
                </h3>
                <div className="space-y-2">
                  <DetailItem
                    icon={<Scale className="h-5 w-5" />}
                    label="Unit Price"
                    value={`${Number(product.product_price)} SOL`}
                  />
                  <DetailItem
                    icon={<Boxes className="h-5 w-5" />}
                    label="Stock Value"
                    value={`$${
                      Number(product.mrp) * Number(warehouse.product_count)
                    }`}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <WithdrawDrawer
                balance={Number(warehouse.balance)}
                handleWithdraw={handleWithdrawBalance}
                amount={amount}
                setAmount={setAmount}
                handleClose={handleCloseWithdrawDrawer}
                loading={withdrawLoading}
              />
            </CardFooter>
          </Card>
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
              ) : orders!.length > 0 ? (
                orders!.map((order) => (
                  <OrderCard key={order.publicKey.toString()} order={order} />
                ))
              ) : (
                <p>No orders found for this seller.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ProductDrawer
        isOpen={isDrawerOpen}
        product_id={warehouse.product_id}
        product_pda={warehouse.product_pda.toString()}
        factory_id={warehouse.factory_id}
        warehouse_id={warehouse.warehouse_id}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
  truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  truncate?: boolean;
}) => (
  <div className="flex items-center gap-3">
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`font-medium dark:text-white" ${truncate ? "truncate" : ""}`}
      >
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export default WarehousPdaPage;
