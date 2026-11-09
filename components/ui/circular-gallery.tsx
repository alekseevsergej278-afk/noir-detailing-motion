import {
  forwardRef, useEffect, useRef, useState,
  type CSSProperties, type HTMLAttributes, type KeyboardEvent,
} from "react";
import { Maximize2 } from "lucide-react";
import {
  animate, motion, useInView, useMotionValue, useMotionValueEvent,
  useReducedMotion, useScroll, useSpring, useTransform,
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
    const track = useRef<HTMLDivElement>(null);
    const pin = useRef<HTMLDivElement>(null);
    const scene = useRef<HTMLDivElement>(null);
    const pointerStart = useRef<{ x: number; y: number } | null>(null);
    const suppressClickUntil = useRef(0);
    const resumeAt = useRef(0);
    const turnTarget = useRef<number | null>(null);
    const lastProgress = useRef(0);
    const scrollAngle = useRef<number | null>(null);
    const rotation = useMotionValue(0);
    const reduced = useReducedMotion();
    const easedRotation = useSpring(rotation, { stiffness: 180, damping: 24, mass: 0.45 });
    const displayRotation = reduced ? rotation : easedRotation;
    const turnAngle = useTransform(displayRotation, (value) => `${value}deg`);
    const rotateY = useTransform(displayRotation, (value) => `rotateY(${-value}deg)`);
    const visible = useInView(scene, { amount: 0.2 });
    const { scrollYProgress } = useScroll({
      target: track, offset: ["start 0.08", "end 0.08"],
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const [focused, setFocused] = useState(false);
    const step = 360 / Math.max(1, items.length);
    const active = wrap(activeIndex, Math.max(1, items.length));

    useMotionValueEvent(displayRotation, "change", (value) => {
      setActiveIndex(wrap(Math.round(value / step), Math.max(1, items.length)));
    });

    useMotionValueEvent(scrollYProgress, "change", (progress) => {
      if (!track.current || !pin.current || items.length < 2) return;
      const height = track.current.offsetHeight;
      const distance = height - pin.current.offsetHeight;
      if (distance <= 0) return;
      const pinnedProgress = Math.min(1, progress * height / distance);
      const delta = pinnedProgress - lastProgress.current;
      lastProgress.current = pinnedProgress;
      if (!delta || focused) return;
      resumeAt.current = performance.now() + 180;
      turnTarget.current = null;
      rotation.stop();
      const next = (scrollAngle.current ?? rotation.get()) + delta * 360;
      scrollAngle.current = next;
      if (reduced) rotation.jump(Math.round(next / step) * step);
      else rotation.set(next);
    });

    useEffect(() => () => rotation.stop(), [rotation]);

    useEffect(() => {
      if (!visible || focused || !autoRotateSpeed || items.length < 2) return;
      const canAdvance = (time: number) => !document.hidden && !pointerStart.current &&
        !document.activeElement?.closest("dialog[open]") && time > resumeAt.current;
      if (reduced) {
        const timer = setInterval(() => {
          if (!canAdvance(performance.now())) return;
          scrollAngle.current = null;
          rotation.jump((Math.round(rotation.get() / step) + 1) * step);
        }, step / autoRotateSpeed * (1000 / 60));
        return () => clearInterval(timer);
      }
      let frame = 0;
      let previous = 0;
      const tick = (time: number) => {
        if (previous && canAdvance(time)) {
          scrollAngle.current = null;
          rotation.set(rotation.get() + autoRotateSpeed * Math.min(32, time - previous) / (1000 / 60));
        }
        previous = time;
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [autoRotateSpeed, focused, items.length, reduced, rotation, step, visible]);

    function turn(offset: number) {
      resumeAt.current = performance.now() + 720;
      scrollAngle.current = null;
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
        <div ref={track} className="orbit-track" data-scroll={items.length > 1}>
          <div ref={pin} className="orbit-pin">
            <div
              ref={scene}
              className="orbit-scene relative w-full"
              tabIndex={items.length > 1 ? 0 : undefined}
              aria-label="Кадры галереи. Используйте стрелки влево и вправо."
              onKeyDown={handleKeys}
              onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
              }}
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
