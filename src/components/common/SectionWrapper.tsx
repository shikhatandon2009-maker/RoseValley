'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      className={`relative py-6 sm:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F7EEED] text-[#1A0510] ${className}`}
    >
      <div
        ref={ref}
        className={`max-w-7xl mx-auto relative z-10 transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${
          borderGlow
            ? 'rounded-3xl bg-[#FAE6E7]/70 border border-[#F7D1D8] shadow-sm p-6 sm:p-10 text-[#1A0510]'
            : ''
        } ${containerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
