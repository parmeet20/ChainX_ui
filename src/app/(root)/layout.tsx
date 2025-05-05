"use client";
import AppWalletProvider from "@/components/shared/AppWalletProvider";
import ChainxNavbar from "@/components/shared/Navbar";

import React from "react";
import { Toaster } from "sonner";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppWalletProvider>
      <ChainxNavbar />
      {children}
      <Toaster />
    </AppWalletProvider>
  );
};
export default layout;
