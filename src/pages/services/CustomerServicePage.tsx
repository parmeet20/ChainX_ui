import React from "react";
import CustomerProductsList from "../CustomerProductList";
import AvailableProductsForSaleToCustomerList from "../AvailableProductsForSaleToCustomerList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CustomerServicePage = () => {
  return (
    <div className="pt-24">
      <Tabs defaultValue="Buy new Product" className="w-full">
        <TabsList className="grid w-[400] grid-cols-2  mx-auto">
          <TabsTrigger value="Buy new Product">Buy new Product</TabsTrigger>
          <TabsTrigger value="MyProducts">MyProducts</TabsTrigger>
        </TabsList>
        <TabsContent value="Buy new Product">
          <AvailableProductsForSaleToCustomerList />
        </TabsContent>
        <TabsContent value="MyProducts">
          <CustomerProductsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerServicePage;
