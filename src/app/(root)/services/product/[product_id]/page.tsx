"use client";

import { getProvider } from "@/services/blockchain";
import { getCustomerProd } from "@/services/customer/CustomerService";
import { getFactory } from "@/services/factory/factoryService";
import { getInspectorDetails } from "@/services/inspector/inspectorService";
import { getProduct } from "@/services/product/productService";
import { getSeller } from "@/services/seller/sellerService";
import { getWarehouseByProdPda } from "@/services/warehouse/warehouseService";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added for better display of public key
import { QRCodeSVG } from 'qrcode.react';

import {
  MapPin,
  Factory,
  Warehouse as WarehouseIcon, // Renamed to avoid conflict
  User,
  ClipboardCopy, // For copying the public key
  Package, // For product details
  DollarSign, // For MRP
  FileText, // For Description
  Calendar, // For Dates
  Info, // For general info/notes
  Phone, // For contact info
  CheckCircle, // For quality verified
  XCircle, // For pending verification/failed inspection
  Building, // Generic building icon if needed
  Barcode, // For batch number
} from "lucide-react";

import {
  ICustomerProduct,
  IFactory,
  IProduct,
  IProductInspector,
  ISeller,
  IWarehouse,
} from "@/utils/types";

import { useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Added for copy button

// Helper component for displaying details with icons
const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
    <dt className="flex items-center gap-2 font-medium text-muted-foreground min-w-[150px]">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </dt>
    <dd className="mt-1 sm:mt-0 text-foreground break-words">{value}</dd>
  </div>
);

const FullProductDetails = () => {
  const params = useParams<{ product_id: string }>();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [customerProduct, setCustomerProduct] =
    useState<ICustomerProduct | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [inspector, setInspector] = useState<IProductInspector | null>(null);
  const [factory, setFactory] = useState<IFactory | null>(null);
  const [warehouse, setWarehouse] = useState<IWarehouse | null>(null);
  const [seller, setSeller] = useState<ISeller | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

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

  const product_id = params?.product_id;

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!program || !publicKey || !product_id) {
        // Wait for program and publicKey to be available
        if (!publicKey) toast.info("Please connect your wallet.");
        setIsLoading(!program || !publicKey || !product_id); // Keep loading if prerequisites aren't met
        return;
      }

      setIsLoading(true); // Start loading
      try {
        console.log(`Workspaceing customer product for ID: ${product_id}`);
        const custProd = await getCustomerProd(program, product_id.toString());
        if (!custProd) throw new Error("Customer product not found.");
        setCustomerProduct(custProd);
        console.log("Customer Product:", custProd);

        console.log(
          `Workspaceing product details for PDA: ${custProd.product_pda.toString()}`
        );
        const prod = await getProduct(program, custProd.product_pda.toString());
        if (!prod) throw new Error("Product details not found.");
        setProduct(prod);
        console.log("Product Details:", prod);

        console.log(
          `Workspaceing inspector details for PDA: ${prod.inspector_pda.toString()}`
        );
        // Wrap in try-catch as inspector might not always exist or be linked yet
        try {
          const insptor = await getInspectorDetails(
            program,
            prod.inspector_pda.toString()
          );
          setInspector(insptor);
          console.log("Inspector Details:", insptor);
        } catch (inspectorError) {
          console.warn("Could not fetch inspector details:", inspectorError);
          setInspector(null); // Ensure it's null if fetch fails
        }

        console.log(
          `Workspaceing factory details for PDA: ${prod.factory_pda.toString()}`
        );
        const fact = await getFactory(program, prod.factory_pda.toString());
        if (!fact) throw new Error("Factory details not found.");
        setFactory(fact);
        console.log("Factory Details:", fact);

        console.log(
          `Workspaceing seller details for PDA: ${custProd.seller_pda.toString()}`
        );
        const sellr = await getSeller(program, custProd.seller_pda.toString());
        if (!sellr) throw new Error("Seller details not found.");
        setSeller(sellr);
        console.log("Seller Details:", sellr);

        // Fetch warehouse using product PDA from customerProduct (as originally intended)
        console.log(
          `Workspaceing warehouse details for Product PDA: ${custProd.product_pda.toString()}`
        );
        // Wrap in try-catch as warehouse might not always exist or be linked yet
        try {
          const wreHous = await getWarehouseByProdPda(
            program,
            custProd.product_pda.toString()
          );
          setWarehouse(wreHous);
          console.log("Warehouse Details:", wreHous);
        } catch (warehouseError) {
          console.warn("Could not fetch warehouse details:", warehouseError);
          setWarehouse(null); // Ensure it's null if fetch fails
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
        toast.error(`Error: ${error || "Failed to load product data."}`);
      } finally {
        setIsLoading(false); // Stop loading regardless of outcome
      }
    };

    // Fetch only when program and publicKey are available
    if (program && publicKey && product_id) {
      fetchProductDetails();
    } else {
      // Set loading to true if we are waiting for program/publicKey
      setIsLoading(!program || !publicKey);
    }

    // Re-fetch if program or publicKey changes (e.g., wallet connection/disconnection)
  }, [program, publicKey, product_id]); // Added dependencies

  // Function to copy public key
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch((err) => {
        toast.error("Failed to copy.");
        console.log(err);
      });
  };

  useEffect(() => {
    // Ensure window is available (client-side only)
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center tracking-tight">
        Product Traceability Details
      </h1>

      {isLoading ? (
        // Modern Skeleton Layout
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Skeleton */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-card to-muted/30 p-6 border-border/50 shadow-sm">
            <Skeleton className="h-8 w-3/5 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-6" />
            <div className="space-y-5">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Separator className="my-6" />
            <Skeleton className="h-10 w-full" />
          </Card>
          {/* Other Skeletons */}
          <Skeleton className="h-[200px] w-full lg:col-span-1 rounded-lg shadow-sm" />
          <Skeleton className="h-[200px] w-full lg:col-span-1 rounded-lg shadow-sm" />
          <Skeleton className="h-[200px] w-full lg:col-span-1 rounded-lg shadow-sm" />
          <Skeleton className="h-[200px] w-full lg:col-span-1 rounded-lg shadow-sm" />
        </div>
      ) : !product || !customerProduct || !factory || !seller ? (
        // Error or Not Found State
        <Alert variant="destructive" className="lg:col-span-3">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load all required product details. Please ensure the
            product ID is correct and try again. If the issue persists, required
            data might be missing on the blockchain.
          </AlertDescription>
        </Alert>
      ) : (
        // Main Content Grid
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Card - Spanning full width on large screens */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-card to-muted/30 p-6 border-border/50 shadow-sm">
            <CardHeader className="p-0 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-2xl md:text-3xl font-semibold flex items-center gap-3">
                  <Package className="h-7 w-7 text-primary" />
                  {product.product_name}
                </CardTitle>
                <Badge
                  variant={product.quality_checked ? "default" : "destructive"}
                  className="flex items-center gap-1.5 py-1 px-3 text-sm w-fit" // Adjusted badge style
                >
                  {product.quality_checked ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {product.quality_checked
                    ? "Quality Verified"
                    : "Pending Verification"}
                </Badge>
              </div>
              <CardDescription className="mt-2 text-base">
                Product Overview & Blockchain Record
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="space-y-4 mb-6">
                {" "}
                {/* Use definition list for semantics */}
                <DetailItem
                  icon={Barcode}
                  label="Batch Number"
                  value={product.batch_number}
                />
                <DetailItem
                  icon={DollarSign}
                  label="MRP"
                  value={`$${product.mrp.toString()}`}
                />
                <DetailItem
                  icon={FileText}
                  label="Description"
                  value={
                    product.product_description || "No description provided."
                  }
                />
                <DetailItem
                  icon={Calendar}
                  label="Production Date"
                  value={new Date(
                    Number(product.created_at) * 1000
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              </dl>

              <Separator className="my-6" />

              <Alert className="bg-muted/50 border-dashed border-muted-foreground/30">
                <Info className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                  Blockchain Record (Product PDA)
                </AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <code className="text-xs break-all flex-grow p-2 bg-background rounded border">
                    {product.publicKey.toString()}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(product.publicKey.toString())
                    }
                    className="flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    <span className="sr-only">Copy Public Key</span>
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="p-6 border-border/50 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Share Product
              </CardTitle>
              <CardDescription>
                Scan QR code to view this product
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg border border-border">
                <QRCodeSVG
                  value={currentUrl}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                  includeMargin={false}
                />
              </div>

              <div className="w-full flex items-center gap-2">
                <div className="flex-1 text-sm text-muted-foreground break-all">
                  {currentUrl}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(currentUrl)}
                  className="flex-shrink-0"
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Factory Information */}
          {factory && (
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border-border/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Factory className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg">{factory.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>
                    Location: {factory.latitude.toFixed(4)},{" "}
                    {factory.longitude.toFixed(4)}
                    {/* Potential enhancement: Add a link to a map */}
                  </span>
                </div>
                {factory.contact_info && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Contact: {factory.contact_info}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-dashed mt-3">
                  <ClipboardCopy className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs break-all text-muted-foreground">
                    PDA: {factory.publicKey.toString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warehouse Information */}
          {warehouse && (
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border-border/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <WarehouseIcon className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Storage Facility
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>
                    Location: {warehouse.latitude.toFixed(4)},{" "}
                    {warehouse.longitude.toFixed(4)}
                  </span>
                </div>
                {warehouse.contact_details && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Contact: {warehouse.contact_details}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-dashed mt-3">
                  <ClipboardCopy className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs break-all text-muted-foreground">
                    PDA: {warehouse.publicKey.toString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Information */}
          {seller && (
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border-border/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                {/* Using Building icon for Seller for variety */}
                <Building className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg">{seller.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Authorized Seller
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>
                    Location: {seller.latitude.toFixed(4)},{" "}
                    {seller.longitude.toFixed(4)}
                  </span>
                </div>
                {seller.contact_info && (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>Contact: {seller.contact_info}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-dashed mt-3">
                  <ClipboardCopy className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs break-all text-muted-foreground">
                    PDA: {seller.publicKey.toString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inspector Information */}
          {inspector && (
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border-border/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <User className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg">{inspector.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Quality Inspector
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant={
                      inspector.inspection_outcome === "PASS"
                        ? "secondary"
                        : "destructive"
                    }
                    className="gap-1.5 bg-green-400"
                  >
                    {inspector.inspection_outcome === "PASS" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {inspector.inspection_outcome || "N/A"}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(
                      Number(inspector.inspection_date) * 1000
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {inspector.notes && (
                  <div className="flex items-start gap-2 text-sm pt-2 border-t border-dashed mt-3">
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-muted-foreground italic">
                      {inspector.notes}
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-dashed mt-3">
                  <ClipboardCopy className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs break-all text-muted-foreground">
                    PDA: {inspector.publicKey.toString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Placeholder if some optional data is missing */}
          {!warehouse &&
            product && ( // Example: Show if warehouse data is missing but product loaded
              <Card className="border-dashed border-muted-foreground/50 bg-muted/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <WarehouseIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div>
                    <CardTitle className="text-lg text-muted-foreground">
                      Warehouse Not Recorded
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      No warehouse data linked to this product.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Optionally add more info or leave blank */}
                </CardContent>
              </Card>
            )}
          {!inspector &&
            product && ( // Example: Show if inspector data is missing but product loaded
              <Card className="border-dashed border-muted-foreground/50 bg-muted/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <User className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div>
                    <CardTitle className="text-lg text-muted-foreground">
                      Inspector Not Recorded
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      No inspection data linked to this product.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Optionally add more info or leave blank */}
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
};

export default FullProductDetails;
