'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Play, Pause, RefreshCw } from 'lucide-react';
import { STORE_NAME } from '@/lib/constants';
import { DevFileTag } from '@/components/common/DevFileTag';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedInLoop, setIsPausedInLoop] = useState(false);
  const [pauseCountdown, setPauseCountdown] = useState(10);

  const [videoUrl, setVideoUrl] = useState('https://cdn.shopify.com/videos/c/o/v/43ca2028a79041179ed82c0ece7718b1.mp4');
  const [playDuration, setPlayDuration] = useState(6);
  const [pauseDuration, setPauseDuration] = useState(10);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [titleFont, setTitleFont] = useState('playfair');

  const fontClasses: Record<string, string> = {
    playfair: 'font-hero-playfair',
    cinzel: 'font-hero-cinzel',
    cormorant: 'font-hero-cormorant',
    bodoni: 'font-hero-bodoni',
    prata: 'font-hero-prata',
    montserrat: 'font-hero-montserrat',
  };

  // Fetch admin configured video settings on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.social_links) {
          const sl = data.settings.social_links;
          if (sl.hero_video_url) setVideoUrl(sl.hero_video_url);
          if (sl.hero_video_play_duration !== undefined) setPlayDuration(parseFloat(sl.hero_video_play_duration) || 6);
          if (sl.hero_video_pause_duration !== undefined) setPauseDuration(parseFloat(sl.hero_video_pause_duration) || 10);
          if (sl.hero_video_loop_enabled !== undefined) setLoopEnabled(Boolean(sl.hero_video_loop_enabled));
          if (sl.hero_title_font) setTitleFont(sl.hero_title_font);
        }
      })
      .catch((err) => console.log('Error fetching hero settings:', err));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let pauseTimer: NodeJS.Timeout | null = null;
    let countdownInterval: NodeJS.Timeout | null = null;
    let isMounted = true;
    let isInView = false;

    // Ensure video is muted for browser autoplay compliance
    video.muted = true;

    const startPlay = async () => {
      try {
        if (isMounted && video) {
          await video.play();
          if (isMounted) {
            setIsPlaying(true);
            setIsPausedInLoop(false);
          }
        }
      } catch (err) {
        console.log('Video play error:', err);
      }
    };

    const stopVideo = () => {
      if (video) {
        video.pause();
      }
      if (pauseTimer) clearTimeout(pauseTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      setIsPlaying(false);
      setIsPausedInLoop(false);
    };

    const handleTimeUpdate = () => {
      if (!video || !isMounted || !isInView) return;

      // When video reaches configured playDuration seconds
      if (video.currentTime >= playDuration && !video.paused) {
        video.pause();
        setIsPlaying(false);

        if (loopEnabled && pauseDuration > 0) {
          setIsPausedInLoop(true);
          setPauseCountdown(pauseDuration);

          // Countdown timer
          let remaining = pauseDuration;
          if (countdownInterval) clearInterval(countdownInterval);
          countdownInterval = setInterval(() => {
            remaining -= 1;
            if (isMounted) setPauseCountdown(Math.max(0, remaining));
          }, 1000);

          // Pause for configured pauseDuration seconds before restarting loop
          if (pauseTimer) clearTimeout(pauseTimer);
          pauseTimer = setTimeout(() => {
            if (!isMounted || !video || !isInView) return;
            if (countdownInterval) clearInterval(countdownInterval);
            video.currentTime = 0;
            startPlay();
          }, pauseDuration * 1000);
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    // Scroll Detection: Play when Hero enters viewport, Stop when Hero leaves viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInView = true;
            video.currentTime = 0;
            startPlay();
          } else {
            isInView = false;
            stopVideo();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => {
      isMounted = false;
      observer.disconnect();
      video.removeEventListener('timeupdate', handleTimeUpdate);
      if (pauseTimer) clearTimeout(pauseTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [videoUrl, playDuration, pauseDuration, loopEnabled]);

  const toggleManualPlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime >= playDuration) {
        video.currentTime = 0;
      }
      video.play().catch(() => {});
      setIsPlaying(true);
      setIsPausedInLoop(false);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full h-[calc(100vh-80px)] min-h-[650px] max-h-[1080px] overflow-hidden flex items-center justify-center bg-[#1A030D] text-white">
      {/* Background Video (Full Screen Cover) */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-1000 filter brightness-90"
      />

      {/* Luxury Dark Rose Overlay for Text Readability & Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A030D] via-[#1A030D]/40 to-[#1A030D]/70" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#1A030D]/20 to-[#1A030D]/80" />

      {/* Ornaments */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#D45A7A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#E8B8B8]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8 py-12">
        {/* Heritage Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E8B8B8] text-xs font-semibold uppercase tracking-widest shadow-luxury">
          <Sparkles className="w-4 h-4 text-[#D45A7A]" />
          <span>Harvest 2026 • Hydro-Distilled Ruh Gulab</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-4 max-w-3xl">
          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-md leading-tight transition-all duration-300 ${fontClasses[titleFont] || 'font-hero-playfair'}`}>
            {STORE_NAME}
          </h1>
          <p className="font-serif text-lg sm:text-2xl text-[#F2D4D4]/90 max-w-2xl font-light leading-relaxed">
            Experience timeless luxury with pure steam-distilled Damask rose attars and botanical elixirs, crafted in traditional copper Degs.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-start gap-4 pt-4">
          <Link
            href="/products"
            className="w-full sm:w-auto bg-gradient-to-r from-[#D45A7A] to-[#B03060] hover:from-[#C94A6A] hover:to-[#9A2048] text-white py-4 px-9 rounded-full font-semibold text-xs uppercase tracking-widest shadow-luxury flex items-center justify-center gap-2.5 transition-all hover:scale-105 border border-white/20"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products?category=artisanal-perfumes"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-4 px-8 rounded-full font-semibold text-xs uppercase tracking-widest border border-white/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>The Heritage Craft</span>
          </Link>
        </div>
      </div>

      {/* Scroll Down Cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-widest text-white/60">Scroll to Explore</span>
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}


