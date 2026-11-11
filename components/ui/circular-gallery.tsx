import {
  forwardRef, useEffect, useRef, useState,
  type CSSProperties, type HTMLAttributes, type KeyboardEvent,
} from "react";
import { Maximize2 } from "lucide-react";
import {
  animate, motion, useMotionValue, useMotionValueEvent,
  useReducedMotion, useSpring, useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  common: string;
  binomial: string;
  photo: { url: string; text: string; pos?: string; by: string };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  /** Degrees per frame at 60 Hz. Zero disables autoplay. */
  autoRotateSpeed?: number;
}

const wrap = (index: number, count: number) => ((index % count) + count) % count;

export const CircularGallery = forwardRef<HTMLDivElement, CircularGalleryProps>(
  function CircularGallery({ items, radius, autoRotateSpeed = 0, className, style, ...props }, ref) {
    const scene = useRef<HTMLDivElement>(null);
    const pointerStart = useRef<{ x: number; y: number } | null>(null);
    const suppressClickUntil = useRef(0);
    const turnTarget = useRef<number | null>(null);
    const rotation = useMotionValue(0);
    const autoplay = useMotionValue(0);
    const reduced = useReducedMotion();
    const easedRotation = useSpring(rotation, { stiffness: 180, damping: 24, mass: 0.45 });
    const displayRotation = useTransform(() => autoplay.get() + easedRotation.get());
    const turnAngle = useTransform(displayRotation, (value) => `${value}deg`);
    const rotateY = useTransform(displayRotation, (value) => `rotateY(${-value}deg)`);
    const [activeIndex, setActiveIndex] = useState(0);
    const step = 360 / Math.max(1, items.length);
    const active = wrap(activeIndex, Math.max(1, items.length));

    useMotionValueEvent(displayRotation, "change", (value) => {
      setActiveIndex(wrap(Math.round(value / step), Math.max(1, items.length)));
    });

    useEffect(() => {
      const element = scene.current;
      if (!element || items.length < 2) return;
      const wheel = (event: WheelEvent) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        rotation.stop();
        turnTarget.current = null;
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
        rotation.set(rotation.get() + event.deltaX * unit * 0.12);
      };
      element.addEventListener("wheel", wheel, { passive: false });
      return () => element.removeEventListener("wheel", wheel);
    }, [items.length, rotation]);

    useEffect(() => () => rotation.stop(), [rotation]);

    useEffect(() => {
      if (!autoRotateSpeed || items.length < 2) return;
      let frame = 0;
      let previous: number | null = null;
      const tick = (time: number) => {
        // Independent clock: scrolling and focus never interrupt autoplay.
        if (previous !== null && !document.hidden) {
          autoplay.set(autoplay.get() + autoRotateSpeed * Math.min(64, time - previous) / (1000 / 60));
        }
        previous = time;
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [autoRotateSpeed, autoplay, items.length]);

    function turn(offset: number) {
      const next = (Math.round((turnTarget.current ?? rotation.get()) / step) + offset) * step;
      rotation.stop();
      if (reduced) rotation.jump(next);
      else {
        turnTarget.current = next;
        animate(rotation, next, {
          duration: 0.62, ease: [0.22, 1, 0.36, 1],
          onComplete: () => { turnTarget.current = null; },
        });
      }
    }

    function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
      if (event.target !== event.currentTarget) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      turn(event.key === "ArrowRight" ? 1 : -1);
    }

    if (!items.length) return null;
    const navMotion = reduced ? {} : { whileHover: { scale: 1.08 }, whileTap: { scale: 0.94 } };
    const ringStyle = { transform: rotateY, "--orbit-turn": turnAngle };

    return (
      <div
        {...props}
        ref={ref}
        role="region"
        aria-label={props["aria-label"] ?? "Круговая галерея NOIR"}
        className={cn("noir-orbit relative w-full", className)}
        style={{ ...style, ...(radius === undefined ? {} : { "--orbit-radius": `${radius}px` }) } as CSSProperties}
      >
        <div className="orbit-track">
          <div className="orbit-pin">
            <div
              ref={scene}
              className="orbit-scene relative w-full"
              tabIndex={items.length > 1 ? 0 : undefined}
              aria-label="Кадры галереи. Используйте стрелки влево и вправо."
              onKeyDown={handleKeys}
              onPointerLeave={() => { pointerStart.current = null; }}
              onPointerDown={(event) => {
                if (event.button === 0 && event.isPrimary) {
                  pointerStart.current = { x: event.clientX, y: event.clientY };
                }
              }}
              onPointerCancel={() => { pointerStart.current = null; }}
              onPointerUp={(event) => {
                const start = pointerStart.current;
                pointerStart.current = null;
                if (!start || items.length < 2) return;
                const dx = event.clientX - start.x;
                const dy = event.clientY - start.y;
                if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
                suppressClickUntil.current = performance.now() + 350;
                turn(dx < 0 ? 1 : -1);
              }}
              onClickCapture={(event) => {
                if (performance.now() < suppressClickUntil.current) event.stopPropagation();
              }}
            >
              <motion.div className="orbit-ring absolute inset-0" style={ringStyle}>
                {items.map((item, index) => {
                  const current = index === active;
                  const offset = wrap(index - active + Math.floor(items.length / 2), items.length) - Math.floor(items.length / 2);
                  return (
                    <div
                      className="orbit-slot absolute"
                      key={item.photo.url}
                      aria-hidden={!current}
                      data-active={current}
                      data-near={Math.abs(offset) === 1}
                      style={{ "--item-angle": `${index * step}deg` } as CSSProperties}
                    >
                      <motion.button
                        type="button"
                        {...navMotion}
                        className="orbit-card relative block h-full w-full overflow-hidden"
                        aria-label={`Открыть фото «${item.common}»`}
                        tabIndex={current ? 0 : -1}
                        data-image={current ? item.photo.url : undefined}
                        data-caption={current ? `${item.common} · ${item.photo.by}` : undefined}
                        onMouseDown={current ? undefined : (event) => event.preventDefault()}
                        onClick={current ? undefined : () => turn(offset)}
                      >
                        <img
                          className="absolute inset-0 h-full w-full object-cover"
                          src={item.photo.url}
                          alt={item.photo.text}
                          style={{ objectPosition: item.photo.pos }}
                          loading={index === 0 ? "eager" : "lazy"}
                          draggable={false}
                        />
                        {current && <motion.span className="orbit-caption absolute inset-x-0 bottom-0 flex items-end justify-between"
                          initial={reduced ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}>
                          <span><strong>{item.common}</strong><small>{item.binomial}</small></span>
                          <Maximize2 aria-hidden="true" />
                        </motion.span>}
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
