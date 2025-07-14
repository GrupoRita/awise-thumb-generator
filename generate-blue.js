const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Function to normalize string for filename
function normalizeFilename(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Function to generate HTML with custom text
function generateHTML(text) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thumbnail - ${text}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }

        .thumbnail {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .bg-element {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        }

        .bg-element-1 {
            width: 200px;
            height: 200px;
            top: -100px;
            right: -100px;
        }

        .bg-element-2 {
            width: 150px;
            height: 150px;
            bottom: -75px;
            left: -75px;
        }

        .icon-container {
            width: 120px;
            height: 120px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            animation: pulse 3s ease-in-out infinite;
        }

        .heart-icon {
            width: 60px;
            height: 60px;
        }

        .heart-icon svg {
            width: 100%;
            height: 100%;
            fill: #E91E63;
        }

        .text-container {
            text-align: center;
            position: relative;
            z-index: 1;
            padding: 0 40px;
        }

        .title {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            line-height: 1.2;
        }

        .logo {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 20px;
            font-weight: 300;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .logo-wave {
            width: 20px;
            height: 15px;
            position: relative;
            overflow: hidden;
        }

        .logo-wave::before {
            content: '';
            position: absolute;
            width: 40px;
            height: 40px;
            border: 2px solid rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            top: -10px;
            left: -15px;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="thumbnail">
        <div class="bg-element bg-element-1"></div>
        <div class="bg-element bg-element-2"></div>

        <div class="icon-container">
            <div class="heart-icon">
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                </svg>
            </div>
        </div>

        <div class="text-container">
            <h2 class="title">${text}</h2>
        </div>

        <div class="logo">
            RITA
            <div class="logo-wave"></div>
        </div>
    </div>
</body>
</html>`;
}

// Main function
async function generateThumbnail(text) {
  let browser;

  try {
    // Get text from command line or use default
    const thumbnailText = text || process.argv[2] || 'Doações Pontuais';
    const filename = normalizeFilename(thumbnailText) + '.png';

    console.log(`🎨 Generating thumbnail for: "${thumbnailText}"`);
    console.log(`📁 Output filename: ${filename}`);

    // Generate HTML content
    const htmlContent = generateHTML(thumbnailText);

    // Create temporary HTML file
    const tempHtmlPath = path.join(__dirname, 'temp-thumbnail.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);

    // Launch browser
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage();

    // Load the HTML
    await page.goto(`file://${tempHtmlPath}`, {
      waitUntil: 'networkidle'
    });

    // Set viewport
    await page.setViewportSize({ width: 420, height: 420 });

    // Wait for element
    await page.locator('.thumbnail').waitFor({ state: 'visible' });
    await page.waitForTimeout(500); // Extra wait for animations

    // Capture screenshot
    await page.locator('.thumbnail').screenshot({
      path: filename,
      omitBackground: true,
      animations: 'disabled'
    });

    // Clean up temp file
    fs.unlinkSync(tempHtmlPath);

    console.log(`✅ Success! Thumbnail saved as: ${filename}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly from command line
if (require.main === module) {
  generateThumbnail();
}

// Export for use as module
module.exports = { generateThumbnail, normalizeFilename };