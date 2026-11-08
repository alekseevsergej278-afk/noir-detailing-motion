# Motion references and implementation

## References researched for this update

- GSAP SplitText masks: https://gsap.com/docs/v3/Plugins/SplitText/masks/ — masked word/line reveals with stagger; implemented locally for section headings with accessible parent labels and responsive natural word wrapping.
- Codrops Magnetic Buttons: https://tympanus.net/codrops/2020/08/05/magnetic-buttons/ — restrained pointer attraction and independent label motion. NOIR uses oval targets, a rolling duplicate label and a directional color fill. Touch targets remain stable.
- Codrops Dynamic CSS Masks: https://tympanus.net/codrops/2021/05/04/dynamic-css-masks-with-custom-properties-and-gsap/ — pointer-controlled spotlight concept. NOIR uses a custom Canvas 2D lamp with damped x/y movement and seeded surface defects.
- GoogleChromeLabs Two-Up: https://github.com/GoogleChromeLabs/two-up — large comparison handle and deliberate touch target. NOIR adapts the handle vocabulary to an inspection lamp, rather than claiming an image comparison is a real correction result.

The reference libraries are not runtime dependencies; no reference photographs or project code were copied. Implementations are in dist/motion.js, dist/inspection.js and style.css.

## Inspection controls

Mouse moves the lamp in two dimensions; drag captures the pointer. On touch screens the dedicated 44px-high range is the continuous movement control and the photograph retains native vertical scrolling. The range shows a numeric percentage, filled track, circular arrow handle and end labels. Home/End and arrow keys work natively. Before/after buttons preserve the lamp position and change only the simulated defect amount.

## Motion preference

prefers-reduced-motion disables text travel, magnetic displacement and label rolls; inspection state changes snap. The controls and all information remain available.
