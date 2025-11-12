import { gsap } from "gsap";
import type { AnimationType } from "@/data/types";

const animationRegistry: Record<
  AnimationType,
  (element: HTMLElement, direction: "in" | "out") => gsap.core.Tween
> = {
  fade: (element, direction) => {
    return gsap.fromTo(
      element,
      { opacity: direction === "in" ? 0 : 1 },
      { opacity: direction === "in" ? 1 : 0, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
  slideUp: (element, direction) => {
    return gsap.fromTo(
      element,
      { y: direction === "in" ? 50 : 0 },
      { y: direction === "in" ? 0 : 50, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
  slideDown: (element, direction) => {
    return gsap.fromTo(
      element,
      { y: direction === "in" ? -50 : 0 },
      { y: direction === "in" ? 0 : -50, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
  slideLeft: (element, direction) => {
    return gsap.fromTo(
      element,
      { x: direction === "in" ? 50 : 0 },
      { x: direction === "in" ? 0 : 50, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
  slideRight: (element, direction) => {
    return gsap.fromTo(
      element,
      { x: direction === "in" ? -50 : 0 },
      { x: direction === "in" ? 0 : -50, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
  scale: (element, direction) => {
    return gsap.fromTo(
      element,
      { scale: direction === "in" ? 0.8 : 1 },
      { scale: direction === "in" ? 1 : 0.8, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
  rotate: (element, direction) => {
    return gsap.fromTo(
      element,
      { rotation: direction === "in" ? -10 : 0 },
      { rotation: direction === "in" ? 0 : -10, duration: 0.6, ease: "power2.out", force3D: true },
    );
  },
};

export function useGSAPAnimations() {
  const animateIn = (element: HTMLElement, animations: AnimationType[]) => {
    if (!element || animations.length === 0) return;

    // Don't clear props here - initial state should be set before calling this
    // gsap.set(element, { clearProps: "all" });

    // Set will-change for better performance and GPU acceleration
    gsap.set(element, { willChange: "transform, opacity" });

    // Create timeline for combined animations
    const tl = gsap.timeline({
      onComplete: () => {
        // Clear will-change after animation completes for better performance
        gsap.set(element, { willChange: "auto" });
      },
    });

    animations.forEach((animationType) => {
      const anim = animationRegistry[animationType];
      if (anim) {
        tl.add(anim(element, "in"), 0); // Start all animations at the same time
      }
    });

    return tl;
  };

  const animateOut = (element: HTMLElement, animations: AnimationType[]) => {
    if (!element || animations.length === 0) return;

    // Set will-change for better performance and GPU acceleration
    gsap.set(element, { willChange: "transform, opacity" });

    const tl = gsap.timeline({
      onComplete: () => {
        // Clear will-change after animation completes for better performance
        gsap.set(element, { willChange: "auto" });
      },
    });

    animations.forEach((animationType) => {
      const anim = animationRegistry[animationType];
      if (anim) {
        tl.add(anim(element, "out"), 0);
      }
    });

    return tl;
  };

  return {
    animateIn,
    animateOut,
  };
}

