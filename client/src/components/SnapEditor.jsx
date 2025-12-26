import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Music, MapPin, Type, Smile, RotateCcw, Send, Undo2, Redo2, Image as ImageIcon, Sparkles, Move, Trash2 } from 'lucide-react';
import api from '../api';

export default function SnapEditor({ onClose, onPosted }) {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const overlayInputRef = useRef(null);
    const videoRef = useRef(null);

    const [image, setImage] = useState(null); // Base image
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [overlays, setOverlays] = useState([]); 
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    
    // UI State
    const [activeId, setActiveId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [showTextTools, setShowTextTools] = useState(false);
    const [showStickers, setShowStickers] = useState(false);
    const [showGifs, setShowGifs] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textFont, setFont] = useState('sans-serif');
    
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [caption] = useState("My Daily Snap");

    const fonts = [
        { name: 'Sans', value: 'sans-serif' },
        { name: 'Serif', value: 'serif' },
        { name: 'Mono', value: 'monospace' },
        { name: 'Cursive', value: 'cursive' },
        { name: 'Impact', value: 'Impact, sans-serif' }
    ];

    const colors = ['#ffffff', '#ff2e63', '#08d9d6', '#eaeaea', '#252a34', '#ffc107', '#4caf50', '#9c27b0'];

    // --- History Management ---
    const saveToHistory = useCallback(() => {
        // Use shallow copy of array + shallow copies of objects to preserve Image instances
        setHistory(prev => [...prev.slice(-19), overlays.map(o => ({ ...o }))]);
        setRedoStack([]);
    }, [overlays]);

    const undo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setRedoStack(prev => [...prev, overlays.map(o => ({ ...o }))]);
        setOverlays(previous);
        setHistory(prev => prev.slice(0, -1));
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setHistory(prev => [...prev, overlays.map(o => ({ ...o }))]);
        setOverlays(next);
        setRedoStack(prev => prev.slice(0, -1));
    };

    // --- Interaction Logic ---
    useEffect(() => {
        if (image && canvasRef.current) {
            drawCanvas();
        }
    }, [image, overlays, activeId]);

    const stopCameraStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleFileChange = (e, isOverlay = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    if (isOverlay) {
                        saveToHistory();
                        const newOverlay = {
                            id: Date.now(),
                            type: 'photo',
                            content: img,
                            x: 200,
                            y: 300,
                            scale: 0.5,
                            rotation: 0
                        };
                        setOverlays(prev => [...prev, newOverlay]);
                    } else {
                        setImage(img);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        setImage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error", err);
            setIsCameraOpen(false);
            alert("Could not access camera");
        }
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext('2d');

            const vRatio = video.videoWidth / video.videoHeight;
            const cRatio = canvas.width / canvas.height;
            let sWidth, sHeight, sx, sy;

            if (cRatio > vRatio) {
                sWidth = video.videoWidth;
                sHeight = video.videoWidth / cRatio;
                sx = 0;
                sy = (video.videoHeight - sHeight) / 2;
            } else {
                sWidth = video.videoHeight * cRatio;
                sHeight = video.videoHeight;
                sx = (video.videoWidth - sWidth) / 2;
                sy = 0;
            }

            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

            const img = new Image();
            img.onload = () => {
                setImage(img);
                setIsCameraOpen(false);
                stopCameraStream();
            };
            img.src = tempCanvas.toDataURL('image/png');
        }
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Base image
        if (image) {
            const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
            const x = (canvas.width / 2) - (image.width / 2) * scale;
            const y = (canvas.height / 2) - (image.height / 2) * scale;
            ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Overlays
        overlays.forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate((item.rotation || 0) * Math.PI / 180);
            const scale = item.scale || 1;

            if (item.type === 'text') {
                ctx.font = `bold ${30 * scale}px ${item.font || 'sans-serif'}`;
                ctx.fillStyle = item.color || 'white';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(item.content, 0, 0);
            } else if (item.type === 'sticker' || item.type === 'gif') {
                ctx.font = `${50 * scale}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(item.content, 0, 0);
            } else if (item.type === 'photo') {
                const w = item.content.width * scale;
                const h = item.content.height * scale;
                ctx.drawImage(item.content, -w / 2, -h / 2, w, h);
            }

            // Selection box
            if (item.id === activeId) {
                ctx.strokeStyle = '#08d9d6';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                
                let bw = 80, bh = 80;
                if (item.type === 'photo') {
                    bw = item.content.width * scale + 20;
                    bh = item.content.height * scale + 20;
                }
                ctx.strokeRect(-bw/2, -bh/2, bw, bh);
            }
            ctx.restore();
        });
    };

    const onMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
        const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

        // Find clicked overlay (topmost first)
        for (let i = overlays.length - 1; i >= 0; i--) {
            const item = overlays[i];
            let hit = false;
            const scale = item.scale || 1;
            
            if (item.type === 'photo') {
                const w = item.content.width * scale;
                const h = item.content.height * scale;
                // Rough rotation-unaware box check
                if (x >= item.x - w/2 && x <= item.x + w/2 && y >= item.y - h/2 && y <= item.y + h/2) {
                    hit = true;
                }
            } else {
                const dist = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
                if (dist < 40 * scale) hit = true;
            }

            if (hit) {
                setActiveId(item.id);
                setIsDragging(true);
                setDragOffset({ x: x - item.x, y: y - item.y });
                return;
            }
        }
        setActiveId(null);
    };

    const onMouseMove = (e) => {
        if (!isDragging || activeId === null) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
        const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

        setOverlays(prev => prev.map(item => 
            item.id === activeId ? { ...item, x: x - dragOffset.x, y: y - dragOffset.y } : item
        ));
    };

    const stopDrag = () => {
        if (isDragging) saveToHistory();
        setIsDragging(false);
    };

    const updateActive = (props) => {
        if (!activeId) return;
        saveToHistory();
        setOverlays(prev => prev.map(item => item.id === activeId ? { ...item, ...props } : item));
    };

    const deleteActive = () => {
        if (!activeId) return;
        saveToHistory();
        setOverlays(prev => prev.filter(item => item.id !== activeId));
        setActiveId(null);
    };

    // --- Tool Actions ---
    const addText = () => {
        if (!textInput.trim()) return;
        saveToHistory();
        setOverlays([...overlays, {
            id: Date.now(),
            type: 'text',
            content: textInput,
            x: 200,
            y: 300,
            color: textColor,
            font: textFont,
            scale: 1,
            rotation: 0
        }]);
        setTextInput('');
        setShowTextTools(false);
    };

    const addSticker = (content) => {
        saveToHistory();
        setOverlays([...overlays, {
            id: Date.now(),
            type: 'sticker',
            content,
            x: 200,
            y: 300,
            scale: 1,
            rotation: 0
        }]);
        setShowStickers(false);
        setShowGifs(false);
    };

    const handleFontChange = (f) => {
        setFont(f);
        if (activeId) {
            const active = overlays.find(o => o.id === activeId);
            if (active && active.type === 'text') {
                updateActive({ font: f });
            }
        }
    };

    const handleColorChange = (c) => {
        setTextColor(c);
        if (activeId) {
            const active = overlays.find(o => o.id === activeId);
            if (active && active.type === 'text') {
                updateActive({ color: c });
            }
        }
    };

    const handlePost = async () => {
        setIsUploading(true);
        try {
            await api.post('/snaps', {
                image: canvasRef.current.toDataURL('image/jpeg', 0.8),
                caption,
                song: selectedSong,
                location: selectedLocation ? JSON.stringify(selectedLocation) : null
            });
            onPosted(); onClose();
        } catch (err) {
            alert("Failed to post snap");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000, background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
            {/* Header */}
            <div style={{ padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' }}>
                <button onClick={() => { stopCameraStream(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X /></button>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button onClick={undo} style={{ background: 'none', border: 'none', color: history.length ? 'var(--text-primary)' : 'rgba(128,128,128,0.5)', cursor: 'pointer' }}><Undo2 size={20}/></button>
                    <button onClick={redo} style={{ background: 'none', border: 'none', color: redoStack.length ? 'var(--text-primary)' : 'rgba(128,128,128,0.5)', cursor: 'pointer' }}><Redo2 size={20}/></button>
                </div>

                <button onClick={handlePost} disabled={!image || isUploading} style={{ background: 'none', border: 'none', color: image ? 'var(--accent-color)' : 'gray', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isUploading ? 'SAVING...' : 'SHARE'}
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    {!image && !isCameraOpen && (
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
                            <button 
                                onClick={() => setIsCameraOpen(true)} 
                                className="btn-primary" 
                                style={{ 
                                    padding: '15px 30px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px',
                                    background: 'var(--accent-color)'
                                }}
                            >
                                <Camera size={24} />
                                <span>Open Camera</span>
                            </button>

                            <button 
                                onClick={() => fileInputRef.current.click()} 
                                className="btn-primary" 
                                style={{ 
                                    padding: '15px 30px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                <ImageIcon size={24} />
                                <span>Upload Photo</span>
                            </button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, false)} />
                        </div>
                    )}

                    {isCameraOpen && (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={capturePhoto} style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 70, height: 70, borderRadius: '50%', background: 'white', border: '5px solid rgba(0,0,0,0.2)', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.3)' }} />
                        </div>
                    )}

                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={600}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={stopDrag}
                        onMouseLeave={stopDrag}
                        style={{ maxWidth: '90%', maxHeight: '90%', display: image ? 'block' : 'none', cursor: isDragging ? 'grabbing' : 'crosshair' }}
                    />

                    {/* Active Element Controls */}
                    {activeId && (
                        <div className="glass-panel" style={{ 
                            position: 'absolute', 
                            bottom: '30px', 
                            padding: '12px 24px', 
                            display: 'flex', 
                            gap: '20px', 
                            alignItems: 'center',
                            animation: 'slideInUp 0.3s ease',
                            background: 'var(--glass-bg)',
                            color: 'var(--text-primary)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button onClick={() => updateActive({ scale: (overlays.find(o => o.id === activeId).scale || 1) - 0.1 })} className="control-btn"><Minus size={18}/></button>
                                <span style={{ fontSize: '0.8em', fontWeight: 'bold', opacity: 0.6 }}>SIZE</span>
                                <button onClick={() => updateActive({ scale: (overlays.find(o => o.id === activeId).scale || 1) + 0.1 })} className="control-btn"><Plus size={18}/></button>
                            </div>
                            
                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

                            <button onClick={() => updateActive({ rotation: (overlays.find(o => o.id === activeId).rotation || 0) + 15 })} className="control-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RotateCw size={18}/>
                                <span style={{ fontSize: '0.8em', fontWeight: 'bold' }}>TILT</span>
                            </button>

                            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

                            <button onClick={deleteActive} style={{ background: 'rgba(255,46,99,0.1)', border: 'none', color: '#ff2e63', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}>
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    )}

                    {/* Sub-panels */}
                    {showTextTools && (
                        <div className="glass-panel" style={{ position: 'absolute', top: 40, width: '300px', padding: '20px', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
                            <input 
                                value={textInput} 
                                onChange={e => setTextInput(e.target.value)} 
                                placeholder="Type here..." 
                                autoFocus 
                                style={{ 
                                    fontFamily: textFont, 
                                    color: textColor,
                                    borderBottom: `2px solid ${textColor}`
                                }}
                            />
                            <div style={{ display: 'flex', gap: '5px', margin: '15px 0', flexWrap: 'wrap' }}>
                                {fonts.map(f => (
                                    <button 
                                        key={f.value} 
                                        onClick={() => handleFontChange(f.value)} 
                                        style={{ 
                                            padding: '6px 12px', 
                                            fontSize: '0.75em', 
                                            background: textFont === f.value ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', 
                                            border: 'none', 
                                            color: 'var(--text-primary)', 
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontFamily: f.value
                                        }}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                {colors.map(c => (
                                    <div 
                                        key={c} 
                                        onClick={() => handleColorChange(c)} 
                                        style={{ 
                                            width: 24, 
                                            height: 24, 
                                            background: c, 
                                            borderRadius: '50%', 
                                            border: textColor === c ? '2px solid var(--text-primary)' : '2px solid transparent', 
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                        }} 
                                    />
                                ))}
                            </div>
                            <button onClick={addText} className="btn-primary" style={{ width: '100%' }}>ADD TEXT</button>
                        </div>
                    )}

                    {(showStickers || showGifs) && (
                        <div className="glass-panel" style={{ position: 'absolute', top: 40, width: '300px', padding: '20px', maxHeight: '300px', overflowY: 'auto', background: 'var(--glass-bg)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {(showStickers ? ['🔥', '🥰', '🎉', '🍕', '🐶', '👑', '💀', '👽', '✨', '🌈'] : ['https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXp4OHV4OXp4OXp4OXp4OXp4OXp4OXp4OXp4OXp4OXp4OXp4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx4S0S9U568/giphy.gif', 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXp4OHV4OXp4OXp4OXp4OXp4OXp4OXp4OXp4OXp4OXp4OXp4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlU0N8u6u4S6Cms/giphy.gif']).map(item => (
                                    <div key={item} onClick={() => addSticker(item)} style={{ cursor: 'pointer', fontSize: '2em', textAlign: 'center' }}>
                                        {showStickers ? item : <Sparkles size={24} color="var(--text-primary)"/>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ width: '80px', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '25px', borderLeft: '1px solid var(--glass-border)' }}>
                    <div onClick={() => { setShowTextTools(!showTextTools); setShowStickers(false); setShowGifs(false); }} className="tool-btn"><Type color={showTextTools ? 'var(--accent-color)' : 'var(--text-primary)'}/></div>
                    <div onClick={() => { setShowStickers(!showStickers); setShowTextTools(false); setShowGifs(false); }} className="tool-btn"><Smile color={showStickers ? 'var(--accent-color)' : 'var(--text-primary)'}/></div>
                    <div onClick={() => { setShowGifs(!showGifs); setShowTextTools(false); setShowStickers(false); }} className="tool-btn"><Sparkles color={showGifs ? 'var(--accent-color)' : 'var(--text-primary)'}/></div>
                    <div onClick={() => overlayInputRef.current.click()} className="tool-btn"><ImageIcon color="var(--text-primary)"/></div>
                    <div onClick={() => {/* loc logic */}} className="tool-btn"><MapPin color="var(--text-primary)"/></div>
                    <div onClick={() => { setImage(null); setOverlays([]); }} style={{ marginTop: 'auto' }} className="tool-btn"><RotateCcw size={20} color="var(--text-primary)"/></div>
                    <input type="file" ref={overlayInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, true)} />
                </div>
            </div>
            <style>{`
                .tool-btn { cursor: pointer; opacity: 0.8; transition: 0.2s; }
                .tool-btn:hover { opacity: 1; transform: scale(1.1); }
                .control-btn { 
                    background: var(--glass-bg); 
                    border: 1px solid var(--glass-border); 
                    color: var(--text-primary); 
                    padding: 8px; 
                    border-radius: 10px; 
                    cursor: pointer; 
                    transition: 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .control-btn:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
                .glass-panel input { 
                    background: rgba(255,255,255,0.05); 
                    border: 1px solid rgba(255,255,255,0.1); 
                    color: var(--text-primary); 
                    padding: 12px; 
                    border-radius: 8px; 
                    width: 100%; 
                    box-sizing: border-box;
                    outline: none;
                }
                
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
