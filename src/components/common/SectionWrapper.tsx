'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  borderGlow?: boolean;
}

export function SectionWrapper({
  children,
  id,
  className = '',
  containerClassName = '',
  borderGlow = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`relative py-6 sm:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F7EEED] text-[#1A0510] ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`max-w-7xl mx-auto relative z-10 ${
          borderGlow
            ? 'rounded-3xl bg-[#FAE6E7]/70 border border-[#F7D1D8] shadow-sm p-6 sm:p-10 text-[#1A0510]'
            : ''
        } ${containerClassName}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
