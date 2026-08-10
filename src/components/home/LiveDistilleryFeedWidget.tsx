'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Droplets, Thermometer, Radio, Sparkles, Activity } from 'lucide-react';

export function LiveDistilleryFeedWidget() {
  const [temperature, setTemperature] = useState(96.4);
  const [steamRate, setSteamRate] = useState(1.42);
  const [yieldRate, setYieldRate] = useState(0.024);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(Number((96.0 + Math.random() * 1.2).toFixed(1)));
      setSteamRate(Number((1.38 + Math.random() * 0.1).toFixed(2)));
      setYieldRate(Number((0.023 + Math.random() * 0.002).toFixed(3)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FAE6E7]/80 border border-[#F7D1D8] shadow-sm space-y-6 relative overflow-hidden text-[#1A0510]">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A0D25] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              Live Telemetry Stream
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1A0510] mt-0.5">
              Kannauj Distillery Feed (Vessel #Deg-04)
            </h3>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-mono font-bold flex items-center gap-2 w-fit">
          <Activity className="w-3.5 h-3.5" /> HYDRO-DISTILLATION IN PROGRESS
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[#4A0D25] font-bold">
            <span>Still Temp</span>
            <Thermometer className="w-4 h-4 text-[#F6A6BB]" />
          </div>
          <div className="font-serif font-bold text-2xl text-[#1A0510]">{temperature}°C</div>
          <div className="text-[10px] text-[#4A0D25] font-semibold">Hydro-Steam Standard</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[#4A0D25] font-bold">
            <span>Condensate Flow</span>
            <Droplets className="w-4 h-4 text-[#F6A6BB]" />
          </div>
          <div className="font-serif font-bold text-2xl text-[#1A0510]">{steamRate} L/hr</div>
          <div className="text-[10px] text-[#4A0D25] font-semibold">Bhapka Vessel Flow</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[#4A0D25] font-bold">
            <span>Today Harvest</span>
            <Flame className="w-4 h-4 text-[#F6A6BB]" />
          </div>
          <div className="font-serif font-bold text-2xl text-[#1A0510]">4,850 Kg</div>
          <div className="text-[10px] text-[#4A0D25] font-semibold">Pre-Dawn Damask Petals</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-[#4A0D25] font-bold">
            <span>Pure Oil Yield</span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="font-serif font-bold text-2xl text-emerald-800">{yieldRate}%</div>
          <div className="text-[10px] text-emerald-900 font-semibold">100% Pure Distillate Output</div>
        </div>
      </div>
    </div>
  );
}
