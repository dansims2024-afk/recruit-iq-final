import React, { useState, useRef } from 'react';
import { Upload, Sparkles, FileText, Info, CheckCircle } from 'lucide-react';

const RecruitIQDashboard = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef(null);

  const handleFileUpload = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    if (type === 'jd') setActiveTab(2); // Auto-advance to next step
  };

  const useSample = (type) => {
    const sampleNames = { jd: "Senior_Product_Designer_JD.pdf", resume: "John_Doe_Resume_2025.pdf" };
    setFiles(prev => ({ ...prev, [type]: { name: sampleNames[type], size: '1.2MB' } }));
  };

  const isReady = files.jd && files.resume;

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8 font-sans">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <h1 className="text-xl font-bold tracking-tight">RECRUIT <span className="text-blue-400">IQ</span></h1>
        </div>
        <div className="bg-[#11141d] p-1 rounded-lg flex gap-2 border border-gray-800">
          <button className="px-4 py-1.5 text-xs font-semibold bg-[#2a2e3b] rounded-md">STANDARD (FREE)</button>
          <button className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-white transition">PRO ($29.99)</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The Main Tool */}
        <div className="lg:col-span-7 bg-[#0d1117] rounded-3xl border border-gray-800/50 overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button 
              onClick={() => setActiveTab(1)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold transition ${activeTab === 1 ? 'bg-[#161b22] text-blue-400' : 'text-gray-500'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${files.jd ? 'bg-green-500 text-white' : 'bg-blue-600/20 text-blue-400'}`}>
                {files.jd ? <CheckCircle size={12}/> : '1'}
              </span>
              UPLOAD JD
            </button>
            <button 
              onClick={() => setActiveTab(2)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold transition ${activeTab === 2 ? 'bg-[#161b22] text-blue-400' : 'text-gray-500'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${files.resume ? 'bg-green-500 text-white' : 'bg-blue-600/20 text-blue-400'}`}>
                {files.resume ? <CheckCircle size={12}/> : '2'}
              </span>
              UPLOAD RESUME
            </button>
          </div>

          <div className="p-8">
            {/* Upload Area */}
            <div className="mb-8">
              <label className="group cursor-pointer block">
                <div className="border-2 border-dashed border-gray-800 group-hover:border-blue-500/50 rounded-2xl p-12 text-center transition-all bg-[#0a0d12]">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(activeTab === 1 ? 'jd' : 'resume', e.target.files[0])}
                  />
                  <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    {activeTab === 1 ? 'Drop Job Description here' : 'Drop Resume here'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">Support PDF, DOCX or TXT</p>
                  <div className="flex justify-center gap-4">
                     <span className="text-blue-400 text-sm font-semibold hover:underline">Browse Files</span>
                     <span className="text-gray-700">|</span>
                     <button onClick={(e) => {e.preventDefault(); useSample(activeTab === 1 ? 'jd' : 'resume')}} className="text-gray-400 text-sm hover:text-white underline decoration-gray-600">Try a Sample</button>
                  </div>
                </div>
              </label>

              {/* File Status Indicator */}
              {(activeTab === 1 ? files.jd : files.resume) && (
                <div className="mt-4 flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                  <FileText className="text-green-500" size={18} />
                  <span className="text-sm text-green-200">{(activeTab === 1 ? files.jd : files.resume).name} uploaded successfully!</span>
                </div>
              )}
            </div>

            {/* Step 3: Run Scan */}
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isReady ? 'bg-orange-500' : 'bg-gray-800 text-gray-500'}`}>3</div>
              <button 
                disabled={!isReady}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                  isReady 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-[1.02]' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles size={18} />
                RUN SYNERGY SCAN
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Quick Start */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] p-6 rounded-3xl border border-gray-800 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Info size={20} />
              <h2 className="font-bold tracking-wide uppercase text-sm">Quick Start Guide</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="text-gray-500 font-mono text-sm mt-1">01.</div>
                <p className="text-gray-300 text-sm leading-relaxed">Upload the <span className="text-white font-medium">Job Description</span> to define the benchmark.</p>
              </li>
              <li className="flex gap-3">
                <div className="text-gray-500 font-mono text-sm mt-1">02.</div>
                <p className="text-gray-300 text-sm leading-relaxed">Provide your <span className="text-white font-medium">Resume</span> to analyze the alignment.</p>
              </li>
              <li className="flex gap-3">
                <div className="text-gray-500 font-mono text-sm mt-1">03.</div>
                <p className="text-gray-300 text-sm leading-relaxed">Our AI will generate a <span className="text-orange-400 font-medium font-mono">SYNERGY SCORE</span> and specific advice.</p>
              </li>
            </ul>
          </div>

          <div className="bg-[#11141d]/50 p-6 rounded-3xl border border-dashed border-gray-800">
            <h3 className="text-xs font-bold text-gray-600 uppercase mb-3">Analysis Features</h3>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-[#161b22] p-3 rounded-lg text-[11px] text-gray-400 border border-gray-800">ATS Optimization</div>
               <div className="bg-[#161b22] p-3 rounded-lg text-[11px] text-gray-400 border border-gray-800">Skill Gap Finder</div>
               <div className="bg-[#161b22] p-3 rounded-lg text-[11px] text-gray-400 border border-gray-800">Keyword Suggestion</div>
               <div className="bg-[#161b22] p-3 rounded-lg text-[11px] text-gray-400 border border-gray-800">Interview Prep</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitIQDashboard;
