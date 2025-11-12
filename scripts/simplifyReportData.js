import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the existing JSON
const reportPath = path.join(__dirname, '../src/data/octoberReport.json');
const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Helper function to parse HTML content and convert to simplified structure
function parseContent(htmlContent, slideType) {
  if (!htmlContent || htmlContent.trim() === '') {
    return '';
  }

  // Check if it's stats content (intro slide)
  if (slideType === 'Introduction') {
    const statsMatch = htmlContent.match(/<div class="text-3xl font-bold text-primary">(\d+)<\/div>\s*<div class="text-sm text-gray-600">([^<]+)<\/div>/g);
    if (statsMatch) {
      const stats = [];
      const textMatch = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/);
      
      statsMatch.forEach(match => {
        const valueMatch = match.match(/>(\d+)</);
        const labelMatch = match.match(/text-gray-600">([^<]+)</);
        if (valueMatch && labelMatch) {
          stats.push({ value: valueMatch[1], label: labelMatch[1] });
        }
      });
      
      if (stats.length > 0) {
        return {
          type: 'stats',
          text: textMatch ? textMatch[1].trim() : undefined,
          stats
        };
      }
    }
  }

  // Check if it's items content (feature slides)
  const itemsMatch = htmlContent.match(/<div class="mb-5[^"]*">[\s\S]*?<\/div>/g);
  if (itemsMatch && itemsMatch.length > 0) {
    const items = [];
    
    itemsMatch.forEach(itemHtml => {
      // Extract status icon
      let status = 'done';
      if (itemHtml.includes('text-yellow-400')) {
        status = 'todo';
      } else if (itemHtml.includes('text-green-400')) {
        status = 'done';
      }
      
      // Extract title
      const titleMatch = itemHtml.match(/<h4[^>]*>([^<]+)<\/h4>/);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract description
      const descMatch = itemHtml.match(/<p class="text-sm[^>]*>([^<]+)<\/p>/);
      const description = descMatch ? descMatch[1].trim() : undefined;
      
      // Extract bullet points
      const points = [];
      const pointMatches = itemHtml.matchAll(/<li[^>]*>\s*<span[^>]*>•<\/span>\s*<span>([^<]+)<\/span>\s*<\/li>/g);
      for (const match of pointMatches) {
        points.push(match[1].trim());
      }
      
      if (title) {
        items.push({
          status,
          title,
          description: description || undefined,
          points: points.length > 0 ? points : undefined
        });
      }
    });
    
    if (items.length > 0) {
      return items;
    }
  }

  // Check if it's simple text (closing slide)
  const textMatch = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/g);
  if (textMatch && textMatch.length > 0 && !htmlContent.includes('grid')) {
    const texts = textMatch.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t);
    return texts.join('\n\n');
  }

  // Fallback: return as simple text
  return htmlContent.replace(/<[^>]+>/g, '').trim();
}

// Convert all slides
reportData.slides = reportData.slides.map(slide => {
  const simplifiedContent = parseContent(slide.content, slide.type);
  return {
    ...slide,
    content: simplifiedContent
  };
});

// Write the simplified JSON
const outputPath = path.join(__dirname, '../src/data/octoberReport.json');
fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf-8');

console.log('✅ Simplified report data successfully!');
console.log(`📝 Converted ${reportData.slides.length} slides`);

