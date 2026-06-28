"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function BusinessGallery({
  images,
}: {
  images: string[];
}) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2">
      {images.map((img, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="relative min-w-[85%] h-56 rounded-xl overflow-hidden"
        >
          <Image
            src={img}
            alt={`business-${i}`}
            fill
            className="object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}