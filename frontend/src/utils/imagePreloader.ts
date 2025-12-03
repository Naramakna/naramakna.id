// Smart image preloading utility
export class ImagePreloader {
  private static preloadedImages = new Set<string>();
  
  static preload(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve(document.createElement('img'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static preloadMultiple(sources: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(sources.map(src => this.preload(src)));
  }

  // Preload images when they're about to enter viewport
  static observeAndPreload(element: HTMLElement, imageSrc: string, rootMargin = '50px') {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.preload(imageSrc);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin }
      );
      
      observer.observe(element);
      return observer;
    }
    return null;
  }
}