'use client';

import Image from "next/image";
import Hyperspeed from "@/blocks/Backgrounds/Hyperspeed/Hyperspeed";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <Hyperspeed />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <h1 className="text-white text-4xl font-bold">Hyperspeed Activated</h1>
      </div>
    </div>
  );
}
