"use client";
import { Card } from "@/components/ui/card";
import { StoreIcon } from "lucide-react"; // Assuming you have a StoreIcon
import { ISeller } from "@/utils/types";
import { Button } from "../ui/button";
import Link from "next/link";

interface SellerCardProps {
  seller: ISeller;
}

export const SellerCard = ({ seller }: SellerCardProps) => {
  return (
    <Card className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <StoreIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {seller.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {seller.description}
          </p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              Products: {seller.products_count.toString()}
            </span>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              Orders: {seller.order_count.toString()}
            </span>
          </div>
        </div>
      </div>
      <Link href={`/services/seller/${seller.publicKey.toString()}`}>
        <Button className="w-full mt-4">View Store</Button>
      </Link>
    </Card>
  );
};
