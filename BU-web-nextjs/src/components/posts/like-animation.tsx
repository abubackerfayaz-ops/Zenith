'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

interface LikeAnimationProps {
  size?: number;
  particleCount?: number;
}

export function LikeAnimation({ size = 120, particleCount = 12 }: LikeAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const particleGenerators = useMemo(() => {
    const gens: (() => Particle)[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const radius = 40 + Math.random() * 30;
      gens.push(() => ({
        id: i,
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.1,
      }));
    }
    return gens;
  }, [particleCount]);

  useEffect(() => {
    setParticles(particleGenerators.map((gen) => gen()));
  }, [particleGenerators]);

  const colors = ['#ef4444', '#f43f5e', '#e11d48', '#ff6b6b', '#ff4757'];

  return (
    <AnimatePresence>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Main Heart */}
        <motion.div
          key="main-heart"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <svg
            width={size * 0.5}
            height={size * 0.5}
            viewBox="0 0 24 24"
            fill="#ef4444"
            className="drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>

        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: [0, 1, 0.5],
              opacity: [0, 1, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.6 + particle.delay,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: colors[particle.id % colors.length],
                transform: `rotate(${particle.rotation}deg)`,
                boxShadow: `0 0 6px ${colors[particle.id % colors.length]}`,
              }}
            />
          </motion.div>
        ))}

        {/* Ripple Ring */}
        <motion.div
          key="ripple"
          className="absolute rounded-full border-2 border-red-400/50"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: size * 0.8, height: size * 0.8, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </AnimatePresence>
  );
}
