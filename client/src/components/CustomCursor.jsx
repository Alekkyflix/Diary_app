import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [clicked, setClicked] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);

    useEffect(() => {
        const addEventListeners = () => {
            document.addEventListener("mousemove", mMove);
            document.addEventListener("mousedown", mDown);
            document.addEventListener("mouseup", mUp);
        };

        const removeEventListeners = () => {
            document.removeEventListener("mousemove", mMove);
            document.removeEventListener("mousedown", mDown);
            document.removeEventListener("mouseup", mUp);
        };

        const mMove = (el) => {
            setPosition({ x: el.clientX, y: el.clientY });

            // Check if hovering clickable
            const target = el.target;
            if (target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.onclick != null ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setLinkHovered(true);
            } else {
                setLinkHovered(false);
            }
        };

        const mDown = () => setClicked(true);
        const mUp = () => setClicked(false);

        addEventListeners();
        return () => removeEventListeners();
    }, []);

    return (
        <div
            style={{
                width: 30,
                height: 30,
                border: '2px solid var(--accent-color)',
                position: 'fixed',
                left: 0,
                top: 0,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                transform: `translate(${position.x - 15}px, ${position.y - 15}px) scale(${clicked ? 0.8 : (linkHovered ? 1.5 : 1)})`,
                transition: 'transform 0.1s ease-out',
                background: linkHovered ? 'rgba(255, 46, 99, 0.1)' : 'transparent',
                boxShadow: '0 0 15px rgba(255, 46, 99, 0.3)'
            }}
        >
            <div style={{
                width: 6, height: 6, background: 'white', borderRadius: '50%',
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
            }}></div>
        </div>
    );
}
