import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export default function TiltedGlassCard({ children, className = "", style = {} }) {
    const { isTiltEnabled } = useTheme();
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current || !isTiltEnabled) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY: isTiltEnabled ? rotateY : "0deg",
                rotateX: isTiltEnabled ? rotateX : "0deg",
                transformStyle: "preserve-3d",
                position: 'relative',
                ...style
            }}
            className={`glass-panel tilted-card ${className}`}
        >
            {/* Content - Simple stacking */}
            <div style={{ 
                position: 'relative', 
                zIndex: 20
            }}>
                {children}
            </div>

            {/* Glare Effect - Behind content */}
            <div
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: '24px',
                    background: 'linear-gradient(125deg, var(--glass-highlight) 0%, rgba(255,255,255,0) 60%)',
                    opacity: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                }}
                className="card-glare"
            />
            <style>{`
                .tilted-card:hover .card-glare {
                    opacity: 1 !important;
                }
            `}</style>
        </motion.div>
    );
}
