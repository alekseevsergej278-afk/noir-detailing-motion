import { animate, hover, inView, press, scroll } from "motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function initSiteMotion() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const progress = document.querySelector<HTMLElement>(".reading-progress");
  if (progress) scroll((value: number) => { progress.style.transform = `scaleX(${value})`; });

  const headings = [...document.querySelectorAll<HTMLElement>("h2.reveal")];
  for (const heading of headings) heading.classList.remove("reveal", "is-pending");

  inView(headings, (heading) => {
    if (reduced.matches) return;
    animate(heading, {
      y: [15, 0],
      opacity: [0.55, 1],
      clipPath: ["inset(0 0 68% 0)", "inset(0 0 0% 0)"],
    }, { duration: 0.72, ease });
  }, { amount: 0.35 });

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
    }
    action.classList.add("motion-button");
    let hovering = false;
    const move = (y: number, scale: number) => {
      if (reduced.matches) return;
      animate(action, { y, scale }, { type: "spring", stiffness: 430, damping: 31 });
    };
    hover(action, () => {
      hovering = true;
      move(-2, 1.025);
      return () => { hovering = false; move(0, 1); };
    });
    press(action, () => {
      move(hovering ? -1 : 0, 0.97);
      return () => move(hovering ? -2 : 0, hovering ? 1.025 : 1);
    });
  }
}
