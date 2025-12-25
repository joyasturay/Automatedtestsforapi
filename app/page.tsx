"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Play, Save, CheckCircle2, XCircle, Loader2, Code2, Copy, AlertCircle } from "lucide-react";

export default function Home() {
  const [codeSnippet, setCodeSnippet] = useState("");
  const [targetUrl, setTargetUrl] = useState("http://localhost:3000/api/test-route");
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [uiTests, setUiTests] = useState<any[]>([]);
  const [testFileContent, setTestFileContent] = useState("");
  const [results, setResults] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false); // New state for copy feedback

  // 1. Generate & Run
  const generateTests = async () => {
    setLoading(true);
    setUiTests([]);
    setTestFileContent("");
    setResults({});
    
    try {
      const response = await axios.post("/api/generate-tests", { codeSnippet,targetUrl });
      const data = response.data.tests; 
      
      setUiTests(data.uiTestCases);
      setTestFileContent(data.testFileContent);
      
      await runUiTests(data.uiTestCases);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Run UI Tests
  const runUiTests = async (testCases: any[]) => {
    const newResults: any = {};
    for (const test of testCases) {
      try {
        const res = await axios.post(targetUrl, test.input, { validateStatus: () => true });
        const passed = res.status === test.expectedStatus;
        newResults[test.name] = { passed, actualStatus: res.status, expectedStatus: test.expectedStatus };
      } catch (err) {
        newResults[test.name] = { passed: false, actualStatus: "ERR", expectedStatus: test.expectedStatus };
      }
      await new Promise(r => setTimeout(r, 200));
      setResults({ ...newResults });
    }
  };

  // 3. Save to Disk
  const saveToDisk = async () => {
    if (!testFileContent) return;
    setSaving(true);
    try {
      await axios.post("/api/save-test", { fileContent: testFileContent });
      alert("✅ File saved to /__tests__/generated.test.js");
    } catch (error) {
      alert("❌ Failed to save file. (Are you on Vercel? Use Copy instead!)");
    } finally {
      setSaving(false);
    }
  };

  // 4. NEW: Copy to Clipboard
  const copyToClipboard = () => {
    if (!testFileContent) return;
    navigator.clipboard.writeText(testFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: Input */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
              <Terminal className="w-8 h-8" />
              AutoTest.ai
            </h1>
            <p className="text-gray-500 mt-2">Autonomous Test Scaffolding Agent</p>
          </header>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Target Endpoint</label>
              <input 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-lg p-4 text-sm focus:outline-none focus:border-white transition-colors font-mono text-gray-300"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Route Code</label>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full h-[500px] bg-[#111] border border-[#333] rounded-lg p-4 text-sm font-mono text-gray-300 focus:outline-none focus:border-white transition-colors resize-none leading-relaxed"
                placeholder="// Paste your route.ts here..."
              />
            </div>

            <button
              onClick={generateTests}
              disabled={loading || !codeSnippet}
              className="w-full bg-white text-black font-bold h-14 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Generating...</> : <><Play className="w-5 h-5 fill-current" /> Generate & Run Tests</>}
            </button>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Results */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 h-fit min-h-[600px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              Live Validation
            </h2>
            {uiTests.length > 0 && <span className="text-xs font-mono text-gray-500">{uiTests.length} CASES</span>}
          </div>

          <div className="flex-1 space-y-3">
            <AnimatePresence>
              {uiTests.length === 0 && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                  <Code2 className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Waiting for code input...</p>
                </motion.div>
              )}

              {uiTests.map((test, idx) => {
                const result = results[test.name];
                const passed = result?.passed;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative p-4 rounded-lg bg-[#111] border border-[#222] hover:border-[#444] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm text-gray-200">{test.name}</h3>
                      {passed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{test.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-wider">
                      <div className="bg-black p-2 rounded text-gray-400">Expected: <span className="text-white">{test.expectedStatus}</span></div>
                      <div className={`bg-black p-2 rounded ${passed ? "text-white" : "text-white line-through decoration-red-500"}`}>Actual: {result?.actualStatus ?? "..."}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          {uiTests.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 pt-6 border-t border-[#222] space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {/* Save Button */}
                <button 
                  onClick={saveToDisk}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg border border-[#333] hover:bg-[#151515] transition-all text-sm font-medium text-gray-300"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save File
                </button>

                {/* Copy Button */}
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white text-black hover:bg-gray-200 transition-all text-sm font-bold"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              
              {/* Disclaimer */}
              <div className="flex items-start gap-2 text-[10px] text-gray-500 bg-[#111] p-3 rounded border border-[#222]">
                <AlertCircle className="w-4 h-4 text-gray-600 shrink-0" />
                <p>
                  <strong className="text-gray-400">Deployed on Vercel?</strong> The "Save" button won't work due to serverless limitations. Please use "Copy Code" and create the file manually.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}