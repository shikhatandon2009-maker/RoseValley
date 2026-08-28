'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Save,
  RotateCcw,
  Code2,
  Eye,
  FileJson,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Copy,
  Check,
  Database,
  Sliders,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot,
  Feather,
  Terminal,
  Maximize2,
  FileCode,
} from 'lucide-react';
import { AIPromptItem, AIPromptTestResponse } from '@/types/ai-prompt';
import { DEFAULT_AI_PROMPTS } from '@/lib/ai/default-prompts';
import { SUPABASE_AI_PROMPTS_SQL } from '@/lib/ai/sql-schema';

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<AIPromptItem[]>(DEFAULT_AI_PROMPTS);
  const [selectedSlug, setSelectedSlug] = useState<string>('all_in_one_seo_and_description');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Active editing state for current selected prompt
  const [currentPrompt, setCurrentPrompt] = useState<AIPromptItem>(DEFAULT_AI_PROMPTS[0]);

  // Test playground variables input
  const [testVariables, setTestVariables] = useState<Record<string, any>>({});
  
  // Test result state
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<AIPromptTestResponse | null>(null);
  const [previewTab, setPreviewTab] = useState<'raw' | 'parsed' | 'visual' | 'sent_prompt'>('raw');

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/prompts');
      const data = await res.json();
      if (data.prompts && data.prompts.length > 0) {
        setPrompts(data.prompts);
        const match = data.prompts.find((p: AIPromptItem) => p.slug === selectedSlug) || data.prompts[0];
        setCurrentPrompt({ ...match });
        setTestVariables(match.sample_input || {});
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a different prompt
  const handleSelectPrompt = (prompt: AIPromptItem) => {
    setSelectedSlug(prompt.slug);
    setCurrentPrompt({ ...prompt });
    setTestVariables(prompt.sample_input || {});
    setTestResult(null);
    setStatusMessage(null);
  };

  // Save prompt to Supabase
  const handleSavePrompt = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save prompt');
      }

      setStatusMessage({
        type: 'success',
        text: `Prompt "${currentPrompt.title}" saved successfully to Supabase.`,
      });

      // Update local prompts list
      setPrompts((prev) =>
        prev.map((p) => (p.slug === currentPrompt.slug ? { ...currentPrompt } : p))
      );
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error saving to database',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default factory prompt
  const handleResetToDefault = () => {
    const defaultItem = DEFAULT_AI_PROMPTS.find((p) => p.slug === currentPrompt.slug);
    if (defaultItem) {
      setCurrentPrompt({ ...defaultItem });
      setTestVariables(defaultItem.sample_input || {});
      setStatusMessage({
        type: 'success',
        text: `Reset "${currentPrompt.title}" to factory default configuration.`,
      });
    }
  };

  // Run Test / Try Prompt
  const handleRunTest = async () => {
    setIsRunningTest(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/prompts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: currentPrompt.slug,
          system_prompt: currentPrompt.system_prompt,
          user_prompt_template: currentPrompt.user_prompt_template,
          variables_input: testVariables,
          model: currentPrompt.model,
          temperature: currentPrompt.temperature,
          max_output_tokens: currentPrompt.max_output_tokens,
          expected_output_format: currentPrompt.expected_output_format,
        }),
      });

      const data: AIPromptTestResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      setTestResult(data);
      if (data.is_valid_json) {
        setPreviewTab('parsed');
      } else {
        setPreviewTab('raw');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Execution failed: ${err.message}`,
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Copy raw output
  const handleCopyRaw = () => {
    if (!testResult?.raw_output) return;
    navigator.clipboard.writeText(testResult.raw_output);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Copy SQL script
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_AI_PROMPTS_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Categories
  const categories = ['All', 'Catalog & SEO', 'AI Shopping Experience', 'Community & Social Proof', 'Editorial & Content'];

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-[#FAF8F5] min-h-screen text-[#1A0510]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-[#F7D1D8]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[#4A0D25] text-white shadow-md">
              <Sparkles className="w-6 h-6 text-[#E6CA65]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1A0510] tracking-tight">
                AI Prompts & Playground Studio
              </h1>
              <p className="text-xs sm:text-sm text-[#7A5866]">
                Manage, fine-tune, test and preview raw output of all AI prompt engines in RoseOil.in
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#FAE6E7] transition-all shadow-xs"
          >
            <Database className="w-4 h-4 text-[#8A1D41]" />
            <span>Supabase SQL Schema</span>
          </button>

          <button
            onClick={fetchPrompts}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#F7D1D8] text-[#7A5866] hover:text-[#1A0510] hover:bg-[#FAE6E7] transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSavePrompt}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#4A0D25] text-white hover:bg-[#340718] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#E6CA65]" />
            <span>{isSaving ? 'Saving to DB...' : 'Save Changes to Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-xs border transition-all ${
            statusMessage.type === 'success'
              ? 'bg-[#EBF7EE] text-[#1E6B34] border-[#B7E4C7]'
              : 'bg-[#FDF0F0] text-[#9B2226] border-[#F8D7DA]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#BA181B]" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Layout: Sidebar Selector | Prompt Editor | Live Test & Raw Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Prompts List & Filter (3 cols) */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F7D1D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A0D25] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Prompt Directory ({prompts.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A38895]" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#F7D1D8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#4A0D25]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#4A0D25] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-[#7A5866] hover:bg-[#FAE6E7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prompts Navigation List */}
            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredPrompts.map((p) => {
                const isSelected = p.slug === selectedSlug;
                return (
                  <div
                    key={p.slug}
                    onClick={() => handleSelectPrompt(p)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#FAE6E7] border-[#4A0D25] shadow-xs'
                        : 'bg-white border-transparent hover:border-[#F7D1D8] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A1D41] px-1.5 py-0.5 rounded bg-white/80 border border-[#F7D1D8]">
                        {p.expected_output_format.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-[#A38895] font-mono">
                        {p.model.replace('gemini-', '')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1A0510] leading-snug line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-[10px] text-[#7A5866] line-clamp-2 mt-0.5 leading-tight">
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Prompt Editor (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F7D1D8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A1D41]">
                  {currentPrompt.category}
                </span>
                <h3 className="text-sm font-bold text-[#1A0510]">{currentPrompt.title}</h3>
                <span className="text-[10px] font-mono text-[#7A5866]">Slug: {currentPrompt.slug}</span>
              </div>
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#8A1D41] hover:text-[#4A0D25] p-1.5 rounded-lg hover:bg-[#FAE6E7] transition-all"
                title="Reset to factory default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Model & Hyperparameters Config */}
            <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#F7D1D8]">
              <div>
                <label className="text-[9px] font-bold text-[#7A5866] uppercase block mb-1">Model</label>
                <select
                  value={currentPrompt.model}
                  onChange={(e) => setCurrentPrompt({ ...currentPrompt, model: e.target.value })}
                  className="w-full bg-white border border-[#F7D1D8] text-[11px] rounded-lg px-2 py-1 font-medium text-[#1A0510] focus:ring-1 focus:ring-[#4A0D25]"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#7A5866] uppercase block mb-1">
                  Temp ({currentPrompt.temperature})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={currentPrompt.temperature}
                  onChange={(e) =>
                    setCurrentPrompt({ ...currentPrompt, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#4A0D25] cursor-pointer mt-1"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#7A5866] uppercase block mb-1">Max Tokens</label>
                <input
                  type="number"
                  value={currentPrompt.max_output_tokens}
                  onChange={(e) =>
                    setCurrentPrompt({
                      ...currentPrompt,
                      max_output_tokens: parseInt(e.target.value) || 2000,
                    })
                  }
                  className="w-full bg-white border border-[#F7D1D8] text-[11px] rounded-lg px-2 py-1 font-medium text-[#1A0510] focus:ring-1 focus:ring-[#4A0D25]"
                />
              </div>
            </div>

            {/* System Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A0510] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8A1D41]" />
                  System Persona & Instructions
                </label>
                <span className="text-[10px] text-[#A38895]">Core character & guardrails</span>
              </div>
              <textarea
                rows={5}
                value={currentPrompt.system_prompt}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, system_prompt: e.target.value })
                }
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#F7D1D8] rounded-xl text-xs font-mono text-[#1A0510] focus:outline-none focus:ring-1 focus:ring-[#4A0D25] leading-relaxed resize-y"
              />
            </div>

            {/* User Prompt Template */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1A0510] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#8A1D41]" />
                  User Prompt Template
                </label>
                <div className="flex items-center gap-1">
                  {currentPrompt.variables.map((v) => (
                    <span
                      key={v.name}
                      onClick={() => {
                        setCurrentPrompt({
                          ...currentPrompt,
                          user_prompt_template: `${currentPrompt.user_prompt_template} {{${v.name}}}`,
                        });
                      }}
                      className="cursor-pointer text-[9px] font-mono font-bold bg-[#FAE6E7] text-[#8A1D41] px-1.5 py-0.5 rounded border border-[#F7D1D8] hover:bg-[#F7D1D8]"
                      title={`Click to insert {{${v.name}}}`}
                    >
                      +{`{{${v.name}}}`}
                    </span>
                  ))}
                </div>
              </div>
              <textarea
                rows={12}
                value={currentPrompt.user_prompt_template}
                onChange={(e) =>
                  setCurrentPrompt({ ...currentPrompt, user_prompt_template: e.target.value })
                }
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#F7D1D8] rounded-xl text-xs font-mono text-[#1A0510] focus:outline-none focus:ring-1 focus:ring-[#4A0D25] leading-relaxed resize-y"
              />
            </div>

            {/* Expected Output Format */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#7A5866]">Output Format:</span>
                <div className="flex gap-1">
                  {(['json', 'text', 'markdown'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setCurrentPrompt({ ...currentPrompt, expected_output_format: fmt })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                        currentPrompt.expected_output_format === fmt
                          ? 'bg-[#4A0D25] text-white'
                          : 'bg-[#FAF8F5] border border-[#F7D1D8] text-[#7A5866]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSavePrompt}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#8A1D41] text-white hover:bg-[#4A0D25] transition-all shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Prompt'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Testing Sandbox & Raw Output Preview (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* Variable Inputs & Test Action Card */}
          <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F7D1D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A0D25] flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#8A1D41]" /> Live Test Playground
              </span>
              <span className="text-[10px] font-medium text-[#7A5866]">
                Simulate prompt execution in real time
              </span>
            </div>

            {/* Dynamic Variable Input Fields */}
            <div className="space-y-2.5">
              {currentPrompt.variables.map((v) => (
                <div key={v.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#1A0510]">
                      {v.label} {v.required && <span className="text-red-500">*</span>}
                    </label>
                    <span className="text-[9px] font-mono text-[#8A1D41]">{`{{${v.name}}}`}</span>
                  </div>
                  {v.name === 'prompt' || v.name === 'context' ? (
                    <textarea
                      rows={2}
                      value={testVariables[v.name] || ''}
                      placeholder={v.description || `Enter ${v.label}...`}
                      onChange={(e) =>
                        setTestVariables({ ...testVariables, [v.name]: e.target.value })
                      }
                      className="w-full p-2 bg-[#FAF8F5] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] focus:ring-1 focus:ring-[#4A0D25] focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={testVariables[v.name] || ''}
                      placeholder={v.description || `Enter ${v.label}...`}
                      onChange={(e) =>
                        setTestVariables({ ...testVariables, [v.name]: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] focus:ring-1 focus:ring-[#4A0D25] focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunTest}
              disabled={isRunningTest}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#4A0D25] text-white hover:bg-[#340718] transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E6CA65]" />
                  <span>Executing Prompt with Gemini Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E6CA65]" />
                  <span>Run & Preview AI Output</span>
                </>
              )}
            </button>
          </div>

          {/* Raw Output & Preview Card */}
          <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-sm p-5 space-y-4">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#F7D1D8]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setPreviewTab('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewTab === 'raw'
                      ? 'bg-[#1A0510] text-white'
                      : 'bg-[#FAF8F5] text-[#7A5866] hover:bg-[#FAE6E7]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Raw Data Output</span>
                </button>

                {testResult?.is_valid_json && (
                  <button
                    onClick={() => setPreviewTab('parsed')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      previewTab === 'parsed'
                        ? 'bg-[#4A0D25] text-white'
                        : 'bg-[#FAF8F5] text-[#7A5866] hover:bg-[#FAE6E7]'
                    }`}
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Parsed JSON</span>
                  </button>
                )}

                <button
                  onClick={() => setPreviewTab('visual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewTab === 'visual'
                      ? 'bg-[#8A1D41] text-white'
                      : 'bg-[#FAF8F5] text-[#7A5866] hover:bg-[#FAE6E7]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Preview</span>
                </button>

                <button
                  onClick={() => setPreviewTab('sent_prompt')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewTab === 'sent_prompt'
                      ? 'bg-[#4A0D25] text-white'
                      : 'bg-[#FAF8F5] text-[#7A5866] hover:bg-[#FAE6E7]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Sent Prompt</span>
                </button>
              </div>

              {testResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRaw}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#8A1D41] hover:text-[#4A0D25] px-2 py-1 rounded bg-[#FAF8F5] border border-[#F7D1D8]"
                  >
                    {copiedRaw ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Performance Stats Bar */}
            {testResult && (
              <div className="flex items-center justify-between text-[10px] bg-[#FAF8F5] px-3 py-2 rounded-xl border border-[#F7D1D8] font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[#2D6A4F] font-bold">
                    <Clock className="w-3 h-3" /> {testResult.latency_ms}ms
                  </span>
                  <span className="text-[#7A5866]">|</span>
                  <span className="text-[#4A0D25] font-semibold flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> {testResult.model_used}
                  </span>
                </div>
                <div>
                  {testResult.is_valid_json ? (
                    <span className="px-2 py-0.5 rounded bg-[#EBF7EE] text-[#1E6B34] font-bold border border-[#B7E4C7]">
                      Valid JSON ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#7A5866] font-bold border border-[#F7D1D8]">
                      Text / Markdown Output
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Output Display Area */}
            {!testResult && !isRunningTest && (
              <div className="py-16 text-center border-2 border-dashed border-[#F7D1D8] rounded-2xl bg-[#FAF8F5] space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#FAE6E7] flex items-center justify-center text-[#8A1D41]">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#1A0510]">No Test Output Yet</h4>
                <p className="text-[11px] text-[#7A5866] max-w-xs mx-auto">
                  Click <strong>&ldquo;Run & Preview AI Output&rdquo;</strong> to execute this prompt and see raw returned data.
                </p>
              </div>
            )}

            {isRunningTest && (
              <div className="py-16 text-center border border-[#F7D1D8] rounded-2xl bg-[#FAF8F5] space-y-3">
                <RefreshCw className="w-8 h-8 text-[#8A1D41] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#1A0510]">Generating bespoke response from LLM...</p>
                <p className="text-[10px] text-[#7A5866]">Evaluating output structure and verifying tokens...</p>
              </div>
            )}

            {testResult && !isRunningTest && (
              <div>
                {/* 1. RAW OUTPUT TAB */}
                {previewTab === 'raw' && (
                  <div className="relative">
                    <pre className="p-4 bg-[#14040C] text-[#F3E8EC] rounded-xl text-[11px] font-mono overflow-x-auto max-h-[500px] leading-relaxed border border-[#3E1124] shadow-inner select-text">
                      <code>{testResult.raw_output}</code>
                    </pre>
                  </div>
                )}

                {/* 2. PARSED JSON TAB */}
                {previewTab === 'parsed' && (
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#F7D1D8] text-[11px] font-mono overflow-x-auto max-h-[500px] leading-relaxed">
                    <pre className="text-[#1A0510]">
                      <code>{JSON.stringify(testResult.parsed_output, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {/* 3. VISUAL STORE PREVIEW TAB */}
                {previewTab === 'visual' && (
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#F7D1D8] space-y-4 max-h-[500px] overflow-y-auto">
                    {/* Google SEO Snippet Preview */}
                    {testResult.parsed_output?.meta_title && (
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-1">
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <span>https://rosevalleykannauj.com</span>
                          <span>›</span>
                          <span className="text-gray-400">products</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline line-clamp-1 cursor-pointer">
                          {testResult.parsed_output.meta_title}
                        </h4>
                        <p className="text-xs text-[#4d5156] line-clamp-2 leading-snug">
                          {testResult.parsed_output.meta_description}
                        </p>
                        {testResult.parsed_output.meta_keywords && (
                          <div className="pt-2 text-[10px] text-[#7A5866] border-t border-gray-100 flex flex-wrap gap-1">
                            <span className="font-bold">Keywords:</span>
                            {testResult.parsed_output.meta_keywords}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scent Pyramid Notes Preview */}
                    {testResult.parsed_output?.scent_notes && (
                      <div className="p-4 bg-[#FAE6E7]/50 rounded-xl border border-[#F7D1D8] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A1D41]">
                          Olfactory Pyramid
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-white rounded-lg border border-[#F7D1D8]">
                            <span className="text-[9px] font-bold text-[#8A1D41] block">TOP NOTES</span>
                            <span className="text-[10px] text-[#1A0510]">
                              {Array.isArray(testResult.parsed_output.scent_notes.top)
                                ? testResult.parsed_output.scent_notes.top.join(', ')
                                : testResult.parsed_output.scent_notes.top}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-[#F7D1D8]">
                            <span className="text-[9px] font-bold text-[#8A1D41] block">HEART NOTES</span>
                            <span className="text-[10px] text-[#1A0510]">
                              {Array.isArray(testResult.parsed_output.scent_notes.heart)
                                ? testResult.parsed_output.scent_notes.heart.join(', ')
                                : testResult.parsed_output.scent_notes.heart}
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-[#F7D1D8]">
                            <span className="text-[9px] font-bold text-[#8A1D41] block">BASE NOTES</span>
                            <span className="text-[10px] text-[#1A0510]">
                              {Array.isArray(testResult.parsed_output.scent_notes.base)
                                ? testResult.parsed_output.scent_notes.base.join(', ')
                                : testResult.parsed_output.scent_notes.base}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description Story Preview */}
                    {testResult.parsed_output?.description && (
                      <div className="p-4 bg-white rounded-xl border border-[#F7D1D8] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A1D41]">
                          Product Story & Description
                        </span>
                        <div className="text-xs text-[#1A0510] whitespace-pre-line leading-relaxed font-serif">
                          {testResult.parsed_output.description}
                        </div>
                      </div>
                    )}

                    {/* Customer Reviews Preview */}
                    {Array.isArray(testResult.parsed_output) && testResult.parsed_output[0]?.review && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A1D41]">
                          Generated Customer Reviews ({testResult.parsed_output.length})
                        </span>
                        {testResult.parsed_output.map((rev: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-[#F7D1D8] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#1A0510]">{rev.name}</span>
                              <span className="text-[10px] text-[#E6CA65] font-bold">★★★★★</span>
                            </div>
                            <h5 className="text-[11px] font-bold text-[#8A1D41]">{rev.title}</h5>
                            <p className="text-xs text-[#7A5866] leading-snug">{rev.review}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Plain Text / Markdown Preview */}
                    {!testResult.parsed_output?.meta_title && !testResult.parsed_output?.description && !Array.isArray(testResult.parsed_output) && (
                      <div className="p-4 bg-white rounded-xl border border-[#F7D1D8] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A1D41]">
                          Formatted Preview
                        </span>
                        <div className="text-xs text-[#1A0510] whitespace-pre-line leading-relaxed">
                          {testResult.raw_output}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SENT PROMPT TAB */}
                {previewTab === 'sent_prompt' && (
                  <div className="p-4 bg-[#14040C] text-[#D8B4C0] rounded-xl text-[11px] font-mono overflow-x-auto max-h-[500px] leading-relaxed border border-[#3E1124]">
                    <pre>
                      <code>{testResult.interpolated_prompt}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supabase SQL Schema Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#F7D1D8] flex items-center justify-between bg-[#FAE6E7]/50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#8A1D41]" />
                <div>
                  <h3 className="text-sm font-bold text-[#1A0510]">Supabase SQL Schema & Seeds</h3>
                  <p className="text-[11px] text-[#7A5866]">
                    Run this script in Supabase SQL Editor to initialize the <code>ai_prompts</code> table
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-[#F7D1D8] text-[#7A5866] hover:text-[#1A0510]"
              >
                Close
              </button>
            </div>

            <div className="p-4 bg-[#14040C] overflow-y-auto font-mono text-[11px] text-[#D8B4C0] flex-1">
              <pre>
                <code>{SUPABASE_AI_PROMPTS_SQL}</code>
              </pre>
            </div>

            <div className="p-4 border-t border-[#F7D1D8] bg-[#FAF8F5] flex items-center justify-between">
              <span className="text-xs text-[#7A5866]">
                File saved at: <code>database/ai_prompts_schema.sql</code>
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4A0D25] text-white hover:bg-[#340718] transition-all shadow-sm"
              >
                {copiedSql ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#E6CA65]" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
