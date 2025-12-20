import React, { useRef, useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { Camera, X, Check, Music, MapPin, Type, Sticker, Download, RotateCcw, Send, Smile } from 'lucide-react';

import api from '../api';
import TiltedGlassCard from './TiltedGlassCard';

export default function SnapEditor({ onClose, onPosted }) {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);

    const [image, setImage] = useState(null); // The base image
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const [overlays, setOverlays] = useState([]); // Array of { type: 'text'|'sticker', content, x, y, color }
    const [textInput, setTextInput] = useState('');
    const [showTextTools, setShowTextTools] = useState(false);
    const [showStickers, setShowStickers] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null); // Renamed from 'song'
    const [selectedLocation, setSelectedLocation] = useState(null); // Renamed from 'location'
    const [isUploading, setIsUploading] = useState(false); // Renamed from 'uploading'
    const [caption, setCaption] = useState("My Daily Snap"); // Added caption state

    // Initial load: either start camera or upload
    // For simplicity, we default to "Upload" or blank canvas

    useEffect(() => {
        if (image && canvasRef.current) {
            drawCanvas();
        }
        return () => {
            stopCameraStream(); // Cleanup
        };
    }, [image, overlays]);

    const stopCameraStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => setImage(img);
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
            const ctx = canvas.getContext('2d');
            // Match canvas size to video aspect or fixed size? 
            // For now, keep fixed 400x600 but draw video to fill (object-fit cover)

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

            const dataUrl = canvas.toDataURL('image/png');
            const img = new Image();
            img.onload = () => {
                setImage(img);
                setIsCameraOpen(false);
                stopCameraStream();
            };
            img.src = dataUrl;
        }
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Image (Cover fit)
        if (image) {
            const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
            const x = (canvas.width / 2) - (image.width / 2) * scale;
            const y = (canvas.height / 2) - (image.height / 2) * scale;
            ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
        } else {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw Overlays
        overlays.forEach(item => {
            if (item.type === 'text') {
                ctx.font = 'bold 30px sans-serif';
                ctx.fillStyle = item.color || 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';
                ctx.strokeText(item.content, item.x, item.y);
                ctx.fillText(item.content, item.x, item.y);
            } else if (item.type === 'sticker') {
                ctx.font = '50px sans-serif';
                ctx.fillText(item.content, item.x, item.y); // Emoji sticker
            }
        });
    };

    const addText = () => {
        if (!textInput.trim()) return;
        setOverlays([...overlays, {
            type: 'text',
            content: textInput,
            x: 200,
            y: 200,
            color: 'white'
        }]);
        setTextInput('');
        setShowTextTools(false);
    };

    const addSticker = (emoji) => {
        setOverlays([...overlays, {
            type: 'sticker',
            content: emoji,
            x: Math.random() * 300 + 50,
            y: Math.random() * 300 + 50
        }]);
        setShowStickers(false);
    };

    const addLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                // Mocking Geocoding API response
                const city = "Nairobi, KE";
                setSelectedLocation({ name: city, lat: pos.coords.latitude, lng: pos.coords.longitude });
                // Add visual sticker for location
                setOverlays([...overlays, {
                    type: 'text',
                    content: `📍 ${city}`,
                    x: 200,
                    y: 500,
                    color: '#08D9D6'
                }]);
            });
        }
    };

    const addSong = () => {
        // Mock Song Picker
        const mockSong = { title: "Feeling Good", artist: "Nina Simone" };
        setSelectedSong(mockSong);
        setOverlays([...overlays, {
            type: 'text',
            content: `🎵 ${mockSong.title}`,
            x: 200,
            y: 550,
            color: '#FF2E63'
        }]);
    };

    const handleCanvasClick = (e) => {
        // Simple drag logic could go here, for now just random placement
        // But let's allow moving proper if complex
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
            onPosted();
            onClose();
        } catch (err) {
            console.error('Upload failed', err);
            alert("Failed to post snap");
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000, background: 'black', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                <button onClick={() => { stopCameraStream(); onClose(); }}><X /></button>
                <h3>Snap Studio</h3>
                <button onClick={handlePost} disabled={!image || isUploading} style={{ color: image ? '#08D9D6' : 'gray' }}>
                    {isUploading ? 'Posting...' : <Send />}
                </button>

            </div>

            {/* Canvas / Camera Area */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', background: '#111' }}>

                {/* Initial Choices */}
                {!image && !isCameraOpen && (
                    <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', gap: '20px', flexDirection: 'column' }}>
                        <button onClick={startCamera} className="btn-primary" style={{ padding: '20px 40px', background: '#08D9D6', color: 'black', border: 'none', borderRadius: '50px' }}>
                            <Camera size={40} style={{ marginBottom: '10px' }} />
                            <div style={{ fontWeight: 'bold' }}>Open Camera</div>
                        </button>

                        <button onClick={() => fileInputRef.current.click()} style={{ padding: '20px', background: 'transparent', border: '2px solid white', borderRadius: '50px', color: 'white' }}>
                            <div>Upload Photo</div>
                        </button>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                    </div>
                )}

                {/* Camera Viewfinder */}
                {isCameraOpen && (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                            onClick={capturePhoto}
                            style={{
                                position: 'absolute', bottom: '50px',
                                width: '80px', height: '80px',
                                borderRadius: '50%', background: 'white',
                                border: '5px solid rgba(0,0,0,0.2)',
                                boxShadow: '0 0 20px rgba(255,255,255,0.5)'
                            }}
                        />
                    </div>
                )}

                {/* Editor Canvas */}
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={600}
                    style={{
                        border: '1px solid #333',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: (image && !isCameraOpen) ? 'block' : 'none',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                    }}
                    onClick={handleCanvasClick}
                />
            </div>

            {/* Tools Bar */}
            {(image && !isCameraOpen) && (
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.8)', overflowX: 'auto' }}>

                    {/* Sub-menus */}
                    {showTextTools && (
                        <div style={{ padding: '10px 0', display: 'flex', gap: '10px' }}>
                            <input
                                autoFocus
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                placeholder="Type caption..."
                                style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none' }}
                            />
                            <button onClick={addText} className="btn-primary">Add</button>
                        </div>
                    )}

                    {showStickers && (
                        <div style={{ display: 'flex', gap: '15px', padding: '10px 0', fontSize: '2rem', overflowX: 'auto' }}>
                            {['🔥', '🥰', '🎉', '🍕', '🐶', '👑', '💀', '👽'].map(e => (
                                <span key={e} onClick={() => addSticker(e)} style={{ cursor: 'pointer' }}>{e}</span>
                            ))}
                        </div>
                    )}

                    {/* Main Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', color: 'white', marginTop: '10px' }}>
                        <div onClick={() => setShowTextTools(!showTextTools)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                            <Type />
                            <div style={{ fontSize: '0.7em' }}>Text</div>
                        </div>
                        <div onClick={() => setShowStickers(!showStickers)} style={{ textAlign: 'center', cursor: 'pointer' }}>
                            <Smile />
                            <div style={{ fontSize: '0.7em' }}>Sticker</div>
                        </div>
                        <div onClick={addSong} style={{ textAlign: 'center', cursor: 'pointer', opacity: selectedSong ? 0.5 : 1 }}>
                            <Music />
                            <div style={{ fontSize: '0.7em' }}>Music</div>
                        </div>
                        <div onClick={addLocation} style={{ textAlign: 'center', cursor: 'pointer', opacity: selectedLocation ? 0.5 : 1 }}>
                            <MapPin />
                            <div style={{ fontSize: '0.7em' }}>Loc</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
