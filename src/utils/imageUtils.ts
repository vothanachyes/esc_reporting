import type { ImageConfig } from "@/data/types";

export function getImageUrl(url: string, local: boolean = false): string {
  if (local) {
    return url.startsWith("/") ? url : `/${url}`;
  }
  return url;
}

export function recommendImages(keywords: string[]): ImageConfig[] {
  // Enhanced image mapping with better Unsplash images
  const imageMap: Record<string, string> = {
    video: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
    quiz: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    refactoring: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    feature: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    forum: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    zoom: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
    library: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    course: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    story: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
    cart: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    home: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800",
    profile: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800",
    splash: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    comment: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    interaction: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
    composable: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    security: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    performance: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    ui: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    typescript: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800",
    bug: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
  };

  const recommended: ImageConfig[] = [];
  const usedUrls = new Set<string>();

  keywords.forEach((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    for (const [key, url] of Object.entries(imageMap)) {
      if (lowerKeyword.includes(key) && !usedUrls.has(url)) {
        recommended.push({
          url,
          alt: `${keyword} illustration`,
          local: false,
        });
        usedUrls.add(url);
        break;
      }
    }
  });

  // If no images found, use a default
  if (recommended.length === 0) {
    recommended.push({
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      alt: "Feature illustration",
      local: false,
    });
  }

  return recommended;
}
