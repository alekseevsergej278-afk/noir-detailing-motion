# NOIR / Light reveals the difference

## Direction
Own automotive atelier concept, rebuilt after user rejected the earlier generic editorial landing. Persuade mode. See CONCEPT.md for reference synthesis. The interaction references and runtime dependencies are documented in MOTION.md.

## User commitment
One solid graphite background across the entire page: #101211. Sections remain transparent, without alternating panels or decorative gradients. Photographic light falloff is confined to the inspection interaction. The hero uses lighten compositing to merge its photographic blacks into graphite.

## Tokens
- Background #101211; foreground #eeeee8; secondary #a5aaa5; dividers #343a34; action and inspection signal #dfed9b.
- Oswald 400 for uppercase display typography; Manrope 400–800 for reading and interface. Both hosted locally.
- Display 34–106px, reading text 12–14px, metadata 11px. Hero and wordmark receive dedicated responsive scaling.
- Gutters 5.5% desktop / 6% mobile. Major section rhythm 125–130px desktop / 75–85px mobile.
- Pill-shaped action buttons with 999px radius, including outlined editorial actions and the before/after switch. Thin dividers preserve the flat composition.

## Signature interaction
A custom Canvas 2D inspection lamp moves over a generated macro paint photo. Seeded arcs simulate wash swirls inside the lamp exposure. Two-Up separates the surface under the lamp from the clean surface. Its round grip moves the split inside the photograph. Before/after buttons show each surface across the full frame. Labels identify the simulation and update the selected state with aria-pressed and aria-live.

## Motion
Ease cubic-bezier(.16,1,.3,1). Masked hero lines, photographic lateral reveals, progressive sentence illumination, service-image changes and restrained photo parallax. Passive scroll listeners schedule requestAnimationFrame; canvas stops scheduling once its interpolation settles. Reduced motion snaps inspection state and disables spatial transitions.

## Honesty and accessibility
Generated studio imagery and simulated defects are disclosed; no fake portfolio, testimonials or metrics. Prices, timing and address are demonstrative. Contacts remain unconfigured. Service details, the comparison grip and the gallery dialog support keyboard interaction. Menu supports Escape, focus containment and inert page content.

## Updated controls and choreography

Pill-shaped CTAs, outlined editorial actions and correction-state buttons. GSAP SplitText masks reveal section headings in 55ms stagger steps; duplicated labels roll on hover, with the duplicate hidden from screen readers. Small pointer attraction applies only to fine-pointer devices. The lamp has damped X/Y movement. A round 58px grip moves the split within the photograph, with a 48px grip on mobile. Scratch exposure is alpha-masked in a separate canvas, preventing defects from extending outside the light. Reduced-motion focus/hover styles keep contrast without animated fills. Sources: MOTION.md.
