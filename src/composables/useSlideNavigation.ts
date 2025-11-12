import { gsap } from "gsap";

export function useSlideNavigation() {
  const scrollToSlide = (container: HTMLElement, index: number, slideWidth: number) => {
    gsap.to(container, {
      scrollLeft: index * slideWidth,
      duration: 0.8,
      ease: "power2.inOut",
    });
  };

  const animateGridToFullscreen = (element: HTMLElement, callback?: () => void) => {
    gsap.fromTo(
      element,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: callback,
      },
    );
  };

  const animateFullscreenToGrid = (element: HTMLElement, callback?: () => void) => {
    gsap.to(element, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: callback,
    });
  };

  return {
    scrollToSlide,
    animateGridToFullscreen,
    animateFullscreenToGrid,
  };
}

