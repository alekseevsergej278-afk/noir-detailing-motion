# Motion references and implementation

## References researched for this update

- GSAP SplitText masks: https://gsap.com/docs/v3/Plugins/SplitText/masks/ — masked word/line reveals with stagger; implemented locally for section headings with accessible parent labels and responsive natural word wrapping.
- Codrops Magnetic Buttons: https://tympanus.net/codrops/2020/08/05/magnetic-buttons/ — restrained pointer attraction and independent label motion. NOIR uses oval targets, a rolling duplicate label and a directional color fill. Touch targets remain stable.
- Codrops Dynamic CSS Masks: https://tympanus.net/codrops/2021/05/04/dynamic-css-masks-with-custom-properties-and-gsap/ — pointer-controlled spotlight concept. NOIR uses a custom Canvas 2D lamp with damped x/y movement and seeded surface defects.
- GoogleChromeLabs Two-Up: https://github.com/GoogleChromeLabs/two-up — large comparison handle and deliberate touch target. NOIR uses the Two-Up component for an inline split between simulated defects and clean paint.

GSAP 3.13 with SplitText and ScrollTrigger and Two-Up 1.0.1 are hosted locally in dist/assets/vendor. The Codrops-inspired interactions are implemented in dist/motion.js, dist/inspection.js and dist/style.css.

## Inspection controls

Mouse movement and taps position the lamp on the photograph. On touch screens the round grip drags horizontally and the rest of the photo retains vertical scrolling. Focus the photo to move the lamp with arrow keys. Focus the grip to compare with Left/Right or jump to an edge with Home/End.

The lamp and scratches are clipped to the painted hood. The contour is defined in the source image's coordinates and follows the centered crop as the frame resizes.

## Services accordion

The services section adapts the [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/radix/accordion) to native HTML details. The list keeps one panel open at a time, moves keyboard focus with arrow keys, Home and End, and animates panel height where supported.

## Motion preference

prefers-reduced-motion disables text travel, magnetic displacement and label rolls; the inspection light tracks the pointer without easing. The controls and all information remain available.
