import React, { useState } from 'react';
import { generateLegalDoc } from '../services/geminiService';
import { FileWarning, CheckCircle, Copy, AlertTriangle } from 'lucide-react';

const LegalAction: React.FC = () => {
  const [formData, setFormData] = useState({
    violator: '',
    asset: '',
    description: ''
  });
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!formData.violator || !formData.asset) return;
    
    setLoading(true);
    try {
        const doc = await generateLegalDoc(formData.violator, formData.asset, formData.description);
        setGeneratedDoc(doc);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full max-w-6xl mx-auto p-8">
      <div className="space-y-6">
        <div className="bg-gray-50 p-8 border border-gray-100">
            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-2 tracking-tight">
                <AlertTriangle className="text-[#EE334E]" strokeWidth={2.5} />
                Report Infringement
            </h2>
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Violator Name / Entity</label>
                    <input 
                        type="text" 
                        className="w-full bg-white border border-gray-200 p-4 text-black focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-300 font-medium"
                        placeholder="e.g. UnauthAI Corp"
                        value={formData.violator}
                        onChange={e => setFormData({...formData, violator: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Protected Asset</label>
                    <input 
                        type="text" 
                        className="w-full bg-white border border-gray-200 p-4 text-black focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-300 font-medium"
                        placeholder="e.g. MyVoice_V1"
                        value={formData.asset}
                        onChange={e => setFormData({...formData, asset: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description of Unauthorized Use</label>
                    <textarea 
                        className="w-full bg-white border border-gray-200 p-4 text-black focus:ring-2 focus:ring-black focus:outline-none h-32 resize-none placeholder-gray-300 font-medium"
                        placeholder="Describe where and how your asset was found..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-[#EE334E] hover:bg-black text-white font-bold py-4 transition-colors flex justify-center items-center gap-2 uppercase tracking-widest text-sm"
                >
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <FileWarning size={18} />}
                    Generate Cease & Desist
                </button>
            </div>
        </div>

        <div className="bg-[#0081C8]/10 border border-[#0081C8]/20 p-6">
            <h3 className="text-[#0081C8] font-black uppercase tracking-wide mb-2">Automated Billing</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium">
                Alternatively, send an automated invoice for unauthorized usage based on standard licensing rates.
            </p>
            <button className="w-full bg-white hover:bg-gray-50 text-[#0081C8] border border-[#0081C8]/30 font-bold py-3 uppercase tracking-wider text-xs transition-colors">
                Generate Invoice ($)
            </button>
        </div>
      </div>

      <div className="bg-gray-100 flex flex-col overflow-hidden border border-gray-200">
        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <span className="font-mono text-xs text-gray-400 font-bold">PREVIEW: CEASE_DESIST.DOCX</span>
            {generatedDoc && (
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-black flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                    <Copy size={14} /> Copy Text
                </button>
            )}
        </div>
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 text-black">
            {generatedDoc ? (
                <div className="whitespace-pre-wrap max-w-2xl mx-auto shadow-xl bg-white p-12 min-h-[500px] font-serif leading-loose text-sm">
                    {generatedDoc}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                    <FileWarning size={64} className="mb-4" />
                    <p className="font-bold uppercase tracking-widest">Document will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LegalAction;