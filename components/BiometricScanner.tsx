import React, { useRef, useState, useEffect } from 'react';
import { Camera, ScanFace, CheckCircle2, AlertTriangle, Upload, X, Share2, Network } from 'lucide-react';
import * as d3 from 'd3';
import { analyzeImageFaces } from '../services/geminiService';

interface DetectedFace {
  boundingBox: [number, number, number, number]; // ymin, xmin, ymax, xmax (0-1000)
  demographics: string;
  expression: string;
  isReal: boolean;
  similarityScore: number;
}

const BiometricScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // D3 Force Graph Animation for "Digital Footprint"
  useEffect(() => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    let width = svgElement.clientWidth;
    let height = svgElement.clientHeight;
    
    // Clear previous D3 content to prevent duplication on re-renders
    d3.select(svgElement).selectAll("*").remove();

    // Data for Digital Footprint Network
    const nodes = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      group: i % 5, // 5 different data source types corresponding to brand colors
      radius: Math.random() * 3 + 2
    }));

    const links = Array.from({ length: 60 }, () => ({
      source: Math.floor(Math.random() * 45),
      target: Math.floor(Math.random() * 45),
      value: Math.random()
    }));

    const svg = d3.select(svgElement)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Define Forces
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-30)) // Repel nodes
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(8));

    // Draw Links
    const link = svg.append("g")
      .attr("stroke", "#e5e7eb") // gray-200
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Draw Nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => {
          // Likeness Ai Brand Colors
          const colors = ["#0081C8", "#FCB131", "#000000", "#00A651", "#EE334E"];
          return colors[d.group];
      })
      .attr("opacity", 0.6);

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    // Handle Window Resize to keep graph centered
    const handleResize = () => {
        width = svgElement.clientWidth;
        height = svgElement.clientHeight;
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
    };
    window.addEventListener('resize', handleResize);

    // Animate on Scan State
    if (isScanning) {
        // Explode effect when scanning
        simulation.force("charge", d3.forceManyBody().strength(-150));
        simulation.alpha(1).restart();
    }

    return () => {
        simulation.stop();
        window.removeEventListener('resize', handleResize);
    };
  }, [isScanning, selectedImage]); 

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setIsScanning(true);
        setFaces([]);
        setError(null);

        try {
          const base64Data = base64String.split(',')[1];
          const result = await analyzeImageFaces(base64Data, file.type);
          
          if (result.faces && Array.isArray(result.faces)) {
             setFaces(result.faces);
          } else {
             setError("No faces detected.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to analyze image. Please try again.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetScan = () => {
    setSelectedImage(null);
    setFaces([]);
    setError(null);
  };

  const getBoxStyle = (box: [number, number, number, number]) => {
    const [ymin, xmin, ymax, xmax] = box;
    return {
      top: `${ymin / 10}%`,
      left: `${xmin / 10}%`,
      height: `${(ymax - ymin) / 10}%`,
      width: `${(xmax - xmin) / 10}%`,
    };
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white relative overflow-hidden p-8">
       {/* D3 Background Layer */}
       <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <svg ref={svgRef} className="w-full h-full" />
       </div>
       
       {/* Central Scanner UI */}
       <div className="relative z-10 text-center w-full max-w-2xl">
           
           {!selectedImage && (
               <>
                <h2 className="text-5xl font-black mb-6 tracking-tighter">FACE <span className="text-[#EE334E]">RECOGNITION</span></h2>
                <p className="text-gray-500 mb-12 text-lg relative z-20">
                    Upload a photo to detect faces, analyze authenticity, and check for deepfakes using Google's advanced computer vision.
                </p>
                
                <div 
                    onClick={triggerUpload}
                    className="w-64 h-64 mx-auto border-4 border-black rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all group relative overflow-hidden bg-white"
                >
                    <div className="text-center relative z-10">
                        <Camera size={48} className="mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-sm">Upload to Scan</span>
                    </div>
                </div>
                
                {/* D3 Label */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Network size={14} />
                    <span>Analyzing 40B+ Digital Footprints</span>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                />
               </>
           )}

           {selectedImage && (
             <div className="relative w-full h-[400px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-lg group">
                {/* Close Button */}
                <button 
                  onClick={resetScan}
                  className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full hover:bg-white text-black transition-colors"
                >
                  <X size={20} />
                </button>

                {/* The Image */}
                <img 
                  src={selectedImage} 
                  alt="Scan Target" 
                  className="w-full h-full object-contain relative z-0" 
                />

                {/* Scanning Animation Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/10 z-10 flex flex-col items-center justify-center backdrop-blur-[2px]">
                     <div className="w-full h-1 bg-[#EE334E] shadow-[0_0_15px_#EE334E] absolute animate-scan"></div>
                     <div className="bg-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl animate-pulse mt-32">
                        <ScanFace className="animate-spin text-[#0081C8]" />
                        <span className="font-bold uppercase text-xs tracking-widest">Identifying Biometrics...</span>
                     </div>
                  </div>
                )}

                {/* Detected Faces Bounding Boxes */}
                {!isScanning && faces.map((face, idx) => (
                  <div 
                    key={idx}
                    className="absolute border-2 border-[#00A651] z-20 shadow-[0_0_20px_rgba(0,166,81,0.5)] transition-all duration-500 hover:bg-[#00A651]/10 group/box"
                    style={getBoxStyle(face.boundingBox)}
                  >
                     {/* Face Tag */}
                     <div className="absolute -top-10 left-0 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase whitespace-nowrap opacity-0 group-hover/box:opacity-100 transition-opacity">
                        {face.demographics} • {Math.round(face.similarityScore)}% Match
                     </div>
                     {/* Corners */}
                     <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white"></div>
                     <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white"></div>
                     <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white"></div>
                     <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white"></div>
                  </div>
                ))}
                
                {/* Result Summary */}
                {!isScanning && faces.length > 0 && (
                   <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm p-4 border-t border-gray-100 z-30 flex justify-between items-center animate-[fadeIn_0.5s_ease-out]">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-full ${faces.every(f => f.isReal) ? 'bg-[#00A651]/10 text-[#00A651]' : 'bg-[#EE334E]/10 text-[#EE334E]'}`}>
                            {faces.every(f => f.isReal) ? <CheckCircle2 /> : <AlertTriangle />}
                         </div>
                         <div className="text-left">
                            <h4 className="font-black text-lg uppercase leading-none mb-1">
                                {faces.length} Face{faces.length !== 1 ? 's' : ''} Detected
                            </h4>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                {faces[0].expression} • {faces.every(f => f.isReal) ? 'Authentic Likeness' : 'Potential AI Manipulation'}
                            </p>
                         </div>
                      </div>
                      <button className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#0081C8] transition-colors flex items-center gap-2">
                          <Share2 size={12} /> Save
                      </button>
                   </div>
                )}
                
                {!isScanning && faces.length === 0 && !error && (
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase">
                      No Faces Detected
                   </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                         <div className="text-[#EE334E] font-bold">{error}</div>
                    </div>
                )}
             </div>
           )}
       </div>

       {/* Background Aesthetics */}
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0081C8] via-[#FCB131] via-[#000000] via-[#00A651] to-[#EE334E]"></div>
       
       {/* CSS Animation */}
       <style>{`
         @keyframes scan {
             0% { top: 0%; }
             100% { top: 100%; }
         }
         .animate-scan {
             animation: scan 2s linear infinite;
         }
       `}</style>
    </div>
  );
};

export default BiometricScanner;