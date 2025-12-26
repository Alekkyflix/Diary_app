import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import { useTheme } from '../contexts/ThemeContext';

function AnimatedSphere({ position, color, speed, distort }) {
    const mesh = useRef(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.x = t * 0.2;
        mesh.current.rotation.y = t * 0.3;
        mesh.current.position.y = position[1] + Math.sin(t * speed) * 0.5;
    });

    return (
        <Sphere visible args={[1, 100, 200]} scale={2} position={position} ref={mesh}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={distort}
                speed={speed}
                roughness={0}
            />
        </Sphere>
    );
}

export default function FluidBackground() {
    const { theme, themes } = useTheme();
    const currentTheme = themes[theme] || themes.dark;
    
    // Derived colors for blobs
    const color2 = currentTheme.accent;
    const color1 = theme === 'dark' ? '#08D9D6' : 
                   theme === 'emerald' ? '#34D399' : 
                   theme === 'royal' ? '#C7D2FE' : 
                   theme === 'hacker' ? '#15803D' : '#08D9D6';
    const color3 = theme === 'dark' ? '#EAEAEA' : 
                   theme === 'emerald' ? '#065F46' : 
                   theme === 'royal' ? '#4338CA' : 
                   theme === 'hacker' ? '#052E16' : '#EAEAEA';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Colorful Blobs */}
                <AnimatedSphere position={[-2, 0, 0]} color={color1} speed={1.5} distort={0.5} />
                <AnimatedSphere position={[2, -1, -2]} color={color2} speed={2} distort={0.4} />
                <AnimatedSphere position={[0, 2, -3]} color={color3} speed={1} distort={0.6} />
            </Canvas>
        </div>
    );
}
