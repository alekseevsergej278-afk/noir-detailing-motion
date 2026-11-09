# Motion references and implementation

## References researched for this update

- Motion: https://motion.dev/docs/react — the gallery rotates automatically and follows scroll progress while pinned. Motion also animates section heading masks, button hover and press, and the page reading indicator.
- Codrops Magnetic Buttons: https://tympanus.net/codrops/2020/08/05/magnetic-buttons/ — restrained pointer attraction and independent label motion. NOIR uses oval targets, a rolling duplicate label and a directional color fill. Touch targets remain stable.
- GoogleChromeLabs Two-Up: https://github.com/GoogleChromeLabs/two-up — large comparison handle and deliberate touch target. NOIR uses the Two-Up component for an inline split between simulated defects and clean paint.

Motion ships with the React gallery bundle. The site effects are in src/site-motion.ts and dist/style.css. Two-Up 1.0.1 is hosted locally in dist/assets/vendor.

## Inspection controls

Drag or click to position each of the three boundaries. Focus a grip to compare with Left/Right or jump to an edge with Home/End. The Approach section crossfades the photograph when a step is selected.

## Services accordion

The services section adapts the [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/radix/accordion) to native HTML details. The list keeps one panel open at a time, moves keyboard focus with arrow keys, Home and End, and animates panel height where supported.

## Motion preference

prefers-reduced-motion disables text travel, button movement and label rolls. The gallery changes frames without spatial interpolation; comparison handles track input directly. The controls and all information remain available.
