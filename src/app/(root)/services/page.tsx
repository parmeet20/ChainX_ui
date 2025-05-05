"use client";
import CustomerServicePage from "@/pages/services/CustomerServicePage";
import FactoryServicePage from "@/pages/services/FactoryServicePage";
import LogisticServicePage from "@/pages/services/LogisticServicePage";
import ProductInspectorService from "@/pages/services/ProductInspectorService";
import SellerServicePage from "@/pages/services/SellerServicePage";
import WarehouseServicePage from "@/pages/services/WarehouseServicePage";
import useStore from "@/store/user_store";
import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";

const ServicePage = () => {
  const { publicKey } = useWallet();
  const { user } = useStore();
  if (!publicKey) {
    return <>CONNECT WALLET TO SEE THIS PAGE</>;
  }
  if (user?.role === "FACTORY") {
    return (
      <>
        <FactoryServicePage />
      </>
    );
  }
  if (user?.role === "INSPECTOR") {
    return (
      <>
        <ProductInspectorService />
      </>
    );
  }
  if (user?.role === "WAREHOUSE") {
    return (
      <>
        <WarehouseServicePage />
      </>
    );
  }
  if (user?.role === "SELLER") {
    return (
      <>
        <SellerServicePage />
      </>
    );
  }
  if (user?.role === "LOGISTICS") {
    return (
      <>
        <LogisticServicePage />
      </>
    );
  }
  if (user?.role === "CUSTOMER") {
    return (
      <>
        <CustomerServicePage />
      </>
    );
  }
  return <>NOT FOUND</>;
};

export default ServicePage;
