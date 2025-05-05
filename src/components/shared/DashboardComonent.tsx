"use client";
import useStore from "@/store/user_store";
import React from "react";
import FactoryDashboardComponent from "./dashboards/FactoryDashboard";
import WarehouseDashboardComponent from "./dashboards/WarehouseAnalytics";
import SellerAnalyticsComponent from "./dashboards/SellerAnalytics";
import CustomerAnalyticsComponent from "./dashboards/CustomerAnalytics";
import InspectorAnalytics from "./dashboards/InspectorAnalytics";
import LogisticAnalytics from "./dashboards/LogisticAnalytics";

const DashboardComonent = () => {
  const { user } = useStore();
  if (user?.role === "FACTORY")
    return <div>{<FactoryDashboardComponent />}</div>;
  else if (user?.role === "WAREHOUSE")
    return <div>{<WarehouseDashboardComponent />}</div>;
  else if (user?.role === "SELLER")
    return <div>{<SellerAnalyticsComponent />}</div>;
  else if (user?.role === "CUSTOMER")
    return <div>{<CustomerAnalyticsComponent />}</div>;
  else if (user?.role === "LOGISTICS")
    return <div>{<LogisticAnalytics />}</div>;
  else if (user?.role === "INSPECTOR")
    return <div>{<InspectorAnalytics />}</div>;
  return null;
};

export default DashboardComonent;
