import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Truck, User, Wallet } from "lucide-react";
import { IWarehouse } from "@/utils/types";
import { BN } from "@coral-xyz/anchor";
import Link from "next/link";
import useStore from "@/store/user_store";

interface WarehouseCardProps {
  warehouse: IWarehouse;
  seller_pda?: string;
}

export function WarehouseCard({
  warehouse,
  seller_pda,
}: WarehouseCardProps) {
  const formatBN = (bn: BN) => bn.toString();
  const { user } = useStore();
  const formatDate = (bn: BN) =>
    new Date(bn.toNumber() * 1000).toLocaleDateString();

  return (
    <Card className="w-full max-w-md rounded-xl transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="rounded-t-xl bg-muted/40 border-b p-6">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {warehouse.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {warehouse.description}
            </p>
          </div>
          <Badge variant="secondary" className="h-fit">
            ID: {formatBN(warehouse.warehouse_id)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="bg-muted rounded-full p-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Location</p>
            <p className="text-sm text-muted-foreground">
              {warehouse.latitude.toFixed(4)}, {warehouse.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Inventory</p>
              <p className="text-sm text-muted-foreground">
                {formatBN(warehouse.product_count)} units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Logistics</p>
              <p className="text-sm text-muted-foreground">
                {formatBN(warehouse.logistic_count)} vehicles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Balance</p>
              <p className="text-sm text-muted-foreground">
                {formatBN(warehouse.balance)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-full p-2">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Contact</p>
              <p className="text-sm text-muted-foreground truncate">
                {warehouse.contact_details}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 border-t p-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Created: {formatDate(warehouse.created_at)}
        </div>
        <Link
          href={`${
            user?.role === "SELLER"
              ? `/services/warehouse/${warehouse.publicKey.toString()}/product/${warehouse.product_pda.toString()}/${seller_pda?.toString()}}`
              : `/services/warehouse/${warehouse.publicKey.toString()}`
          }`}
        >
          {" "}
          <Button variant="secondary" size="sm" className="rounded-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
