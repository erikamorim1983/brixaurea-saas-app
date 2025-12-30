'use client';

import { useEffect, useRef, useState } from 'react';

export default function AuraTestPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // UI State for DOM elements (Text)
    const [uiPhase, setUiPhase] = useState<'chaos' | 'geometry' | 'text' | 'exploding'>('chaos');

    // Logic Refs (Mutable state without re-renders)
    const phaseRef = useRef<'chaos' | 'geometry' | 'text' | 'exploding'>('chaos');
    const particlesRef = useRef<any[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();
        window.addEventListener('resize', setSize);

        // Particle System Init
        const particleCount = 700;
        const colors = ['#00D9FF', '#FFFFFF', '#081F2E', '#60EFFF'];

        // Init function for reuse on loop reset
        const initParticles = () => {
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    tx: 0, ty: 0, // Targets
                    vx: 0, vy: 0, // Velocity
                    speed: 0.01 + Math.random() * 0.03,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        if (particlesRef.current.length === 0) {
            initParticles();
        }

        // Calculation Helpers
        const calculateSpiralTargets = () => {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));

            particlesRef.current.forEach((p, i) => {
                const angle = i * goldenAngle;
                const r = 18 * Math.sqrt(i);
                p.tx = cx + r * Math.cos(angle);
                p.ty = cy + r * Math.sin(angle);
            });
        };

        const calculateExplosion = () => {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            particlesRef.current.forEach(p => {
                const dx = p.x - cx;
                const dy = p.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = 15;
                if (dist > 0) {
                    p.vx = (dx / dist) * (force + Math.random() * 10);
                    p.vy = (dy / dist) * (force + Math.random() * 10);
                } else {
                    p.vx = (Math.random() - 0.5) * 20;
                    p.vy = (Math.random() - 0.5) * 20;
                }
            });
        };

        // Animation Loop
        let animationFrame: number;
        let frameCount = 0;

        // ABSOLUTE TIMELINE (60fps estimate)
        const FPS = 60;
        const T_GEOMETRY = 1 * FPS; // Starts at 1s
        const T_TEXT = 4 * FPS;     // Starts at 4s
        const TEXT_HOLD = 6 * FPS;  // Hold for 6s
        const T_EXPLOSION = T_TEXT + TEXT_HOLD; // 10s total (4+6)
        const T_RESET = T_EXPLOSION + 2.5 * FPS; // Reset 2.5s after explosion starts

        const render = () => {
            frameCount++;
            const phase = phaseRef.current;
            const particles = particlesRef.current;

            // Loop Reset Logic
            if (frameCount >= T_RESET) {
                frameCount = 0;
                phaseRef.current = 'chaos';
                setUiPhase('chaos');
                // Re-scatter particles subtly or hard reset?
                // Soft reset looks better: re-init random positions
                initParticles();
                return requestAnimationFrame(render);
            }

            // Background
            if (phase === 'exploding') {
                ctx.fillStyle = 'rgba(8, 31, 46, 0.15)'; // Trails
            } else {
                ctx.fillStyle = '#081F2E';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Phase Triggers
            if (frameCount === 1) calculateSpiralTargets();

            if (frameCount === T_GEOMETRY && phase !== 'geometry') {
                phaseRef.current = 'geometry';
                setUiPhase('geometry');
            }

            if (frameCount === T_TEXT && phase !== 'text') {
                phaseRef.current = 'text';
                setUiPhase('text');
            }

            if (frameCount === T_EXPLOSION && phase !== 'exploding') {
                phaseRef.current = 'exploding';
                setUiPhase('exploding');
                calculateExplosion();
            }

            // Update & Draw
            particles.forEach(p => {
                if (phase === 'geometry' || phase === 'text') {
                    // Seek Target
                    p.x += (p.tx - p.x) * p.speed;
                    p.y += (p.ty - p.y) * p.speed;

                    // Breathing (Only in text phase)
                    if (phase === 'text') {
                        const cx = canvas.width / 2;
                        const cy = canvas.height / 2;
                        const angle = Math.atan2(p.y - cy, p.x - cx);
                        p.x += Math.cos(angle + Math.PI / 2) * 0.2;
                        p.y += Math.sin(angle + Math.PI / 2) * 0.2;
                    }
                }
                else if (phase === 'exploding') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 1.02;
                    p.vy *= 1.02;
                }
                else {
                    // Chaos
                    p.x += (Math.random() - 0.5) * 1;
                    p.y += (Math.random() - 0.5) * 1;
                }

                // Draw Point
                ctx.beginPath();
                const size = phase === 'exploding' ? 2.5 : (phase === 'text' ? 1.5 : 2);
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            // Geometry Lines
            if (phase === 'geometry' || phase === 'text') {
                ctx.strokeStyle = `rgba(0, 217, 255, ${phase === 'text' ? 0.08 : 0.15})`;
                ctx.lineWidth = 0.5;

                if (frameCount % 2 === 0) {
                    for (let i = 0; i < particleCount; i++) {
                        const neighbors = [13, 21];
                        neighbors.forEach(n => {
                            if (i + n < particleCount) {
                                const p1 = particles[i];
                                const p2 = particles[i + n];
                                const dx = p1.x - p2.x;
                                const dy = p1.y - p2.y;
                                if (dx * dx + dy * dy < 15000) {
                                    ctx.beginPath();
                                    ctx.moveTo(p1.x, p1.y);
                                    ctx.lineTo(p2.x, p2.y);
                                    ctx.stroke();
                                }
                            }
                        });
                    }
                }
            }

            animationFrame = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <div className="relative w-full h-screen bg-[#081F2E] overflow-hidden cursor-none">
            <canvas ref={canvasRef} className="absolute inset-0 z-10" />

            {/* Text Overlay controlled by React State */}
            <div
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out pointer-events-none`}
                style={{
                    opacity: uiPhase === 'text' ? 1 : 0,
                    transform: uiPhase === 'text' ? 'scale(1)' : (uiPhase === 'exploding' ? 'scale(2)' : 'scale(0.95)'),
                    filter: uiPhase === 'exploding' ? 'blur(50px) brightness(200%)' : 'none'
                }}
            >
                <h1 className="text-6xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-[#00D9FF] to-[#081F2E] tracking-widest drop-shadow-[0_0_35px_rgba(0,217,255,0.6)] animate-pulse-slow">
                    BrixAurea
                </h1>
            </div>

            <style jsx>{`
                .animate-pulse-slow {
                    animation: pulse 6s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; text-shadow: 0 0 30px rgba(0,217,255,0.5); }
                    50% { opacity: 0.85; text-shadow: 0 0 10px rgba(0,217,255,0.2); }
                }
            `}</style>
        </div>
    );
}
