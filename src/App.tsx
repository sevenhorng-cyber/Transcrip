import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileAudio, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Trash2,
  Mic,
  Languages,
  Sparkles,
  Send,
  MessageSquare,
  Bot
} from 'lucide-react';
import { transcribeAudio, askAssistant } from './services/gemini';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // AI Assistant States
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Please upload a valid audio file.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setTranscription('');
    setAssistantResponse('');
    setAssistantPrompt('');
    
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTranscription = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const base64 = await convertFileToBase64(file);
      const result = await transcribeAudio(base64, file.type);
      setTranscription(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during transcription.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAssistant = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!assistantPrompt.trim() || !transcription) return;

    setAiLoading(true);
    try {
      const response = await askAssistant(transcription, assistantPrompt);
      setAssistantResponse(response);
    } catch (err: any) {
      setError(err.message || 'Assistant failed to respond.');
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setAudioUrl(null);
    setTranscription('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe5ec] via-[#ffc2d1] to-[#ffe5ec] text-slate-900 font-sans p-4 md:p-8 selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden relative">
      {/* Sparkles and Stars Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: Math.random(), 
              scale: Math.random() * 0.5 + 0.5,
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%"
            }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
              y: [null, "-=20", null]
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            className="absolute text-white/60"
          >
            {i % 3 === 0 ? <Sparkles size={12 + Math.random() * 12} /> : "✦"}
          </motion.div>
        ))}
        
        {/* Large Gradient Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#fb6f92]/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ff8fab]/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 10, y: -5 }}
            className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-[#ff8fab] to-[#fb6f92] rounded-[2.5rem] shadow-xl shadow-rose-200 mb-6 text-white cursor-pointer border-4 border-white"
          >
            <Mic size={40} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2"
          >
            Transcribe<span className="text-indigo-500">Bunny</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 flex flex-col items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2 font-medium">
              <Languages size={18} className="text-rose-400" />
              <span>បទពិសោធន៍ថ្មីក្នុងការបំប្លែងសំឡេងជាអក្សរខ្មែរ</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white text-indigo-500 rounded-full text-xs font-bold border-2 border-indigo-50 shadow-sm">
              <Sparkles size={12} className="animate-pulse" />
              High Speed & Super Accuracy
            </div>
          </motion.div>
        </header>

        <main className="space-y-8">
          {/* Uploader Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border-4 border-white relative"
          >
            {!file ? (
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="p-16 border-4 border-dashed border-indigo-50 m-4 rounded-[2rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-rose-200 hover:bg-rose-50/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-rose-50/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden"
                />
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 group-hover:text-rose-500 group-hover:bg-rose-100 transition-all shadow-inner"
                >
                  <Upload size={36} />
                </motion.div>
                <div className="text-center z-10">
                  <p className="text-2xl font-black text-slate-700 mb-1">Upload Your Sound 🎵</p>
                  <p className="text-slate-400 font-medium tracking-wide text-sm">MP3, WAV, M4A, AAC supported</p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-50">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-sm">
                      <FileAudio size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-slate-800 break-all">{file.name}</p>
                      <p className="text-sm font-bold text-slate-300">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={reset}
                    className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                {audioUrl && (
                  <div className="mb-10 bg-slate-50 p-6 rounded-[2rem] border-2 border-white shadow-inner">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Audio Preview 🎧</p>
                    <audio src={audioUrl} controls className="w-full h-10 brightness-95" />
                  </div>
                )}

                <button
                  onClick={handleTranscription}
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-[#ff8fab] to-[#fb6f92] hover:from-[#fb6f92] hover:to-[#ff8fab] disabled:from-slate-200 disabled:to-slate-300 text-white font-black text-xl rounded-[2.5rem] shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Magic in progress ✨
                    </>
                  ) : (
                    <>
                      Let's Transcribe! 🎀
                      <motion.div 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.2, rotate: 15 }}
                      >
                        ✨
                      </motion.div>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] flex items-center gap-4 text-rose-600 shadow-sm"
              >
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Section */}
          <AnimatePresence>
            {transcription && (
              <div className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border-4 border-white overflow-hidden"
                >
                  <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <span className="text-xl font-black text-slate-800">Result</span>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full text-sm font-black transition-all"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={16} className="text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy text
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-10">
                    <div className="min-h-[200px] text-slate-800 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                      {transcription}
                    </div>
                  </div>
                </motion.div>

                {/* AI Assistant Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-100/50 border-4 border-white overflow-hidden"
                >
                  <div className="p-8 bg-gradient-to-r from-[#ff8fab] to-[#fb6f92] text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <Bot size={28} />
                      </div>
                      <span className="text-xl font-black">Bunny Assistant 🐰</span>
                    </div>
                    <Sparkles size={24} className="text-white/40 animate-pulse" />
                  </div>
                  
                  <div className="p-8 space-y-8">
                    {/* Assistant response */}
                    {assistantResponse && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-rose-50/50 border-2 border-rose-100/50 p-8 rounded-[2rem] relative"
                      >
                        <div className="absolute -top-4 left-8 px-4 py-1.5 bg-white border-2 border-rose-100 rounded-full text-xs font-black text-[#fb6f92] flex items-center gap-2 shadow-sm uppercase">
                          <MessageSquare size={14} />
                          Bunny's Answer
                        </div>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-bold">
                          {assistantResponse}
                        </div>
                      </motion.div>
                    )}

                    {/* Input form */}
                    <div className="space-y-4">
                      <form onSubmit={handleAskAssistant} className="relative">
                        <input 
                          type="text" 
                          value={assistantPrompt}
                          onChange={(e) => setAssistantPrompt(e.target.value)}
                          placeholder="សួរ AI ដូចជា៖ សង្ខេបអត្ថបទនេះ..."
                          className="w-full pl-8 pr-16 py-5 bg-rose-50/30 border-4 border-transparent focus:border-rose-100 focus:bg-white rounded-[2.5rem] transition-all text-slate-800 font-bold outline-none shadow-inner"
                        />
                        <button 
                          type="submit"
                          disabled={aiLoading || !assistantPrompt.trim()}
                          className="absolute right-3 top-3 bottom-3 w-12 bg-[#fb6f92] hover:bg-[#ff8fab] disabled:bg-slate-200 text-white rounded-[1.5rem] flex items-center justify-center transition-all shadow-lg shadow-rose-100 border-2 border-white/20"
                        >
                          {aiLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                      </form>

                      <div className="flex flex-wrap gap-2 px-2">
                        {[
                          { label: 'សង្ខេប (Summary) ✨', prompt: 'សង្ខេបអត្ថបទនេះឱ្យខ្លីខ្លឹម' },
                          { label: 'អ្នកនិយាយ (Speakers) 👥', prompt: 'តើអ្នកណាខ្លះជាអ្នកនិយាយ?' },
                          { label: 'ចំណុចសំខាន់ (Key points) 💡', prompt: 'តើចំណុចសំខាន់ៗអ្វីខ្លះ?' }
                        ].map((btn, idx) => (
                          <button 
                            key={idx}
                            onClick={() => { setAssistantPrompt(btn.prompt); handleAskAssistant(); }}
                            className="px-6 py-2.5 bg-white text-[#fb6f92] rounded-full text-xs font-black border-2 border-rose-100 hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2 hover:scale-105"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center pb-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-6 px-8 py-3 bg-white/40 backdrop-blur-md rounded-full border border-white text-rose-400 text-xs font-bold shadow-sm"
          >
            <div className="flex items-center gap-1.5 font-black uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" /> 100% VERBATIM</div>
            <div className="flex items-center gap-1.5 font-black uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-[#fb6f92] rounded-full animate-pulse" /> KHMER MAGIC</div>
            <div className="flex items-center gap-1.5 font-black uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" /> AI POWERED</div>
          </motion.div>
          <p className="mt-6 text-rose-300 text-[10px] font-black tracking-[0.3em] uppercase">
            Made with 🎀 for Transcribe Bunny
          </p>
        </footer>
      </div>
    </div>
  );
}
