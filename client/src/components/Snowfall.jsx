import React, { useEffect, useRef } from 'react';

export default function Snowfall() {
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

        const flakes = Array.from({ length: 150 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            wind: Math.random() * 0.5 - 0.25
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            flakes.forEach(f => {
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                
                f.y += f.speed;
                f.x += f.wind;

                if (f.y > canvas.height) {
                    f.y = -5;
                    f.x = Math.random() * canvas.width;
                }
                if (f.x > canvas.width) f.x = 0;
                if (f.x < 0) f.x = canvas.width;
            });
            ctx.fill();
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
                opacity: 0.8
            }}
        />
    );
}
