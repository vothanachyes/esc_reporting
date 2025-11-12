/**
 * Utility function to resolve avatar image URLs for Vite builds
 * Handles both local assets (processed by Vite) and external URLs
 */
export function getAvatarUrl(avatarPath: string | undefined): string {
  if (!avatarPath) return '';
  
  // If it's already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // If it's a public path (starts with /), return as-is
  // Public paths work in production
  if (avatarPath.startsWith('/') && !avatarPath.startsWith('/src/')) {
    return avatarPath;
  }
  
  // For src/assets paths, use dynamic import with new URL()
  // This allows Vite to process the asset at build time
  if (avatarPath.includes('/src/assets/') || avatarPath.includes('assets/')) {
    // Extract the filename from the path
    // Handle both "/src/assets/images/vothana.jpg" and "assets/images/vothana.jpg"
    let cleanPath = avatarPath
      .replace(/^\/src\//, '')
      .replace(/^src\//, '')
      .replace(/^\//, '');
    
    // Create a relative path from utils directory to assets
    // utils/ -> assets/images/filename.jpg
    const relativePath = `../${cleanPath}`;
    
    try {
      // Use new URL() with import.meta.url to let Vite process this at build time
      // This will be transformed by Vite to the correct production path
      return new URL(relativePath, import.meta.url).href;
    } catch (error) {
      console.warn(`Failed to resolve avatar path: ${avatarPath}`, error);
      return avatarPath;
    }
  }
  
  // Fallback: return as-is
  return avatarPath;
}

