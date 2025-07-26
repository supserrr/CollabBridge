"use client"

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TextEffect } from "@/components/ui/text-effect";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Connect", "Create", "Collaborate"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <WavyBackground className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 pt-16 pb-12 lg:pt-20 lg:pb-16 items-center justify-center flex-col max-w-7xl mx-auto">
          <div>
            <Button variant="secondary" size="sm">
              CollabBridge is
            </Button>
          </div>
          <div className="flex gap-4 flex-col px-4 sm:px-0">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl max-w-6xl tracking-tighter text-center font-regular text-foreground drop-shadow-lg px-2 sm:px-0">
              <span className="text-primary font-bold">A place to</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 mt-4">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-primary drop-shadow-lg"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
            <TextEffect
              per="word"
              as="p"
              delay={0.5}
              className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed tracking-tight text-foreground/80 max-w-4xl text-center drop-shadow-sm font-medium px-4 sm:px-0"
              preset="blur"
            >
              Finding reliable creative talent for events in Rwanda is a persistent challenge. Event planners waste time 
              searching through fragmented networks while 3,200+ creative professionals struggle to discover opportunities. 
              Our goal is to streamline event collaboration, making it easier and faster than ever.
            </TextEffect>
          </div>
        </div>
      </div>
    </WavyBackground>
  );
}

export { Hero };
