import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WarehouseListForLogisticsPage from "../WarehouseListForLogisticsPage";
import LogisticList from "../LogisticList";

const LogisticServicePage = () => {
  return (
    <Tabs defaultValue="BecomeLogistic" className=" pt-24">
      <TabsList className="grid sm:w-[400px] mx-4 sm:mx-auto sm:grid-cols-2">
        <TabsTrigger value="BecomeLogistic">Become Logistic</TabsTrigger>
        <TabsTrigger value="MyLogistics">MyLogistics</TabsTrigger>
      </TabsList>
      <TabsContent value="BecomeLogistic">
        <WarehouseListForLogisticsPage />
      </TabsContent>
      <TabsContent value="MyLogistics">
        <LogisticList />
      </TabsContent>
    </Tabs>
  );
};

export default LogisticServicePage;
