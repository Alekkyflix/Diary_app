import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';

export default function GamificationWidget({ streak, badges }) {
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Flame': return <Flame size={24} color="#FFBD2E" />;
            case 'Trophy': return <Trophy size={24} color="#FFD700" />;
            case 'Zap': return <Zap size={24} color="#08D9D6" />;
            default: return <Trophy size={24} />;
        }
    };

    return (
        <TiltedGlassCard style={{ padding: '20px', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(255,189,46,0.2)', padding: '10px', borderRadius: '50%' }}>
                        <Flame size={24} color="#FFBD2E" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{streak} Day Streak</h3>
                        <p style={{ margin: 0, fontSize: '0.8em', color: 'gray' }}>Keep it up!</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {badges.slice(0, 3).map((badge, idx) => (
                        <div key={idx} title={badge.name} style={{ textAlign: 'center' }}>
                            {getIcon(badge.icon)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress Bar Mockup */}
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((streak / 7) * 100, 100)}%`, background: '#FFBD2E', height: '100%' }}></div>
            </div>
            <p style={{ textAlign: 'right', fontSize: '0.7em', marginTop: '5px', color: 'gray' }}>Next reward at 7 days</p>
        </TiltedGlassCard>
    );
}
