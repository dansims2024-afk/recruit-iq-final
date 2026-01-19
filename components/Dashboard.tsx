"use client";

import { useState } from "react";
import { Loader2, Copy, Check, FileText, User } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"job" | "resume">("job");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: inputText, 
          type: activeTab 
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      // Handle potential different response structures (stream vs text)
      const text = data.result || data.text || JSON.stringify(data);
      setResult(text);
    } catch (error) {
      console.error(error);
      setResult("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
        
        {/* LEFT COLUMN - INPUT */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab("job")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "job"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              JOB DESCRIPTION
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "resume"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <User className="w-4 h-4" />
              RESUME
            </button>
          </div>

          {/* Text Area */}
          <div className="flex-1 bg-slate-800/30 rounded-2xl border border-slate-700/50 p-4 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <textarea
              className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 resize-none font-mono text-sm leading-relaxed"
              placeholder={activeTab === "job" ? "Paste Job Description logic here..." : "Paste Resume text here..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !inputText}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ANALYZING...
              </>
            ) : (
              "GENERATE ANALYSIS"
            )}
          </button>
        </div>

        {/* RIGHT COLUMN - OUTPUT */}
        <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden relative group">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 tracking-wider">
              AI ANALYSIS RESULTS
            </span>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "COPIED" : "COPY"}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {result ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {result}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
