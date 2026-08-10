'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Search, RefreshCw, CheckCircle2, ShieldCheck, Plus, Sparkles, MapPin, Layers } from 'lucide-react';

interface CountryItem {
  id?: string;
  code: string;
  name: string;
  flag: string;
  phone_code: string;
  state_label: string;
  postal_label: string;
  matched_currency: string;
  is_active: boolean;
  display_order: number;
  states?: string[];
}

export default function AdminCountriesManagerPage() {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/countries');
      if (res.ok) {
        const data = await res.json();
        setCountries(data.countries || []);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const handleSeedCountries = async () => {
    setSeeding(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/seed-countries', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(`✅ ${data.message}`);
        await loadCountries();
      } else {
        setStatusMessage(`⚠️ ${data.error || 'Failed to seed countries.'}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.matched_currency.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 selection:bg-[#F6A6BB] selection:text-[#4A0D25]">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white border border-[#F7D1D8] p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5 text-[#F6A6BB]" /> Supabase International Catalog
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A0510] tracking-tight">
              World Countries & Address Manager
            </h1>
            <p className="text-[#4A0D25] text-sm mt-2 max-w-xl font-semibold">
              Manage international shipping destinations, state/province labels, dial codes, and currency mappings saved in Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedCountries}
              disabled={seeding}
              className="px-5 py-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-extrabold text-xs hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {seeding ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {seeding ? 'Seeding Supabase...' : 'Seed All World Countries to Supabase'}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by country, code, or currency..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-[#4A0D25] font-extrabold">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-[#F7D1D8] shadow-xs">
            Total Active Countries: {countries.length}
          </span>
        </div>
      </div>

      {/* Countries Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-stone-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#F6A6BB]" /> Loading countries from Supabase...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.code}
              className="p-5 rounded-2xl bg-white border border-[#F7D1D8] space-y-3 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.flag}</span>
                  <div>
                    <h3 className="font-serif font-bold text-[#1A0510] text-base">{item.name}</h3>
                    <span className="text-[10px] font-extrabold text-[#4A0D25] uppercase tracking-wider">
                      ISO: {item.code} • Dial: {item.phone_code}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-[#F6A6BB]/30 text-[#4A0D25] border border-[#F7D1D8]">
                  {item.matched_currency}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAE6E7]/50 border border-[#F7D1D8] space-y-1 text-xs">
                <div className="flex justify-between text-[11px] font-bold text-[#1A0510]">
                  <span>State Label:</span>
                  <span className="text-[#4A0D25] font-extrabold">{item.state_label}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#1A0510]">
                  <span>Postal Label:</span>
                  <span className="text-[#4A0D25] font-extrabold">{item.postal_label}</span>
                </div>
                {item.states && item.states.length > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-[#1A0510]">
                    <span>Predefined States:</span>
                    <span className="text-[#4A0D25] font-extrabold">{item.states.length} region(s)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
