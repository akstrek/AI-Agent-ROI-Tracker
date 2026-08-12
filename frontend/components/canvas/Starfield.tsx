'use client'

import { useRef, useEffect } from 'react';

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const starCount = window.innerWidth < 768 ? 120 : 250;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      baseR: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
    }));

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) { mouse.x = t.clientX; mouse.y = t.clientY; }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        const dist = Math.hypot(mouse.x - star.x, mouse.y - star.y);
        const radius = dist < 200 ? star.baseR + (200 - dist) * 0.015 : star.baseR;

        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);

        if (dist < 200) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffffff';
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.beginPath();
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-2] pointer-events-none bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
    </div>
  );
};
