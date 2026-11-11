import { animate, hover, inView, press, scroll } from "motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function initSiteMotion() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const progress = document.querySelector<HTMLElement>(".reading-progress");
  if (progress) scroll((value: number) => { progress.style.transform = `scaleX(${value})`; });

  const textTargets = document.querySelectorAll<HTMLElement>([
    "h2", "h3", "main p:not(.hero-offer p)", ".manifest-text", ".notice p",
    ".wordmark", ".desktop-nav a", ".hero-foot > span",
    ".service-title", ".service-meta", "#service-visual-title", ".service-visual small", ".service-content footer > span",
    ".process-copy", ".contact-line > span:last-child",
    ".comparison-caption", ".footer-info > div > *", ".footer-wordmark", ".footer-legal > span",
  ].join(","));

  function reveal(element: Element, delay = 0) {
    const headline = element.matches("h2");
    const animation = animate(element, {
      opacity: [0.12, 1],
      y: [reduced.matches ? 0 : headline ? 24 : 12, 0],
      ...(headline && !reduced.matches ? { clipPath: ["inset(0 0 46% 0)", "inset(0 0 0% 0)"] } : {}),
    }, { duration: reduced.matches ? 0.65 : headline ? 0.95 : 0.65, delay, ease });
    animation.then(() => {
      if (element instanceof HTMLElement) element.style.clipPath = "";
    });
  }

  for (const [index, element] of Array.from(textTargets).entries()) {
    inView(element, () => reveal(element, (index % 3) * 0.045), { amount: "some" });
  }

  const mobileMenu = document.querySelector("#mobile-nav");
  if (mobileMenu) new MutationObserver(() => {
    if (mobileMenu.hasAttribute("inert")) return;
    mobileMenu.querySelectorAll("a,p").forEach((element, index) => reveal(element, index * 0.06));
  }).observe(mobileMenu, { attributes: true, attributeFilter: ["inert"] });

  const actions = document.querySelectorAll<HTMLElement>(".button,.text-link,.header-contact,.service-content a");
  for (const action of actions) {
    const text = [...action.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if (text) {
      const label = document.createElement("span");
      label.className = "button-label";
      const front = document.createElement("span");
      front.className = "label-front";
      front.textContent = text.textContent?.trim() ?? "";
      const back = front.cloneNode(true) as HTMLSpanElement;
      back.className = "label-back";
      back.setAttribute("aria-hidden", "true");
      label.append(front, back);
      action.replaceChild(label, text);
      if (!action.closest(".hero-offer")) inView(label, () => reveal(label), { amount: "some" });
    }
    action.classList.add("motion-button");
  }

  const controls = document.querySelectorAll<HTMLElement>(
    "button,summary,.button,.text-link,.header-contact,.service-content a",
  );
  for (const control of controls) {
    if (control.closest("#circular-gallery") || control.matches("summary,.process-step")) continue;
    const action = control.matches("summary") ? control.querySelector<HTMLElement>(".service-title") ?? control : control;
    let hovering = false;
    const move = (y: number, scale: number) => {
      if (reduced.matches) return;
      animate(action, { y, scale }, { type: "spring", stiffness: 430, damping: 31 });
    };
    hover(control, () => {
      hovering = true;
      move(-2, 1);
      return () => { hovering = false; move(0, 1); };
    });
    press(control, () => {
      move(hovering ? -1 : 0, 0.97);
      return () => move(hovering ? -2 : 0, 1);
    });
  }
}
