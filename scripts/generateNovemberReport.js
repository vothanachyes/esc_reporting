import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the November markdown file
const markdownPath = resolve(__dirname, "../docs/november 2025/November_2025_Report.md");
const markdown = readFileSync(markdownPath, "utf-8");

// Import the parser (we'll need to compile or use a different approach)
// For now, let's create a simplified version that generates the JSON structure
// We'll use a Node.js compatible approach

// Simple parser for November report
function parseNovemberMarkdown(markdown) {
  const mainWrapper = {
    title: "November Task Report - November 1-11, 2025",
    handler: {
      name: "Vothana CHY",
      avatar: "",
      role: "Developer",
    },
    teamLeader: {
      name: "Team Leader",
      avatar: "",
      role: "Team Leader",
    },
    period: "November 1-11, 2025",
    statistics: {
      totalTasks: 0,
      completedTasks: 0,
      features: 22,
      refactorings: 8,
    },
  };

  const slides = [];
  let pageIndex = 0;

  // Add intro slide
  slides.push({
    title: "Welcome, Vothana CHY!",
    subtitle: [
      "Monthly Report - November 1-11, 2025",
      "November 2025 Work Summary"
    ],
    content: `
      <div class="text-center space-y-4">
        <p class="text-xl text-gray-700">This report showcases the comprehensive work completed during November 1-11, 2025.</p>
        <div class="grid grid-cols-2 gap-4 mt-8">
          <div class="bg-primary/10 p-4 rounded-lg">
            <div class="text-3xl font-bold text-primary">22</div>
            <div class="text-sm text-gray-600">Features</div>
          </div>
          <div class="bg-primary/10 p-4 rounded-lg">
            <div class="text-3xl font-bold text-primary">8</div>
            <div class="text-sm text-gray-600">Types</div>
          </div>
        </div>
      </div>
    `,
    images: [{
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      alt: "Welcome illustration",
      local: false
    }],
    imageAlignment: "right",
    imageContainerWidth: 40,
    animationIn: ["fade", "scale", "slideUp"],
    animationOut: ["fade", "slideUp"],
    pageIndex: pageIndex++,
    type: "Introduction"
  });

  // Parse features section
  const featuresSection = markdown.match(/## 🎯 By Feature([\s\S]*?)(?=## 🔧 By Type|$)/);
  if (featuresSection) {
    const featuresContent = featuresSection[1];
    const featureMatches = featuresContent.matchAll(/### \d+\.\s+([^\n]+)\n([\s\S]*?)(?=### \d+\.|$)/g);
    
    for (const match of featureMatches) {
      const featureTitle = match[1].trim();
      const featureContent = match[2];
      
      // Extract status
      const statusMatch = featureContent.match(/#### Status:\s*\*\*([^*]+)\*\*/);
      const status = statusMatch ? statusMatch[1].trim() : "Done";
      
      // Extract completed tasks
      const completedTasksMatch = featureContent.match(/#### Completed Tasks([\s\S]*?)(?=####|####|$)/);
      const plannedTasksMatch = featureContent.match(/#### Planned Tasks([\s\S]*?)(?=####|####|$)/);
      
      const tasks = [];
      
      if (completedTasksMatch) {
        const tasksText = completedTasksMatch[1];
        const taskMatches = tasksText.matchAll(/- (✅|🔄)\s+\*\*([^*]+)\*\*(?: - ([^\n]+))?/g);
        for (const taskMatch of taskMatches) {
          tasks.push({
            emoji: taskMatch[1],
            title: taskMatch[2].trim(),
            description: taskMatch[3]?.trim() || ""
          });
        }
      }
      
      if (plannedTasksMatch) {
        const tasksText = plannedTasksMatch[1];
        const taskMatches = tasksText.matchAll(/- ⏸️\s+\*\*([^*]+)\*\*(?: - ([^\n]+))?/g);
        for (const taskMatch of taskMatches) {
          tasks.push({
            emoji: "⏸️",
            title: taskMatch[1].trim(),
            description: taskMatch[2]?.trim() || ""
          });
        }
      }
      
      // Split tasks into chunks of 8 for 2-column layout
      const chunks = [];
      for (let i = 0; i < tasks.length; i += 8) {
        chunks.push(tasks.slice(i, i + 8));
      }
      
      chunks.forEach((chunk, chunkIndex) => {
        const emojiClass = chunk[0]?.emoji === "✅" ? "text-green-400" : 
                          chunk[0]?.emoji === "🔄" ? "text-blue-400" : 
                          "text-yellow-400";
        
        const tasksHTML = chunk.map(task => {
          const taskEmojiClass = task.emoji === "✅" ? "text-green-400" : 
                                task.emoji === "🔄" ? "text-blue-400" : 
                                "text-yellow-400";
          return `
            <div class="mb-5 p-4 rounded-lg bg-white/5 dark:bg-gray-800/30 border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors">
              <div class="flex items-start gap-3">
                <span class="text-2xl ${taskEmojiClass} flex-shrink-0 mt-0.5">${task.emoji}</span>
                <div class="flex-1 min-w-0">
                  <h4 class="text-base font-bold text-white dark:text-gray-100 mb-1 leading-tight">${escapeHtml(task.title)}</h4>
                  ${task.description ? `<p class="text-sm text-gray-300 dark:text-gray-400 mb-2 leading-relaxed">${escapeHtml(task.description)}</p>` : ""}
                </div>
              </div>
            </div>
          `;
        }).join("");
        
        slides.push({
          title: chunkIndex === 0 ? featureTitle : `${featureTitle} (Continued)`,
          subtitle: [`Status: ${status}`],
          content: `<div class="grid grid-cols-2 gap-4">${tasksHTML}</div>`,
          images: getFeatureImages(featureTitle),
          imageAlignment: "right",
          imageContainerWidth: 35,
          animationIn: getAnimation(pageIndex, "in"),
          animationOut: ["fade", "slideUp"],
          pageIndex: pageIndex++,
          type: "Feature"
        });
      });
    }
  }

  // Add thank you slide
  slides.push({
    title: "Thank You",
    subtitle: ["For Your Time and Review"],
    content: `
      <div class="text-center space-y-6">
        <p class="text-2xl text-gray-700">Thank you for reviewing this comprehensive report.</p>
        <p class="text-lg text-gray-600">Looking forward to continued collaboration and success.</p>
        <div class="mt-8 text-primary font-semibold">2025 - E-School Cambodia</div>
      </div>
    `,
    images: [{
      url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
      alt: "Thank you illustration",
      local: false
    }],
    imageAlignment: "left",
    imageContainerWidth: 35,
    animationIn: ["fade", "scale"],
    animationOut: ["fade", "scale"],
    pageIndex: pageIndex++,
    type: "Closing"
  });

  return { mainWrapper, slides };
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getFeatureImages(featureTitle) {
  const titleLower = featureTitle.toLowerCase();
  const images = [];
  
  if (titleLower.includes("forum")) {
    images.push({ url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800", alt: "forum illustration", local: false });
  }
  if (titleLower.includes("social")) {
    images.push({ url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800", alt: "social illustration", local: false });
  }
  if (titleLower.includes("quiz")) {
    images.push({ url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800", alt: "quiz illustration", local: false });
  }
  if (titleLower.includes("video")) {
    images.push({ url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800", alt: "video illustration", local: false });
  }
  if (titleLower.includes("zoom")) {
    images.push({ url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800", alt: "zoom illustration", local: false });
  }
  if (titleLower.includes("library")) {
    images.push({ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", alt: "library illustration", local: false });
  }
  if (titleLower.includes("course")) {
    images.push({ url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", alt: "course illustration", local: false });
  }
  if (titleLower.includes("pdf") || titleLower.includes("viewer")) {
    images.push({ url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800", alt: "pdf illustration", local: false });
  }
  if (titleLower.includes("electron") || titleLower.includes("infrastructure")) {
    images.push({ url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800", alt: "infrastructure illustration", local: false });
  }
  if (titleLower.includes("security") || titleLower.includes("cors")) {
    images.push({ url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800", alt: "security illustration", local: false });
  }
  if (titleLower.includes("test")) {
    images.push({ url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", alt: "testing illustration", local: false });
  }
  if (titleLower.includes("socket") || titleLower.includes("real-time") || titleLower.includes("communication")) {
    images.push({ url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", alt: "communication illustration", local: false });
  }
  if (titleLower.includes("code") || titleLower.includes("organization")) {
    images.push({ url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", alt: "code illustration", local: false });
  }
  if (titleLower.includes("performance") || titleLower.includes("rate")) {
    images.push({ url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800", alt: "performance illustration", local: false });
  }
  if (titleLower.includes("ui") || titleLower.includes("ux")) {
    images.push({ url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", alt: "ui illustration", local: false });
  }
  
  return images.length > 0 ? images : [{ url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", alt: "feature illustration", local: false }];
}

function getAnimation(index, type) {
  const animations = [
    ["fade", "slideUp"],
    ["fade", "slideDown"],
    ["fade", "scale"],
    ["slideLeft", "fade"],
    ["slideRight", "fade"],
    ["fade", "scale", "slideUp"],
    ["rotate", "fade"],
    ["slideUp", "scale"],
  ];
  return animations[index % animations.length];
}

// Generate the report
const reportData = parseNovemberMarkdown(markdown);

// Write JSON file
const outputPath = resolve(__dirname, "../src/data/novemberReport.json");
writeFileSync(outputPath, JSON.stringify(reportData, null, 2), "utf-8");

console.log("✅ November report data generated successfully!");
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Slides: ${reportData.slides.length}`);

