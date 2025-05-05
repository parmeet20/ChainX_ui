"use client";
import { IFactory } from "@/utils/types";
import { FactoryCard } from "../cards/FactoryCard";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface FactoryListProps {
  factories: IFactory[];
}

export const FactoryList = ({ factories }: FactoryListProps) => {
  return (
    <div className="space-y-4 relative">
      {/* Sticky Header with Create Button */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 backdrop-blur-sm pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Factories ({factories.length})
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={"/services/createfactory"}>
                  <Button
                    size="icon"
                    className="rounded-full shadow-xl w-10 h-10 hover:scale-105 transition-transform"
                  >
                    <PlusIcon className="w-6 h-6" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create new factory</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Floating Mobile Button */}
      <div className="fixed bottom-6 right-6 z-20"></div>

      {/* Factory List */}
      <div className="space-y-4">
        {factories.map((factory) => (
          <FactoryCard key={factory.factory_id} factory={factory} />
        ))}
      </div>

      {/* Empty State */}
      {factories.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <PlusIcon className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
            No factories found
          </h3>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Get started by creating a new factory
          </p>
        </div>
      )}
    </div>
  );
};
