import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Square, Play, Pause, Trash2, Save, RotateCcw } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';

export default function AudioRecorder({ onClose, onSave }) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Refs
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const canvasRef = useRef(null);
    const sourceRef = useRef(null);
    const requestRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());
    const chunks = useRef([]);

    const MAX_DURATION = 300; // 5 minutes

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => {
                    if (prev >= MAX_DURATION) {
                        stopRecording();
                        return MAX_DURATION;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Cleanup Audio Context
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Audio Setup
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            // Recorder Setup
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const audioUrl = URL.createObjectURL(blob);
                audioPlayerRef.current.src = audioUrl;
                stream.getTracks().forEach(track => track.stop()); // Stop mic
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setDuration(0);
            setAudioBlob(null);
            drawVisualizer();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    };

    const togglePlayback = () => {
        if (isPlaying) {
            audioPlayerRef.current.pause();
        } else {
            audioPlayerRef.current.play();
        }
        setIsPlaying(!isPlaying);

        audioPlayerRef.current.onended = () => setIsPlaying(false);
    };

    const drawVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        const draw = () => {
            requestRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                // Gradient fit for the premium theme
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, '#FFBD2E');
                gradient.addColorStop(1, '#FF2E63');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSave = () => {
        if (audioBlob) {
            onSave(audioBlob);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <TiltedGlassCard style={{ width: '90%', maxWidth: '400px', padding: '30px', textAlign: 'center', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h3 style={{ marginBottom: '20px' }}>Voice Note</h3>

                {/* Visualizer Canvas */}
                <div style={{ height: '100px', marginBottom: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
                    {!audioBlob && isRecording ? (
                        <canvas ref={canvasRef} width={300} height={100} />
                    ) : audioBlob ? (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', justifyContent: 'center', color: 'var(--accent-color)' }}>
                            {/* Static waveform placeholder or playback viz could go here */}
                            <div style={{ width: '100%', height: '2px', background: 'gray', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 0, top: -4, width: '10px', height: '10px', borderRadius: '50%', background: 'white', transition: 'left 0.1s' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'gray' }}>Ready to record</div>
                    )}
                </div>

                {/* Timer */}
                <div style={{ fontSize: '2em', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '30px', color: isRecording ? '#FF2E63' : 'white' }}>
                    {formatTime(duration)} <span style={{ fontSize: '0.5em', color: 'gray' }}>/ 05:00</span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                    {!audioBlob && !isRecording && (
                        <button onClick={startRecording} className="btn-icon" style={{ width: 60, height: 60, borderRadius: '50%', background: '#FF2E63', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(255, 46, 99, 0.4)' }}>
                            <Mic size={28} color="white" />
                        </button>
                    )}

                    {isRecording && (
                        <button onClick={stopRecording} className="btn-icon" style={{ width: 60, height: 60, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer' }}>
                            <Square size={24} color="black" fill="black" />
                        </button>
                    )}

                    {audioBlob && (
                        <>
                            <button onClick={() => { setAudioBlob(null); setDuration(0); }} className="btn-icon" style={{ color: '#FF5F56', background: 'rgba(255, 95, 86, 0.2)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={20} />
                            </button>

                            <button onClick={togglePlayback} className="btn-icon" style={{ background: 'var(--accent-color)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                {isPlaying ? <Pause size={28} color="black" fill="black" /> : <Play size={28} color="black" fill="black" style={{ marginLeft: 4 }} />}
                            </button>

                            <button onClick={handleSave} className="btn-icon" style={{ color: '#08D9D6', background: 'rgba(8, 217, 214, 0.2)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Save size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Progress Bar (Visible during playback) */}
                {audioBlob && (
                    <div style={{ marginTop: '20px', fontSize: '0.8em', color: 'gray' }}>
                        Recording saved in memory. Click Save to attach.
                    </div>
                )}
            </TiltedGlassCard>
        </div>
    );
}
