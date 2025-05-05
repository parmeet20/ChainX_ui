"use client";
import { Card } from "@/components/ui/card";
import { Factory } from "lucide-react";
import { IFactory } from "@/utils/types";
import { Button } from "../ui/button";
import Link from "next/link";

interface FactoryCardProps {
  factory: IFactory;
}

export const FactoryCard = ({ factory }: FactoryCardProps) => {
  return (
    <Card className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Factory className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {factory.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {factory.description}
          </p>
        </div>
      </div>
      <Link href={`/services/factory/${factory.publicKey}`}>
        <Button className="w-full">Details</Button>
      </Link>
    </Card>
  );
};
