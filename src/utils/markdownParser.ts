import { marked } from "marked";
import type { SlideCard, ReportData, MainWrapperData, AnimationType } from "@/data/types";
import { recommendImages } from "./imageUtils";

// Animation presets for variety
const animationPresets: AnimationType[][] = [
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

function getNextAnimation(): { in: AnimationType[]; out: AnimationType[] } {
  const anim = animationPresets[animationIndex % animationPresets.length];
  animationIndex++;
  return {
    in: anim,
    out: ["fade", "slideUp"], // Default out animation
  };
}

export function parseMarkdownToReportData(markdown: string): ReportData {
  // Reset animation index
  animationIndex = 0;

  // Extract main wrapper data
  const mainWrapper = extractMainWrapperData(markdown);

  // Parse sections
  const slides: SlideCard[] = [];

  // Add intro card
  slides.push(createIntroCard(mainWrapper));

  // Parse Features section
  const featureSlides = parseFeaturesSection(markdown);
  slides.push(...featureSlides);

  // Parse Types section
  const typeSlides = parseTypesSection(markdown);
  slides.push(...typeSlides);

  // Add thank you card
  const thankYouCard = createThankYouCard();
  thankYouCard.pageIndex = slides.length;
  slides.push(thankYouCard);

  // Update page indices
  slides.forEach((slide, index) => {
    slide.pageIndex = index;
  });

  return {
    mainWrapper,
    slides,
  };
}

function extractMainWrapperData(markdown: string): MainWrapperData {
  const handlerMatch = markdown.match(/\*\*Handler:\*\*\s*(.+)/);
  const periodMatch = markdown.match(/\*\*Period:\*\*\s*(.+)/);
  const statusMatch = markdown.match(/\*\*Status:\*\*\s*(.+)/);

  const handlerName = handlerMatch ? handlerMatch[1].trim() : "Handler Name";
  const period = periodMatch ? periodMatch[1].trim() : "October 2025";
  const title = `October Task Report - ${period}`;

  // Extract statistics
  const statsMatch = markdown.match(/### Task Completion Rate[\s\S]*?Done:\*\*\s*~?(\d+)%/);
  const donePercent = statsMatch ? parseInt(statsMatch[1]) : 70;

  return {
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
}

function parseFeaturesSection(markdown: string): SlideCard[] {
  const slides: SlideCard[] = [];
  const featuresMatch = markdown.match(/## 🎯 By Feature([\s\S]*?)(?=##|$)/);

  if (!featuresMatch) return slides;

  const featuresContent = featuresMatch[1];
  const featureBlocks = featuresContent.split(/### \d+\.\s+/).filter(Boolean);

  featureBlocks.forEach((block, index) => {
    const titleMatch = block.match(/^([^\n]+)/);
    if (!titleMatch) return;

    const featureTitle = titleMatch[1].trim();
    const tasksMatch = block.match(/#### Completed Tasks([\s\S]*?)(?=####|####|$)/);
    const statusMatch = block.match(/#### Status:\s*\*\*([^\*]+)\*\*/);

    if (tasksMatch) {
      const tasksContent = tasksMatch[1];
      const tasks = extractTasks(tasksContent);

      // Split tasks into chunks for 2-column layout
      const chunks = chunkArray(tasks, 8); // ~8 tasks per slide for 2 columns

      chunks.forEach((chunk, chunkIndex) => {
        const anim = getNextAnimation();
        const keywords = extractKeywords(featureTitle, tasksContent);
        const images = recommendImages(keywords);

        const slide: SlideCard = {
          title: chunkIndex === 0 ? featureTitle : `${featureTitle} (Continued)`,
          subtitle: statusMatch ? [`Status: ${statusMatch[1].trim()}`] : undefined,
          content: formatTasksAsHTML(chunk),
          images: images.length > 0 ? images : undefined,
          imageAlignment: "right",
          imageContainerWidth: images.length > 0 ? 35 : undefined,
          animationIn: anim.in,
          animationOut: anim.out,
          pageIndex: 0, // Will be updated
          type: "Feature",
        };

        slides.push(slide);
      });
    }
  });

  return slides;
}

function parseTypesSection(markdown: string): SlideCard[] {
  const slides: SlideCard[] = [];
  const typesMatch = markdown.match(/## 🔧 By Type([\s\S]*?)(?=##|$)/);

  if (!typesMatch) return slides;

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
      const items = extractListItems(section);

      if (items.length > 0) {
        const chunks = chunkArray(items, 10); // ~10 items per slide

        chunks.forEach((chunk, chunkIndex) => {
          const anim = getNextAnimation();
          const keywords = extractKeywords(typeTitle, section);
          const images = recommendImages(keywords);

          const slide: SlideCard = {
            title: chunkIndex === 0 ? `${typeTitle}: ${sectionTitle}` : `${typeTitle}: ${sectionTitle} (Continued)`,
            content: formatListItemsAsHTML(chunk),
            images: images.length > 0 ? images : undefined,
            imageAlignment: "left",
            imageContainerWidth: images.length > 0 ? 30 : undefined,
            animationIn: anim.in,
            animationOut: anim.out,
            pageIndex: 0, // Will be updated
            type: typeTitle,
          };

          slides.push(slide);
        });
      }
    });
  });

  return slides;
}

function extractTasks(content: string): Array<{ emoji: string; title: string; details: string[]; description?: string }> {
  const tasks: Array<{ emoji: string; title: string; details: string[]; description?: string }> = [];
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
      .filter((line): line is string => line !== null && line.length > 0);

    tasks.push({
      emoji,
      title: taskTitle,
      details,
      description,
    });
  }

  return tasks;
}

function extractListItems(content: string): Array<{ emoji: string; title: string; details: string[]; description?: string }> {
  const items: Array<{ emoji: string; title: string; details: string[]; description?: string }> = [];
  // Match items with emojis (✅, ⏳, etc.) and preserve them
  // Format: - ✅ **Title** - Description\n  - Detail 1\n  - Detail 2
  const itemRegex = /- ([✅⏳❌💡🚀⭐🎨🔒📱💻🌐])\s+\*\*([^\*]+)\*\*(?: - ([^\n]+))?(?:\n(?:  - [^\n]+(?:\n  - [^\n]+)*)?)*/g;
  let match;

  while ((match = itemRegex.exec(content)) !== null) {
    const emoji = match[1] || "✅";
    const itemTitle = match[2].trim();
    const description = match[3]?.trim();
    
    // Extract details (indented lines starting with -)
    const fullMatch = match[0];
    const details = fullMatch
      .split("\n")
      .slice(1) // Skip the first line (the item title line)
      .map((line) => {
        const trimmed = line.trim();
        // Match indented detail lines (starting with -)
        if (trimmed.startsWith("-")) {
          return trimmed.replace(/^-\s*/, "");
        }
        return null;
      })
      .filter((line): line is string => line !== null && line.length > 0);

    items.push({
      emoji,
      title: itemTitle,
      details,
      description,
    });
  }

  return items;
}

function formatTasksAsHTML(tasks: Array<{ emoji: string; title: string; details: string[]; description?: string }>): string {
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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatListItemsAsHTML(items: Array<{ emoji: string; title: string; details: string[]; description?: string }>): string {
  const html = items
    .map((item) => {
      const emojiClass = item.emoji === "✅" ? "text-green-400" : item.emoji === "⏳" ? "text-yellow-400" : "text-gray-400";
      
      let html = `
        <div class="mb-4 p-3 rounded-lg bg-white/5 dark:bg-gray-800/30 border border-white/10 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors">
          <div class="flex items-start gap-2.5">
            <span class="text-xl ${emojiClass} flex-shrink-0 mt-0.5">${item.emoji}</span>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-white dark:text-gray-100 mb-1 leading-tight">${escapeHtml(item.title)}</h4>
              ${item.description ? `<p class="text-xs text-gray-300 dark:text-gray-400 mb-1.5 leading-relaxed">${escapeHtml(item.description)}</p>` : ""}
              ${item.details.length > 0 ? `
                <ul class="ml-1.5 mt-1.5 space-y-1">
                  ${item.details.map((detail) => `
                    <li class="text-xs text-gray-200 dark:text-gray-300 leading-relaxed flex items-start gap-2">
                      <span class="text-primary-400 mt-1 flex-shrink-0">•</span>
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

  return `<div class="space-y-2">${html}</div>`;
}

function extractKeywords(title: string, content: string): string[] {
  const keywords: string[] = [];
  const text = `${title} ${content}`.toLowerCase();

  const keywordMap: Record<string, string[]> = {
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

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function createIntroCard(data: MainWrapperData): SlideCard {
  const anim = getNextAnimation();
  return {
    title: `Welcome, ${data.handler.name}!`,
    subtitle: [`Monthly Report - ${data.period}`, "October 2025 Work Summary"],
    content: `
      <div class="text-center space-y-4">
        <p class="text-xl text-gray-700">This report showcases the comprehensive work completed during ${data.period}.</p>
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
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
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
  };
}

export function createThankYouCard(): SlideCard {
  return {
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
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
        alt: "Thank you illustration",
        local: false,
      },
    ],
    imageAlignment: "left",
    imageContainerWidth: 35,
    animationIn: ["fade", "scale"],
    animationOut: ["fade", "scale"],
    pageIndex: -1,
    type: "Closing",
  };
}
