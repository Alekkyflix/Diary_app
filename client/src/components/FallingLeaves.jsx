import React, { useEffect, useRef } from 'react';

export default function FallingLeaves({ type = 'autumn' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const leafCount = 50;
        const leaves = [];

        // Colors for types
        const autumnColors = ['#F59E0B', '#DC2626', '#B45309', '#78350F']; // Brighter Oranges/Reds
        const springColors = ['#10B981', '#34D399', '#059669', '#6EE7B7']; // Greens

        const colors = type === 'autumn' ? autumnColors : springColors;

        for (let i = 0; i < leafCount; i++) {
            leaves.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 12 + 6,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 1.5 + 0.8,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 2 - 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                glow: Math.random() > 0.7
            });
        }

        const drawLeaf = (ctx, leaf) => {
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate((leaf.rotation * Math.PI) / 180);
            ctx.fillStyle = leaf.color;
            ctx.globalAlpha = 0.6;
            
            if (leaf.glow) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = leaf.color;
            } else {
                ctx.shadowBlur = 0;
            }

            // Draw a simple leaf shape
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf.size / 2, -leaf.size / 2, leaf.size, 0);
            ctx.quadraticCurveTo(leaf.size / 2, leaf.size / 2, 0, 0);
            ctx.fill();
            
            ctx.restore();
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            leaves.forEach(leaf => {
                leaf.y += leaf.speedY;
                leaf.x += leaf.speedX + Math.sin(leaf.y / 50); // Swaying effect
                leaf.rotation += leaf.rotationSpeed;

                if (leaf.y > canvas.height) {
                    leaf.y = -leaf.size;
                    leaf.x = Math.random() * canvas.width;
                }

                drawLeaf(ctx, leaf);
            });
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, [type]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5,
                opacity: 0.9
            }}
        />
    );
}
