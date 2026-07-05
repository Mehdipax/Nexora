import { useEffect, useRef, useState } from 'react';

type TouchGlow = {
  id: number;
  x: number;
  y: number;
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function MotionDesignSystem() {
  const [touchGlows, setTouchGlows] = useState<TouchGlow[]>([]);
  const mouseGlowRef = useRef<HTMLSpanElement | null>(null);
  const nextGlowId = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let frame = 0;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const clearMouseGlow = () => {
      if (mouseGlowRef.current) mouseGlowRef.current.style.opacity = '0';
    };

    const updateMouseGlow = () => {
      frame = 0;
      if (!mouseGlowRef.current) return;
      mouseGlowRef.current.style.opacity = '0.055';
      mouseGlowRef.current.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate3d(-50%, -50%, 0)`;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (motionQuery.matches || event.pointerType !== 'mouse') return;
      lastX = event.clientX;
      lastY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(updateMouseGlow);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') clearMouseGlow();
    };

    const onMotionPreferenceChange = () => {
      if (motionQuery.matches) clearMouseGlow();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    motionQuery.addEventListener('change', onMotionPreferenceChange);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      motionQuery.removeEventListener('change', onMotionPreferenceChange);
      if (frame) window.cancelAnimationFrame(frame);
      clearMouseGlow();
    };
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    const onPointerDown = (event: PointerEvent) => {
      if (motionQuery.matches || event.pointerType === 'mouse') return;

      const id = nextGlowId.current++;
      setTouchGlows((current) => [...current.slice(-3), { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setTouchGlows((current) => current.filter((glow) => glow.id !== id));
      }, 420);
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return (
    <div className="motion-glow-layer" aria-hidden="true">
      <span ref={mouseGlowRef} className="motion-cursor-glow" />
      {touchGlows.map((glow) => (
        <span
          key={glow.id}
          className="motion-touch-glow"
          style={{ left: glow.x, top: glow.y }}
        />
      ))}
    </div>
  );
}

export default MotionDesignSystem;
