import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TiltedGlassCard from './TiltedGlassCard';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MeditationPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [text, setText] = useState('Breathe In');
    const [progress, setProgress] = useState(0);
    const DURATION = 300; // 5 minutes in seconds

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 100;
                    }
                    return prev + (100 / DURATION);
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Simple breathing cycle
    useEffect(() => {
        if (!isPlaying) {
            setText('Ready?');
            return;
        }

        const cycle = () => {
            setText('Breathe In');
            setTimeout(() => {
                setText('Hold');
                setTimeout(() => {
                    setText('Breathe Out');
                }, 2000);
            }, 4000);
        };

        cycle();
        const interval = setInterval(cycle, 10000); // 4s in, 2s hold, 4s out
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 20, left: 20 }}>
                <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ArrowLeft size={16} /> Dashboard
                </Link>
            </div>

            <TiltedGlassCard style={{ width: '300px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                {/* Visualizer */}
                <motion.div
                    animate={{
                        scale: isPlaying ? [1, 1.5, 1.5, 1] : 1,
                        opacity: isPlaying ? [0.6, 1, 1, 0.6] : 0.6,
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        times: [0, 0.4, 0.6, 1]
                    }}
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(8,217,214,0.8) 0%, rgba(37,42,52,0) 70%)',
                        marginBottom: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <div style={{ color: 'white', fontWeight: 'bold' }}>{text}</div>
                </motion.div>

                <h2 style={{ marginBottom: '10px' }}>Mindfulness</h2>
                <p style={{ color: 'gray', marginBottom: '20px' }}>5 Minute Focus</p>

                {/* Progress Bar */}
                <div style={{ width: '80%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '30px', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        style={{ height: '100%', background: 'var(--accent-color)' }}
                    />
                </div>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn-primary"
                    style={{
                        borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 4 }} />}
                </button>
            </TiltedGlassCard>
        </div>
    );
}
