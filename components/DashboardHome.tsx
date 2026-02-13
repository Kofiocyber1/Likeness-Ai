import React from 'react';
import { Plus, Mic, Shield, Copyright, BrainCircuit } from 'lucide-react';
import { FaceGroup, ViewState } from '../types';
import BiometricScanner from './BiometricScanner';

interface DashboardHomeProps {
  onNavigate: (view: ViewState) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const people: FaceGroup[] = [
    { id: '1', name: 'Me', count: 1240, coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400', type: 'People' },
    { id: '2', name: 'Family', count: 450, coverImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&h=400', type: 'Groups' },
    { id: '3', name: 'Studio Team', count: 89, coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&h=400', type: 'Groups' },
    { id: '4', name: 'Unknown', count: 12, coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400', type: 'People' },
  ];

  return (
    <div className="h-full overflow-hidden flex flex-col relative bg-white">
      {/* Background Animation - Subtle Walkers */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none opacity-5 z-0 flex items-end overflow-hidden">
         <div className="walker w-12 h-32 bg-black rounded-t-full absolute bottom-0 left-0"></div>
         <div className="walker w-14 h-36 bg-black rounded-t-full absolute bottom-0 left-[-100px]" style={{animationDelay: '2s'}}></div>
         <div className="walker w-10 h-28 bg-black rounded-t-full absolute bottom-0 left-[-200px]" style={{animationDelay: '5s'}}></div>
         <div className="walker w-16 h-40 bg-black rounded-t-full absolute bottom-0 left-[-300px]" style={{animationDelay: '7s'}}></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 pb-20 space-y-12">
            {/* Header */}
            <div className="flex justify-between items-end z-10 relative">
                <div>
                <h2 className="text-6xl font-black tracking-tighter mb-4">
                  <span className="text-[#0081C8]">L</span>
                  <span className="text-[#FCB131]">i</span>
                  <span className="text-[#000000]">k</span>
                  <span className="text-[#00A651]">e</span>
                  <span className="text-[#EE334E]">n</span>
                  <span className="text-[#0081C8]">e</span>
                  <span className="text-[#FCB131]">s</span>
                  <span className="text-[#000000]">s</span>
                  <span className="text-[#00A651] ml-3">A</span>
                  <span className="text-[#EE334E]">i</span>
                </h2>
                <p className="text-gray-500 font-medium max-w-md text-lg">
                    Command Center. Manage your Intellectual Property, Score Ideas, and Protect your Identity.
                </p>
                </div>
                <button className="bg-black text-white px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-[#EE334E] transition-colors flex items-center gap-2">
                    <Plus size={16} /> Add Visuals
                </button>
            </div>

            {/* Quick Actions Grid (Bringing back the "First Options") */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Option 1: Record & Score Idea */}
                <div 
                    onClick={() => onNavigate(ViewState.CHAT)}
                    className="p-6 bg-[#FCB131]/10 border border-[#FCB131]/30 hover:bg-[#FCB131] hover:text-white transition-all cursor-pointer group rounded-xl"
                >
                    <div className="flex justify-between items-start mb-8">
                        <BrainCircuit className="text-[#FCB131] group-hover:text-white" size={32} />
                        <span className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase rounded-sm">Score 98/100</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">Score Idea</h3>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Calculate Patent Potential</p>
                </div>

                {/* Option 2: Record Audio Note */}
                <div 
                    onClick={() => onNavigate(ViewState.CHAT)}
                    className="p-6 bg-[#0081C8]/10 border border-[#0081C8]/30 hover:bg-[#0081C8] hover:text-white transition-all cursor-pointer group rounded-xl"
                >
                    <div className="flex justify-between items-start mb-8">
                        <Mic className="text-[#0081C8] group-hover:text-white" size={32} />
                        <span className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase rounded-sm">Record</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">Voice Memo</h3>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Log IP via Voice</p>
                </div>

                {/* Option 3: Legal/Copyright */}
                <div 
                    onClick={() => onNavigate(ViewState.LEGAL)}
                    className="p-6 bg-[#EE334E]/10 border border-[#EE334E]/30 hover:bg-[#EE334E] hover:text-white transition-all cursor-pointer group rounded-xl"
                >
                    <div className="flex justify-between items-start mb-8">
                        <Shield className="text-[#EE334E] group-hover:text-white" size={32} />
                        <span className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase rounded-sm">Protect</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">Legal Defense</h3>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-wider">Copyright & Cease/Desist</p>
                </div>
            </div>

            {/* Embedded Scanner Section */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#00A651] rounded-full"></span>
                        Reality Scanner
                     </h3>
                     <span className="text-xs font-bold text-gray-400 uppercase">Detect Deepfakes</span>
                </div>
                <div className="w-full h-[500px] border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                    <BiometricScanner />
                </div>
            </div>

            {/* People Section */}
            <section className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-bold">People Collection</h3>
                    <span className="text-sm font-bold text-gray-400">{people.filter(p => p.type === 'People').length}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {people.filter(p => p.type === 'People').map(person => (
                        <div key={person.id} className="group cursor-pointer">
                            <div className="relative aspect-square overflow-hidden rounded-full border-4 border-transparent hover:border-[#FCB131] transition-all">
                                <img src={person.coverImage} alt={person.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <div className="mt-3 text-center">
                                <p className="font-bold text-sm">{person.name}</p>
                                <p className="text-xs text-gray-400">{person.count} Photos</p>
                            </div>
                        </div>
                    ))}
                    {/* Add New Placeholder */}
                    <div className="group cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-full aspect-square rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-black transition-colors">
                            <Plus className="text-gray-300 group-hover:text-black" />
                        </div>
                        <div className="mt-3 text-center">
                            <p className="font-bold text-sm text-gray-400 group-hover:text-black">Add Person</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Groups Section */}
            <section className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-bold">Matched Groups</h3>
                    <span className="text-sm font-bold text-gray-400">{people.filter(p => p.type === 'Groups').length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {people.filter(p => p.type === 'Groups').map(group => (
                        <div key={group.id} className="group cursor-pointer relative">
                            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                            </div>
                            <div className="absolute bottom-0 left-0 bg-white p-4 max-w-[80%]">
                                <h4 className="font-black text-lg uppercase tracking-tighter">{group.name}</h4>
                                <p className="text-xs font-bold text-[#0081C8]">{group.count} Matches Found</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;