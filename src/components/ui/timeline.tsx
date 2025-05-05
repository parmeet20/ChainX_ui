"use client";
import {
  useScroll,
  useTransform,
  motion,
  useMotionValueEvent
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { SiBlockchaindotcom, SiSolana } from "react-icons/si";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(-1);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setHeight(rect.height);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 30%", "end 60%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const sections = data.length;
    const sectionHeight = 1 / sections;
    const newIndex = Math.min(
      Math.floor(latest / sectionHeight),
      sections - 1
    );
    
    if (prevIndexRef.current !== newIndex) {
      prevIndexRef.current = newIndex;
      setActiveIndex(newIndex);
    }
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-900 font-sans"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-6"
        >
          <SiBlockchaindotcom className="w-10 h-10 text-purple-500 dark:text-purple-400" />
          <h2 className="text-3xl md:text-5xl text-black dark:text-white max-w-4xl font-bold tracking-tight">
            Product Journey from Factory to Customer
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex items-center gap-3"
        >
          <SiSolana className="w-6 h-6 text-[#9945FF] dark:text-[#7C3AED]" />
          <p className="text-neutral-600 dark:text-neutral-300 text-base md:text-lg max-w-xl">
            End-to-end transparency powered by Solana Blockchain with automated payments
          </p>
        </motion.div>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <motion.div 
                animate={{
                  scale: activeIndex === index ? 1.1 : 1,
                }}
                className={`h-12 w-12 absolute left-2 md:left-2 rounded-full flex items-center justify-center transition-colors ${
                  activeIndex === index 
                    ? "bg-purple-500/20 dark:bg-purple-400/20" 
                    : "bg-transparent"
                }`}
              >
                <div className={`p-2 transition-colors ${
                  activeIndex === index 
                    ? "text-purple-500 dark:text-purple-400" 
                    : "text-neutral-400 dark:text-neutral-600"
                }`}>
                  {item.icon}
                </div>
              </motion.div>
              <h3 className={`hidden md:block text-xl md:pl-20 md:text-3xl tracking-tight transition-colors ${
                activeIndex === index 
                  ? "text-black dark:text-white font-semibold" 
                  : "text-neutral-500 dark:text-neutral-400 font-normal"
              }`}>
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <div className={`md:hidden flex items-center gap-3 text-xl mb-4 text-left font-medium transition-colors ${
                activeIndex === index 
                  ? "text-black dark:text-white" 
                  : "text-neutral-500 dark:text-neutral-400"
              }`}>
                {item.icon}
                {item.title}
              </div>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-600 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 dark:from-purple-400 via-blue-500 dark:via-blue-400 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
};