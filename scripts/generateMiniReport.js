import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Legend Task mapping: Feature patterns → Legend Task
const LEGEND_TASK_MAPPING = [
  { pattern: /Video Player|Video/i, legend: "Video" },
  { pattern: /Quiz System|Quiz/i, legend: "Quiz" },
  { pattern: /Story/i, legend: "Story" },
  { pattern: /Course|My Course/i, legend: "Course" },
  { pattern: /Cart/i, legend: "Cart" },
  { pattern: /Forum/i, legend: "Forum" },
  { pattern: /Home Page|Social|My Favorite|Relative|Post/i, legend: "Social" },
  { pattern: /Profile/i, legend: "Social" },
  { pattern: /Comment/i, legend: "Social" },
  { pattern: /Interaction.*Reaction/i, legend: "Social" },
  { pattern: /Zoom|My Zoom/i, legend: "Zoom" },
  { pattern: /Library|My Library/i, legend: "Library" },
  { pattern: /Splash Screen/i, legend: "Splash" },
  { pattern: /PDF Viewer/i, legend: "PDF Viewer" },
  { pattern: /Electron|Infrastructure/i, legend: "Infrastructure" },
  { pattern: /Security|CORS/i, legend: "Security" },
  { pattern: /Testing Infrastructure|Testing/i, legend: "Testing" },
  { pattern: /Real-time Communication|Socket/i, legend: "Real-time" },
  { pattern: /Code Organization/i, legend: "Code Organization" },
  { pattern: /Performance|Rate Limiting/i, legend: "Performance" },
  { pattern: /UI\/UX|UI|UX/i, legend: "UI/UX" },
  { pattern: /Partner Page/i, legend: "Partner" },
];

// Animation combinations for different slide types
const animations = [
  { in: ["fade", "slideUp"], out: ["fade", "slideUp"] },
  { in: ["fade", "slideDown"], out: ["fade", "slideUp"] },
  { in: ["fade", "scale"], out: ["fade", "scale"] },
  { in: ["slideLeft", "fade"], out: ["fade", "slideUp"] },
  { in: ["slideRight", "fade"], out: ["fade", "slideUp"] },
  { in: ["slideUp", "scale"], out: ["fade", "slideUp"] },
  { in: ["rotate", "fade"], out: ["fade", "slideUp"] },
];

let animationIndex = 0;
function getNextAnimation() {
  const anim = animations[animationIndex % animations.length];
  animationIndex++;
  return anim;
}

// Helper to extract images from slides
function extractImages(slides) {
  const allImages = [];
  slides.forEach((slide) => {
    if (slide.images && Array.isArray(slide.images)) {
      allImages.push(...slide.images);
    }
  });
  // Remove duplicates based on URL
  const uniqueImages = [];
  const seenUrls = new Set();
  allImages.forEach((img) => {
    if (!seenUrls.has(img.url)) {
      seenUrls.add(img.url);
      uniqueImages.push(img);
    }
  });
  return uniqueImages.slice(0, 6); // Limit to 6 images per slide
}

// Helper to combine content from multiple slides
function combineContent(slides) {
  const combinedContent = [];
  slides.forEach((slide) => {
    if (Array.isArray(slide.content)) {
      combinedContent.push(...slide.content);
    } else if (slide.content && typeof slide.content === "object") {
      // Handle stats content type
      combinedContent.push(slide.content);
    }
  });
  return combinedContent;
}

// Helper to determine overall status from slides
function getOverallStatus(slides) {
  const statuses = slides
    .map((slide) => slide.subtitle?.[0])
    .filter(Boolean)
    .map((subtitle) => {
      if (subtitle.includes("Done")) return "done";
      if (subtitle.includes("Almost Done")) return "almost-done";
      if (subtitle.includes("Partially Done")) return "partially-done";
      if (subtitle.includes("Mostly Done")) return "mostly-done";
      if (subtitle.includes("Todo")) return "todo";
      return "unknown";
    });

  if (statuses.every((s) => s === "done")) return "Done";
  if (statuses.some((s) => s === "done") && statuses.some((s) => s === "almost-done"))
    return "Mostly Done";
  if (statuses.some((s) => s === "almost-done")) return "Almost Done";
  if (statuses.some((s) => s === "partially-done")) return "Partially Done";
  if (statuses.some((s) => s === "mostly-done")) return "Mostly Done";
  if (statuses.some((s) => s === "todo")) return "In Progress";
  return "Done";
}

// Group slides by Legend Task
function groupSlidesByLegendTask(slides) {
  const groups = new Map();

  slides.forEach((slide) => {
    // Only process Feature type slides
    if (slide.type === "Feature") {
      const title = slide.title.replace(" (Continued)", "").trim();

      // Find the Legend Task for this feature using pattern matching
      let legendTask = null;
      for (const { pattern, legend } of LEGEND_TASK_MAPPING) {
        if (pattern.test(title)) {
          legendTask = legend;
          break;
        }
      }

      // If still no match, extract feature name from title
      if (!legendTask) {
        const featureName = title.replace(" Feature", "").trim();
        legendTask = featureName;
      }

      if (!groups.has(legendTask)) {
        groups.set(legendTask, []);
      }
      groups.get(legendTask).push(slide);
    }
  });

  return groups;
}

// Generate mini report
function generateMiniReport(inputPath, outputPath) {
  console.log("Reading input file:", inputPath);
  const inputData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  const miniSlides = [];

  // Keep intro slide
  const introSlide = inputData.slides.find((s) => s.type === "Introduction");
  if (introSlide) {
    miniSlides.push({
      ...introSlide,
      pageIndex: 0,
    });
  }

  // Group feature slides by Legend Task
  const featureSlides = inputData.slides.filter(
    (s) => s.type === "Feature" || (s.title && !s.type)
  );
  const groupedSlides = groupSlidesByLegendTask(featureSlides);

  let pageIndex = miniSlides.length;

  // Create one slide per Legend Task
  for (const [legendTask, slides] of groupedSlides.entries()) {
    const combinedContent = combineContent(slides);
    const images = extractImages(slides);
    const status = getOverallStatus(slides);
    const anim = getNextAnimation();

    // If content is too large, split into multiple slides
    const maxTasksPerSlide = 12;
    const chunks = [];
    for (let i = 0; i < combinedContent.length; i += maxTasksPerSlide) {
      chunks.push(combinedContent.slice(i, i + maxTasksPerSlide));
    }

    chunks.forEach((chunk, chunkIndex) => {
      miniSlides.push({
        title: chunkIndex === 0 ? `${legendTask} Feature` : `${legendTask} Feature (Continued)`,
        subtitle: [`Status: ${status}`],
        content: chunk,
        images: images,
        imageAlignment: "right",
        imageContainerWidth: 35,
        animationIn: anim.in,
        animationOut: anim.out,
        pageIndex: pageIndex++,
        type: "Feature",
      });
    });
  }

  // Keep image/project showcase slides
  const imageSlides = inputData.slides.filter((s) => s.type === "Image");
  imageSlides.forEach((slide) => {
    miniSlides.push({
      ...slide,
      pageIndex: pageIndex++,
    });
  });

  // Keep closing slide
  const closingSlide = inputData.slides.find((s) => s.type === "Closing");
  if (closingSlide) {
    miniSlides.push({
      ...closingSlide,
      pageIndex: pageIndex++,
    });
  }

  // Create mini report structure
  const miniReport = {
    mainWrapper: inputData.mainWrapper,
    slides: miniSlides,
  };

  // Write output file
  console.log("Writing output file:", outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(miniReport, null, 2), "utf-8");
  console.log(`✅ Generated mini report with ${miniSlides.length} slides (down from ${inputData.slides.length})`);
  console.log(`   Legend Tasks: ${Array.from(groupedSlides.keys()).join(", ")}`);
}

// Main execution - check command line arguments
const args = process.argv.slice(2);
const reportType = args[0] || "october"; // Default to october

let inputPath, outputPath;
if (reportType === "november") {
  inputPath = path.join(__dirname, "../src/data/novemberReport.json");
  outputPath = path.join(__dirname, "../src/data/novemberReport_mini.json");
} else {
  inputPath = path.join(__dirname, "../src/data/octoberReport.json");
  outputPath = path.join(__dirname, "../src/data/octoberReport_mini.json");
}

generateMiniReport(inputPath, outputPath);

