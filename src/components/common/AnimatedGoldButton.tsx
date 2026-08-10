'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AnimatedGoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function AnimatedGoldButton({
  children,
  onClick,
  type = 'button',
  className = '',
  size = 'md',
  icon,
  disabled = false,
}: AnimatedGoldButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-xs sm:text-sm',
    lg: 'px-8 py-4 text-sm sm:text-base',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative inline-flex items-center justify-center font-serif font-bold uppercase tracking-wider text-neutral-950 rounded-full overflow-hidden shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group ${sizeClasses[size]} ${className}`}
    >
      {/* Metallic Gold Gradient Background */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#FFE79A] via-[#D4AF37] to-[#AA771C] transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#FFF0B3] group-hover:via-[#E2BD48] group-hover:to-[#C69024]" />

      {/* Shimmer Effect Sweep */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />

      {/* Outer Glow */}
      <span className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all duration-500" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2 drop-shadow-sm font-sans font-bold">
        {icon || <Sparkles className="w-4 h-4 text-neutral-900" />}
        {children}
      </span>
    </motion.button>
  );
}
