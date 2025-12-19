import React, { useEffect, useState } from 'react';

const RippleEffect = () => {
    const [ripples, setRipples] = useState([]);

    useEffect(() => {
        const handleClick = (e) => {
            const ripple = {
                x: e.clientX,
                y: e.clientY,
                id: Date.now()
            };

            setRipples((prev) => [...prev, ripple]);

            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }, 1000);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 }}>

            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                    }}
                />
            ))}
            <style>{`
        .ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(255, 46, 99, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple-anim 1s linear;
          pointer-events: none;
        }

        @keyframes ripple-anim {
          0% {
            width: 0;
            height: 0;
            opacity: 0.8;
          }
          100% {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default RippleEffect;
