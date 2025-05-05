"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PlatformFeeDrawer from "@/components/drawer/PlatformFeeDrawer";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProvider } from "@/services/blockchain";
import { toast } from "sonner";
import { isOwner } from "@/services/owner/ContractOwnerService";
import { GlobeDemo } from "@/components/shared/GlobeDemo";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Timeline } from "@/components/ui/timeline";
import {
  Factory,
  ClipboardCheck,
  Warehouse,
  ShoppingCart,
  Truck,
  ShoppingBag,
  QrCode,
  Box,
  PackageCheck,
  ScanLine,
  BadgeCheck,
} from "lucide-react";
import { SiSolana } from "react-icons/si";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

const HomePage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOwnerWallet, setIsOwnerWallet] = useState<boolean>(false);

  const data = [
    {
      title: "Factory Production",
      icon: <Factory className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
            <SiSolana className="inline mr-2 w-4 h-4 text-[#9945FF]" />
            Factories initiate the supply chain by manufacturing products, such
            as electronics, textiles, or food items. Each product batch is
            registered on the Solana blockchain using a unique identifier stored
            in a smart contract.
          </p>
          <div className="flex items-start gap-3 mb-6">
            <PackageCheck className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              This identifier includes detailed metadata, such as production
              date, location, raw materials used, and quality certifications.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              The smart contract enforces compliance with predefined standards,
              such as environmental or safety regulations, by cross-referencing
              the metadata with regulatory data stored on-chain.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Inspection Process",
      icon: <ClipboardCheck className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
            <SiSolana className="inline mr-2 w-4 h-4 text-[#9945FF]" />
            After production, factories transfer product batch data to an
            inspection smart contract on the Solana blockchain. Verified
            inspectors evaluate the products for quality, safety, and
            compliance.
          </p>
          <div className="flex items-start gap-3 mb-6">
            <ScanLine className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Inspectors access the products metadata through a Solana-based
              dApp, perform physical or automated inspections, and update the
              blockchain with results.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <SiSolana className="w-5 h-5 mt-0.5 text-[#9945FF] flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              The smart contract automatically calculates and processes
              inspection fees in SOL, ensuring a transparent and auditable
              process.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Warehouse Procurement",
      icon: <Warehouse className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
            <SiSolana className="inline mr-2 w-4 h-4 text-[#9945FF]" />
            Warehouses purchase approved product batches from factories by
            initiating transactions on the Solana blockchain.
          </p>
          <div className="flex items-start gap-3 mb-6">
            <Box className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              The smart contract verifies the payment and transfers ownership of
              the product batchs unique identifier to the warehouse.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <SiSolana className="w-5 h-5 mt-0.5 text-[#9945FF] flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Warehouses log storage conditions and inventory location into the
              products metadata on Solana, ensuring complete handling history.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Seller Orders",
      icon: <ShoppingCart className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
            <SiSolana className="inline mr-2 w-4 h-4 text-[#9945FF]" />
            Sellers place orders through a Solana-integrated dApp that displays
            complete product histories including production, inspection, and
            storage.
          </p>
          <div className="flex items-start gap-3 mb-6">
            <ShoppingBag className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Order details are recorded on-chain, with smart contracts
              verifying inventory availability before processing transactions.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <SiSolana className="w-5 h-5 mt-0.5 text-[#9945FF] flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Payments in SOL are processed instantly, with order status updated
              in real-time on the blockchain.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Logistics & Delivery",
      icon: <Truck className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
            <SiSolana className="inline mr-2 w-4 h-4 text-[#9945FF]" />
            Warehouses assign deliveries through smart contracts that specify
            routes, timelines, and handling requirements on the blockchain.
          </p>
          <div className="flex items-start gap-3 mb-6">
            <Truck className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Logistics providers update product status in real-time, logging
              milestones like pickup, transit, and delivery through a dApp.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <SiSolana className="w-5 h-5 mt-0.5 text-[#9945FF] flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Solana s fast transaction processing ensures these updates occur
              instantly, even for high-volume supply chains.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Customer Purchase & Traceability",
      icon: <QrCode className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-6 text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
            <SiSolana className="inline mr-2 w-4 h-4 text-[#9945FF]" />
            Customers purchase products using SOL through Solana-based systems,
            with ownership transferred to their wallet address.
          </p>
          <div className="flex items-start gap-3 mb-6">
            <QrCode className="w-5 h-5 mt-0.5 text-purple-500 flex-shrink-0" />
            <p className="text-sm font-normal text-neutral-700 md:text-base dark:text-neutral-300">
              Each product includes a QR code linked to its blockchain record,
              enabling full supply chain traceability.
            </p>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-3 text-sm text-neutral-700 md:text-base dark:text-neutral-300">
              <SiSolana className="w-4 h-4 text-[#9945FF] flex-shrink-0" />
              <span>Product batch registered at factory on Solana</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-700 md:text-base dark:text-neutral-300">
              <ClipboardCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Inspection completed with quality certification</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-700 md:text-base dark:text-neutral-300">
              <Warehouse className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Warehouse purchased and stored batch securely</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-700 md:text-base dark:text-neutral-300">
              <ShoppingCart className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Seller placed and received order via dApp</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-700 md:text-base dark:text-neutral-300">
              <Truck className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Logistics delivered product with real-time updates</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-700 md:text-base dark:text-neutral-300">
              <QrCode className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Customer accessed full blockchain traceability</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const features = [
    {
      title: "Blockchain Transparency",
      description:
        "Every transaction and movement recorded immutably on the high-performance Solana blockchain.",
    },
    {
      title: "Real-Time Tracking",
      description:
        "Monitor shipments with live data feeds and potential IoT sensor integration, secured by Solana.",
    },
    {
      title: "Smart Contracts",
      description:
        "Automate payments, agreements, and compliance checks using efficient Solana smart contracts.",
    },
  ];

  const stats = [
    { value: "1M+", label: "Transactions Processed Daily" },
    { value: "~400ms", label: "Average Block Time" },
    { value: "<$0.00025", label: "Avg. Transaction Fee" },
  ];
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const program = useMemo(() => {
    if (publicKey && signTransaction && sendTransaction) {
      try {
        return getProvider(publicKey, signTransaction, sendTransaction);
      } catch (error) {
        console.error("Error getting provider:", error);
        toast.error("Failed to initialize blockchain connection.");
        return null;
      }
    }
    return null;
  }, [publicKey, signTransaction, sendTransaction]);
  const isCurrentUserOwner = async () => {
    if (!publicKey || !program) return;
    const o = await isOwner(program, publicKey);
    setIsOwnerWallet(o);
  };
  useEffect(() => {
    const updateSize = () => {
      // if (containerRef.current) {
      //   setGlobeWidth(containerRef.current.offsetWidth);
      //   setGlobeHeight(containerRef.current.offsetHeight);
      // }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    isCurrentUserOwner();
    return () => window.removeEventListener("resize", updateSize);
  }, [program, publicKey]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div
      // ref={containerRef}
      className={
        "relative min-h-screen overflow-hidden pt-24 " +
        "bg-white" +
        "dark:black" +
        "text-slate-900 dark:text-slate-100"
      }
    >
      <motion.main
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Hero Section */}
          <motion.h1
            className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-8"
            variants={itemVariants}
          >
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-2">
              Supply Chain
            </span>
            <span className="block text-slate-700 dark:text-slate-300 text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-2">
              Powered by Solana
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-slate-700 dark:text-slate-400 mb-12 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            <TextGenerateEffect
              words="Revolutionize your supply chain management with blockchain-powered
            transparency, real-time tracking, and immutable audit trails, built
            on the speed and efficiency of Solana."
            />
          </motion.p>
          <motion.div
            className="flex justify-center gap-6 mb-24"
            variants={itemVariants}
          >
            <Link href="/profile" legacyBehavior>
              <a
                className={
                  "inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition duration-300 ease-in-out transform " +
                  "bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-full shadow-lg " +
                  "hover:scale-105 hover:shadow-blue-500/40 " +
                  "dark:hover:shadow-purple-500/60 " +
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 " +
                  "focus:ring-offset-white dark:focus:ring-offset-gray-950"
                }
              >
                Get Started
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </a>
            </Link>
            {isOwnerWallet && (
              <Button onClick={() => setIsDrawerOpen(true)}>
                Update Platform Fee
              </Button>
            )}
          </motion.div>
        </div>
        <Timeline data={data} />
        <GlobeDemo />
        <TextHoverEffect text="CHAINX" />

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className={
                  "transition-all duration-300 ease-in-out rounded-xl overflow-hidden backdrop-blur-lg " +
                  "bg-white/90 border border-slate-100 shadow-xl hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 " +
                  "dark:bg-slate-800/60 dark:border-slate-700/80 dark:hover:border-indigo-500/80"
                }
              >
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-700 dark:text-slate-400 text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className={
            "mt-24 w-full max-w-5xl rounded-3xl p-8 backdrop-blur-lg " +
            "bg-white/90 border border-slate-100 shadow-2xl " +
            "dark:bg-slate-800/60 dark:border-slate-700/80"
          }
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-700">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4 py-6 sm:py-0">
                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.main>

      <PlatformFeeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default HomePage;
