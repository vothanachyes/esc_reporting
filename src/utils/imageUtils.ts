import type { ImageConfig } from "@/data/types";

/**
 * Utility function to resolve image URLs for Vite builds
 * Handles both local assets (processed by Vite) and external URLs
 * 
 * Uses static imports to ensure Vite processes assets correctly in production builds
 */

// Static imports - Vite will process these at build time and generate correct production paths
// Social images
import socialPage from '@/assets/images/social/social_page.png';
import socialComment from '@/assets/images/social/social_comment.png';
import socialView from '@/assets/images/social/social_view.png';
import commentFromSocial from '@/assets/images/social/comment_from_social.png';
import replyComment from '@/assets/images/social/reply_comment.png';

// Video images
import courseListing from '@/assets/images/video/course_listing.png';
import video2 from '@/assets/images/video/video_2.png';
import videoLocked from '@/assets/images/video/video_locked.png';
import videoPlaylist from '@/assets/images/video/video_playlist.png';

// Quiz images
import doingQuiz from '@/assets/images/quiz/doing_quiz.png';
import quizPassed from '@/assets/images/quiz/quiz_passed.png';
import quizFailed from '@/assets/images/quiz/quiz_failed.png';
import quizReviewAnswer from '@/assets/images/quiz/quiz_review_answer.png';
import startQuiz from '@/assets/images/quiz/start_quiz.png';

// Forum images
import forumComments from '@/assets/images/forum/forum_comments.png';
import forumListing from '@/assets/images/forum/forum_listing.png';

// Story images
import allStories from '@/assets/images/story/all_stories.png';
import ownStory from '@/assets/images/story/own_story.png';
import storyView from '@/assets/images/story/story_view.png';

// Other images
import zoomCourseListing from '@/assets/images/zoom/zoom_course_listing.png';
import libraryOld from '@/assets/images/library/library_old.png';
import addToCart from '@/assets/images/cart/add_to_cart.png';
import splashScreen from '@/assets/images/splash_screen.png';
import partner from '@/assets/images/partner/Partner.png';
import pdfViewerLight from '@/assets/images/pdf-viewer/1_pdf_viewer_light_fullscreen_no_pdf.png';
import pdfViewerDark from '@/assets/images/pdf-viewer/pdf_viewer_dark_full_screen.png';
import pdfDialogWarm from '@/assets/images/pdf-viewer/pdf_dialog_warm.png';

// Mapping of image paths to imported URLs
// This allows Vite to statically analyze and process the imports
const imageMap: Record<string, string> = {
  // Social images
  '/src/assets/images/social/social_page.png': socialPage,
  'src/assets/images/social/social_page.png': socialPage,
  'assets/images/social/social_page.png': socialPage,
  '/src/assets/images/social/social_comment.png': socialComment,
  'src/assets/images/social/social_comment.png': socialComment,
  'assets/images/social/social_comment.png': socialComment,
  '/src/assets/images/social/social_view.png': socialView,
  'src/assets/images/social/social_view.png': socialView,
  'assets/images/social/social_view.png': socialView,
  '/src/assets/images/social/comment_from_social.png': commentFromSocial,
  'src/assets/images/social/comment_from_social.png': commentFromSocial,
  'assets/images/social/comment_from_social.png': commentFromSocial,
  '/src/assets/images/social/reply_comment.png': replyComment,
  'src/assets/images/social/reply_comment.png': replyComment,
  'assets/images/social/reply_comment.png': replyComment,

  // Video images
  '/src/assets/images/video/course_listing.png': courseListing,
  'src/assets/images/video/course_listing.png': courseListing,
  'assets/images/video/course_listing.png': courseListing,
  '/src/assets/images/video/video_2.png': video2,
  'src/assets/images/video/video_2.png': video2,
  'assets/images/video/video_2.png': video2,
  '/src/assets/images/video/video_locked.png': videoLocked,
  'src/assets/images/video/video_locked.png': videoLocked,
  'assets/images/video/video_locked.png': videoLocked,
  '/src/assets/images/video/video_playlist.png': videoPlaylist,
  'src/assets/images/video/video_playlist.png': videoPlaylist,
  'assets/images/video/video_playlist.png': videoPlaylist,

  // Quiz images
  '/src/assets/images/quiz/doing_quiz.png': doingQuiz,
  'src/assets/images/quiz/doing_quiz.png': doingQuiz,
  'assets/images/quiz/doing_quiz.png': doingQuiz,
  '/src/assets/images/quiz/quiz_passed.png': quizPassed,
  'src/assets/images/quiz/quiz_passed.png': quizPassed,
  'assets/images/quiz/quiz_passed.png': quizPassed,
  '/src/assets/images/quiz/quiz_failed.png': quizFailed,
  'src/assets/images/quiz/quiz_failed.png': quizFailed,
  'assets/images/quiz/quiz_failed.png': quizFailed,
  '/src/assets/images/quiz/quiz_review_answer.png': quizReviewAnswer,
  'src/assets/images/quiz/quiz_review_answer.png': quizReviewAnswer,
  'assets/images/quiz/quiz_review_answer.png': quizReviewAnswer,
  '/src/assets/images/quiz/start_quiz.png': startQuiz,
  'src/assets/images/quiz/start_quiz.png': startQuiz,
  'assets/images/quiz/start_quiz.png': startQuiz,

  // Forum images
  '/src/assets/images/forum/forum_comments.png': forumComments,
  'src/assets/images/forum/forum_comments.png': forumComments,
  'assets/images/forum/forum_comments.png': forumComments,
  '/src/assets/images/forum/forum_listing.png': forumListing,
  'src/assets/images/forum/forum_listing.png': forumListing,
  'assets/images/forum/forum_listing.png': forumListing,

  // Story images
  '/src/assets/images/story/all_stories.png': allStories,
  'src/assets/images/story/all_stories.png': allStories,
  'assets/images/story/all_stories.png': allStories,
  '/src/assets/images/story/own_story.png': ownStory,
  'src/assets/images/story/own_story.png': ownStory,
  'assets/images/story/own_story.png': ownStory,
  '/src/assets/images/story/story_view.png': storyView,
  'src/assets/images/story/story_view.png': storyView,
  'assets/images/story/story_view.png': storyView,

  // Other images
  '/src/assets/images/zoom/zoom_course_listing.png': zoomCourseListing,
  'src/assets/images/zoom/zoom_course_listing.png': zoomCourseListing,
  'assets/images/zoom/zoom_course_listing.png': zoomCourseListing,
  '/src/assets/images/library/library_old.png': libraryOld,
  'src/assets/images/library/library_old.png': libraryOld,
  'assets/images/library/library_old.png': libraryOld,
  '/src/assets/images/cart/add_to_cart.png': addToCart,
  'src/assets/images/cart/add_to_cart.png': addToCart,
  'assets/images/cart/add_to_cart.png': addToCart,
  '/src/assets/images/splash_screen.png': splashScreen,
  'src/assets/images/splash_screen.png': splashScreen,
  'assets/images/splash_screen.png': splashScreen,
  '/src/assets/images/partner/Partner.png': partner,
  'src/assets/images/partner/Partner.png': partner,
  'assets/images/partner/Partner.png': partner,
  '/src/assets/images/pdf-viewer/1_pdf_viewer_light_fullscreen_no_pdf.png': pdfViewerLight,
  'src/assets/images/pdf-viewer/1_pdf_viewer_light_fullscreen_no_pdf.png': pdfViewerLight,
  'assets/images/pdf-viewer/1_pdf_viewer_light_fullscreen_no_pdf.png': pdfViewerLight,
  '/src/assets/images/pdf-viewer/pdf_viewer_dark_full_screen.png': pdfViewerDark,
  'src/assets/images/pdf-viewer/pdf_viewer_dark_full_screen.png': pdfViewerDark,
  'assets/images/pdf-viewer/pdf_viewer_dark_full_screen.png': pdfViewerDark,
  '/src/assets/images/pdf-viewer/pdf_dialog_warm.png': pdfDialogWarm,
  'src/assets/images/pdf-viewer/pdf_dialog_warm.png': pdfDialogWarm,
  'assets/images/pdf-viewer/pdf_dialog_warm.png': pdfDialogWarm,
};

export function getImageUrl(url: string, local: boolean = false): string {
  if (local) {
    // If it's already a full URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a public path (starts with /), return as-is
    // Public paths work in production
    if (url.startsWith('/') && !url.startsWith('/src/')) {
      return url;
    }
    
    // Check if we have a static import for this path
    if (imageMap[url]) {
      return imageMap[url];
    }
    
    // For other src/assets paths, try to match by filename
    // Extract just the filename and check if it matches our known images
    const filename = url.split('/').pop() || '';
    const matchedEntry = Object.entries(imageMap).find(([key]) => key.endsWith(filename));
    if (matchedEntry) {
      return matchedEntry[1];
    }
    
    // Fallback: return as-is (might not work in production, but better than breaking)
    console.warn(`Image path not found in static imports: ${url}`);
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
