'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  prefixClassName?: string;
  suffixClassName?: string;
  highlightSymbols?: boolean;
}

export function AnimatedCounter({
  end,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  prefixClassName = '',
  suffixClassName = '',
  highlightSymbols = true,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic formula for fast initial acceleration and smooth snap to final value
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOutCubic * end;
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(end); // Ensure exact final value
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  const formattedCount = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString('en-US');

  const renderSuffix = () => {
    if (!suffix) return null;
    return <span className={suffixClassName}>{suffix}</span>;
  };

  return (
    <span ref={containerRef} className={className}>
      {prefix && <span className={prefixClassName}>{prefix}</span>}
      {formattedCount}
      {renderSuffix()}
    </span>
  );
}
