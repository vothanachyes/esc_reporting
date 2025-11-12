/**
 * Utility function to resolve avatar image URLs for Vite builds
 * Handles both local assets (processed by Vite) and external URLs
 * 
 * Uses static imports to ensure Vite processes assets correctly in production builds
 */

// Static imports - Vite will process these at build time and generate correct production paths
import vothanaAvatar from '@/assets/images/vothana.jpg';
import teamLeadAvatar from '@/assets/images/teamLead.jpg';

// Mapping of avatar paths to imported URLs
// This allows Vite to statically analyze and process the imports
const avatarMap: Record<string, string> = {
  '/src/assets/images/vothana.jpg': vothanaAvatar,
  'src/assets/images/vothana.jpg': vothanaAvatar,
  'assets/images/vothana.jpg': vothanaAvatar,
  '/src/assets/images/teamLead.jpg': teamLeadAvatar,
  'src/assets/images/teamLead.jpg': teamLeadAvatar,
  'assets/images/teamLead.jpg': teamLeadAvatar,
};

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
  
  // Check if we have a static import for this path
  if (avatarMap[avatarPath]) {
    return avatarMap[avatarPath];
  }
  
  // For other src/assets paths, try to match by filename
  // Extract just the filename and check if it matches our known avatars
  const filename = avatarPath.split('/').pop() || '';
  if (filename === 'vothana.jpg') {
    return vothanaAvatar;
  }
  if (filename === 'teamLead.jpg') {
    return teamLeadAvatar;
  }
  
  // Fallback: return as-is (might not work in production, but better than breaking)
  console.warn(`Avatar path not found in static imports: ${avatarPath}`);
  return avatarPath;
}

