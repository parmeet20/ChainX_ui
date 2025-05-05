"use client";
import { ISeller } from "@/utils/types";
import { PlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { SellerCard } from "@/components/cards/seller-card";
import { Button } from "@/components/ui/button";

interface SellerListProps {
  sellers?: ISeller[];
}

const SellerList = ({ sellers = [] }: SellerListProps) => {
  return (
    <div className="space-y-4 relative">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 backdrop-blur-sm pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Sellers ({sellers.length})
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={"/services/createseller"}>
                  <Button
                    size="icon"
                    className="rounded-full shadow-xl w-10 h-10 hover:scale-105 transition-transform"
                  >
                    <PlusIcon className="w-6 h-6" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create new seller</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-4">
        {sellers.map((seller) => (
          <SellerCard key={seller.seller_id.toString()} seller={seller} />
        ))}
      </div>

      {sellers.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <PlusIcon className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            No sellers found
          </h3>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Get started by creating a new seller profile
          </p>
        </div>
      )}
    </div>
  );
};
export default SellerList;
