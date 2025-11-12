import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Image recommendations based on keywords
const imageMap = {
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

const animationPresets = [
  ["fade", "slideUp"],
  ["fade", "slideDown"],
  ["fade", "scale"],
  ["slideLeft", "fade"],
  ["slideRight", "fade"],
  ["fade", "scale", "slideUp"],
  ["rotate", "fade"],
  ["slideUp", "scale"],
];

let animationIndex = 0;

function getNextAnimation() {
  const anim = animationPresets[animationIndex % animationPresets.length];
  animationIndex++;
  return {
    in: anim,
    out: ["fade", "slideUp"],
  };
}

function recommendImages(keywords) {
  const recommended = [];
  const usedUrls = new Set();

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

  if (recommended.length === 0) {
    recommended.push({
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
      alt: "Feature illustration",
      local: false,
    });
  }

  return recommended;
}

function extractKeywords(title, content) {
  const keywords = [];
  const text = `${title} ${content}`.toLowerCase();

  const keywordMap = {
    video: ["video", "playback", "player"],
    quiz: ["quiz", "question", "test"],
    forum: ["forum", "discussion", "comment"],
    zoom: ["zoom", "meeting"],
    library: ["library", "book", "document"],
    course: ["course", "learning", "education"],
    story: ["story", "social"],
    cart: ["cart", "shopping", "purchase"],
    home: ["home", "dashboard"],
    profile: ["profile", "user"],
    splash: ["splash", "loading"],
    comment: ["comment", "reply"],
    interaction: ["interaction", "reaction", "like"],
    refactoring: ["refactor", "migration", "restructure"],
    composable: ["composable", "hook", "utility"],
    security: ["security", "auth", "privilege"],
    performance: ["performance", "optimize", "speed"],
    ui: ["ui", "ux", "interface", "design"],
    typescript: ["typescript", "type", "schema"],
    bug: ["bug", "fix", "issue"],
  };

  for (const [key, terms] of Object.entries(keywordMap)) {
    if (terms.some((term) => text.includes(term))) {
      keywords.push(key);
    }
  }

  return keywords.length > 0 ? keywords : ["feature"];
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

function extractTasks(content) {
  const tasks = [];
  // Match tasks with emojis (✅, ⏳, etc.) and preserve them
  // Format: - ✅ **Title** - Description\n  - Detail 1\n  - Detail 2
  const taskRegex = /- ([✅⏳❌💡🚀⭐🎨🔒📱💻🌐])\s+\*\*([^\*]+)\*\*(?: - ([^\n]+))?(?:\n(?:  - [^\n]+(?:\n  - [^\n]+)*)?)*/g;
  let match;

  while ((match = taskRegex.exec(content)) !== null) {
    const emoji = match[1] || "✅";
    const taskTitle = match[2].trim();
    const description = match[3]?.trim();
    
    // Extract details (indented lines starting with -)
    const fullMatch = match[0];
    const details = fullMatch
      .split("\n")
      .slice(1) // Skip the first line (the task title line)
      .map((line) => {
        const trimmed = line.trim();
        // Match indented detail lines (starting with -)
        if (trimmed.startsWith("-")) {
          return trimmed.replace(/^-\s*/, "");
        }
        return null;
      })
      .filter((line) => line !== null && line.length > 0);

    tasks.push({
      emoji,
      title: taskTitle,
      details,
      description,
    });
  }

  return tasks;
}

function formatTasksAsHTML(tasks) {
  const html = tasks
    .map((task) => {
      const emojiClass = task.emoji === "✅" ? "text-green-400" : task.emoji === "⏳" ? "text-yellow-400" : "text-gray-400";
      
      let html = `
        <div class="mb-5 p-4 rounded-lg bg-white/5 dark:bg-gray-800/30 border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-start gap-3">
            <span class="text-2xl ${emojiClass} flex-shrink-0 mt-0.5">${task.emoji}</span>
            <div class="flex-1 min-w-0">
              <h4 class="text-base font-bold text-white dark:text-gray-100 mb-1 leading-tight">${escapeHtml(task.title)}</h4>
              ${task.description ? `<p class="text-sm text-gray-300 dark:text-gray-400 mb-2 leading-relaxed">${escapeHtml(task.description)}</p>` : ""}
              ${task.details.length > 0 ? `
                <ul class="ml-2 mt-2 space-y-1.5">
                  ${task.details.map((detail) => `
                    <li class="text-sm text-gray-200 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                      <span class="text-primary-400 mt-1.5 flex-shrink-0">•</span>
                      <span>${escapeHtml(detail)}</span>
                    </li>
                  `).join("")}
                </ul>
              ` : ""}
            </div>
          </div>
        </div>
      `;
      return html;
    })
    .join("");

  return `<div class="grid grid-cols-2 gap-4">${html}</div>`;
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function parseMarkdown(markdown) {
  animationIndex = 0;

  // Extract main wrapper data
  const handlerMatch = markdown.match(/\*\*Handler:\*\*\s*(.+)/);
  const periodMatch = markdown.match(/\*\*Period:\*\*\s*(.+)/);

  const handlerName = handlerMatch ? handlerMatch[1].trim() : "Vothana CHY";
  const period = periodMatch ? periodMatch[1].trim() : "October 1-31, 2025";
  const title = `October Task Report - ${period}`;

  const mainWrapper = {
    title,
    handler: {
      name: handlerName,
      avatar: "",
      role: "Developer",
    },
    teamLeader: {
      name: "Team Leader",
      avatar: "",
      role: "Team Leader",
    },
    period,
    statistics: {
      totalTasks: 0,
      completedTasks: 0,
      features: 13,
      refactorings: 7,
    },
  };

  const slides = [];

  // Intro card
  const introAnim = getNextAnimation();
  slides.push({
    title: `Welcome, ${handlerName}!`,
    subtitle: [`Monthly Report - ${period}`, "October 2025 Work Summary"],
    content: `
      <div class="text-center space-y-4">
        <p class="text-xl text-gray-700">This report showcases the comprehensive work completed during ${period}.</p>
        <div class="grid grid-cols-2 gap-4 mt-8">
          <div class="bg-primary/10 p-4 rounded-lg">
            <div class="text-3xl font-bold text-primary">13</div>
            <div class="text-sm text-gray-600">Features</div>
          </div>
          <div class="bg-primary/10 p-4 rounded-lg">
            <div class="text-3xl font-bold text-primary">7</div>
            <div class="text-sm text-gray-600">Types</div>
          </div>
        </div>
      </div>
    `,
    images: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        alt: "Welcome illustration",
        local: false,
      },
    ],
    imageAlignment: "right",
    imageContainerWidth: 40,
    animationIn: ["fade", "scale", "slideUp"],
    animationOut: ["fade", "slideUp"],
    pageIndex: 0,
    type: "Introduction",
  });

  // Parse Features section
  const featuresMatch = markdown.match(/## 🎯 By Feature([\s\S]*?)(?=## 🔧|$)/);
  if (featuresMatch) {
    const featuresContent = featuresMatch[1];
    // Split by feature number pattern: ### 1. Feature Name
    const featureBlocks = featuresContent.split(/### \d+\.\s+/).filter((block) => block.trim().length > 0);

    featureBlocks.forEach((block) => {
      const lines = block.split("\n");
      const titleMatch = lines[0]?.match(/^([^\n]+)/);
      if (!titleMatch) return;

      const featureTitle = titleMatch[1].trim();
      
      // Find Completed Tasks section
      let tasksStartIndex = -1;
      let tasksEndIndex = block.length;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("#### Completed Tasks")) {
          tasksStartIndex = i + 1;
          break;
        }
      }
      
      // Find where tasks section ends (next #### or ---)
      for (let i = tasksStartIndex; i < lines.length; i++) {
        if (lines[i].match(/^####/) || lines[i].match(/^---/)) {
          tasksEndIndex = i;
          break;
        }
      }

      if (tasksStartIndex > 0) {
        const tasksContent = lines.slice(tasksStartIndex, tasksEndIndex).join("\n");
        const statusMatch = block.match(/#### Status:\s*\*\*([^\*]+)\*\*/);
        
        const tasks = extractTasks(tasksContent);
        
        if (tasks.length > 0) {
          const chunks = chunkArray(tasks, 8);

          chunks.forEach((chunk, chunkIndex) => {
            const anim = getNextAnimation();
            const keywords = extractKeywords(featureTitle, tasksContent);
            const images = recommendImages(keywords);

            slides.push({
              title: chunkIndex === 0 ? featureTitle : `${featureTitle} (Continued)`,
              subtitle: statusMatch ? [`Status: ${statusMatch[1].trim()}`] : undefined,
              content: formatTasksAsHTML(chunk),
              images: images.length > 0 ? images : undefined,
              imageAlignment: "right",
              imageContainerWidth: images.length > 0 ? 35 : undefined,
              animationIn: anim.in,
              animationOut: anim.out,
              pageIndex: 0,
              type: "Feature",
            });
          });
        }
      }
    });
  }

  // Parse Types section
  const typesMatch = markdown.match(/## 🔧 By Type([\s\S]*?)(?=##|$)/);
  if (typesMatch) {
    const typesContent = typesMatch[1];
    const typeBlocks = typesContent.split(/### \d+\.\s+/).filter(Boolean);

    typeBlocks.forEach((block) => {
      const titleMatch = block.match(/^([^\n]+)/);
      if (!titleMatch) return;

      const typeTitle = titleMatch[1].trim();
      const sections = block.split(/####/).filter(Boolean);

      sections.forEach((section) => {
        const sectionTitleMatch = section.match(/^([^\n]+)/);
        if (!sectionTitleMatch) return;

        const sectionTitle = sectionTitleMatch[1].trim();
        const items = extractTasks(section);

        if (items.length > 0) {
          const chunks = chunkArray(items, 10);

          chunks.forEach((chunk, chunkIndex) => {
            const anim = getNextAnimation();
            const keywords = extractKeywords(typeTitle, section);
            const images = recommendImages(keywords);

            slides.push({
              title:
                chunkIndex === 0
                  ? `${typeTitle}: ${sectionTitle}`
                  : `${typeTitle}: ${sectionTitle} (Continued)`,
              content: formatTasksAsHTML(chunk),
              images: images.length > 0 ? images : undefined,
              imageAlignment: "left",
              imageContainerWidth: images.length > 0 ? 30 : undefined,
              animationIn: anim.in,
              animationOut: anim.out,
              pageIndex: 0,
              type: typeTitle,
            });
          });
        }
      });
    });
  }

  // Thank you card
  slides.push({
    title: "Thank You",
    subtitle: ["For Your Time and Review"],
    content: `
      <div class="text-center space-y-6">
        <p class="text-2xl text-gray-700">Thank you for reviewing this comprehensive report.</p>
        <p class="text-lg text-gray-600">Looking forward to continued collaboration and success.</p>
        <div class="mt-8 text-primary font-semibold">${new Date().getFullYear()} - E-School Cambodia</div>
      </div>
    `,
    images: [
      {
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
        alt: "Thank you illustration",
        local: false,
      },
    ],
    imageAlignment: "left",
    imageContainerWidth: 35,
    animationIn: ["fade", "scale"],
    animationOut: ["fade", "scale"],
    pageIndex: 0,
    type: "Closing",
  });

  // Update page indices
  slides.forEach((slide, index) => {
    slide.pageIndex = index;
  });

  return {
    mainWrapper,
    slides,
  };
}

// Read markdown file
const markdownPath = resolve(__dirname, "../docs/October_2025_Report.md");
const markdown = readFileSync(markdownPath, "utf-8");

// Parse and generate JSON
const reportData = parseMarkdown(markdown);

// Write JSON file
const outputPath = resolve(__dirname, "../src/data/octoberReport.json");
writeFileSync(outputPath, JSON.stringify(reportData, null, 2), "utf-8");

console.log("✅ Report data generated successfully!");
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Total slides: ${reportData.slides.length}`);

