import {
  forwardRef, useEffect, useRef, useState,
  type CSSProperties, type HTMLAttributes, type KeyboardEvent,
} from "react";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play } from "lucide-react";
import {
  animate, motion, useInView, useMotionValue, useMotionValueEvent,
  useReducedMotion, useScroll, useTransform,
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
    const lastInteraction = useRef(0);
    const turnTarget = useRef<number | null>(null);
    const rotation = useMotionValue(0);
    const rotateY = useTransform(rotation, (value) => `rotateY(${-value}deg)`);
    const reduced = useReducedMotion();
    const visible = useInView(scene, { amount: 0.2 });
    const { scrollYProgress } = useScroll({
      target: scene, offset: ["start 0.84", "end 0.2"],
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const step = 360 / Math.max(1, items.length);
    const active = wrap(activeIndex, Math.max(1, items.length));

    useMotionValueEvent(rotation, "change", (value) => {
      setActiveIndex(wrap(Math.round(value / step), Math.max(1, items.length)));
    });

    useMotionValueEvent(scrollYProgress, "change", (progress) => {
      const previous = scrollYProgress.getPrevious() ?? progress;
      const focusedCard = document.activeElement?.matches(".orbit-card") && scene.current?.contains(document.activeElement);
      if (reduced || focusedCard || items.length < 2 || performance.now() - lastInteraction.current < 750) return;
      const delta = progress - previous;
      if (Math.abs(delta) > 0.24) return; // Anchor jumps do not spin the gallery.
      turnTarget.current = null;
      rotation.stop();
      rotation.set(rotation.get() + delta * 360);
    });

    useEffect(() => () => rotation.stop(), [rotation]);

    useEffect(() => {
      if (!playing || !visible || hovered || focused || reduced || !autoRotateSpeed || items.length < 2) return;
      let frame = 0;
      let previous = 0;
      const tick = (time: number) => {
        if (!document.hidden && previous) {
          rotation.set(rotation.get() + autoRotateSpeed * Math.min(32, time - previous) / (1000 / 60));
        }
        previous = time;
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [autoRotateSpeed, focused, hovered, items.length, playing, reduced, rotation, visible]);

    function turn(offset: number) {
      lastInteraction.current = performance.now();
      setPlaying(false);
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

    return (
      <div
        {...props}
        ref={ref}
        role="region"
        aria-label={props["aria-label"] ?? "Круговая галерея NOIR"}
        className={cn("noir-orbit relative w-full", className)}
        style={{ ...style, ...(radius === undefined ? {} : { "--orbit-radius": `${radius}px` }) } as CSSProperties}
        onFocus={(event) => { props.onFocus?.(event); setFocused(true); }}
        onBlur={(event) => {
          props.onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
      >
        <div
          ref={scene}
          className="orbit-scene relative w-full"
          tabIndex={items.length > 1 ? 0 : undefined}
          aria-label="Кадры галереи. Используйте стрелки влево и вправо."
          onKeyDown={handleKeys}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => { setHovered(false); pointerStart.current = null; }}
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
          <motion.div className="orbit-ring absolute inset-0" style={{ transform: rotateY }}>
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
                  <button
                    type="button"
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
                    <span className="orbit-caption absolute inset-x-0 bottom-0 flex items-end justify-between">
                      <span><strong>{item.common}</strong><small>{item.binomial}</small></span>
                      <Maximize2 aria-hidden="true" />
                    </span>
                  </button>
                </div>
              );
            })}
          </motion.div>
        </div>
        {items.length > 1 && (
          <div className="orbit-nav flex items-center justify-between">
            <div className="orbit-position" aria-label={`Кадр ${active + 1} из ${items.length}`}>
              <span>{active + 1}</span><span aria-hidden="true"> / {items.length}</span>
            </div>
            <div className="orbit-buttons flex items-center">
              {autoRotateSpeed > 0 && !reduced && (
                <motion.button type="button" {...navMotion} onClick={() => setPlaying(!playing)}
                  aria-label={playing ? "Приостановить вращение" : "Включить автовращение"}>
                  {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                </motion.button>
              )}
              <motion.button type="button" {...navMotion} onClick={() => turn(-1)} aria-label="Предыдущий кадр">
                <ChevronLeft aria-hidden="true" />
              </motion.button>
              <motion.button type="button" {...navMotion} onClick={() => turn(1)} aria-label="Следующий кадр">
                <ChevronRight aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
