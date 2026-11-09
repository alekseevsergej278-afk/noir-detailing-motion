import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { initSiteMotion } from "./site-motion";
import "@fontsource-variable/golos-text";
import "./gallery.css";

const items: GalleryItem[] = [
  { common: "Линия кузова", binomial: "Свет вдоль силуэта", photo: {
    url: "assets/atelier.png", text: "Чёрное купе в ателье", pos: "64% center", by: "Концепт NOIR",
  } },
  { common: "Глубина отражения", binomial: "Макросъёмка лака", photo: {
    url: "assets/paint.png", text: "Белый свет отражается в чёрном лаке", by: "Концепт NOIR",
  } },
  { common: "Точность деталей", binomial: "Серебристый Mercedes-AMG", photo: {
    url: "assets/mercedes.jpg", text: "Передняя часть серебристого Mercedes-AMG", pos: "52% center", by: "Unsplash",
  } },
  { common: "Фактура салона", binomial: "Карбон и кожа McLaren", photo: {
    url: "assets/gallery-interior.jpg", text: "Руль и приборная панель McLaren Senna", pos: "center 52%", by: "Rahul Bhogal · Unsplash",
  } },
  { common: "Линия заднего света", binomial: "Фонарь Porsche", photo: {
    url: "assets/gallery-taillight.jpg", text: "Задний фонарь чёрного Porsche крупным планом", pos: "center 52%", by: "Ryan Spence · Unsplash",
  } },
];

function NoirGallery() {
  useEffect(() => {
    document.querySelector<HTMLElement>("[data-gallery-fallback]")?.setAttribute("hidden", "");
  }, []);
  return <CircularGallery items={items} />;
}

const mount = document.querySelector("#circular-gallery");
if (mount) createRoot(mount).render(<NoirGallery />);
initSiteMotion();
