const fs = require('fs');
const path = require('path');

const srcImage = '/Users/023s/.gemini/antigravity/brain/9e966de1-b165-4a4b-a09a-2d448b976fc9/tech_blog_banner_1770313471912.png';
const destinations = [
    'src/content/blog/first-post/banner.png',
    'src/content/blog/demo-features/banner.png'
];

const fallbackBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function copyOrGenerate(dest) {
    try {
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        if (fs.existsSync(srcImage)) {
            fs.copyFileSync(srcImage, dest);
            console.log(`Copied real image to ${dest}`);
        } else {
            console.log(`Source image not found, generating fallback for ${dest}`);
            fs.writeFileSync(dest, Buffer.from(fallbackBase64, 'base64'));
        }
    } catch (e) {
        console.error(`Error processing ${dest}:`, e);
        // Try fallback if copy failed
        try {
            fs.writeFileSync(dest, Buffer.from(fallbackBase64, 'base64'));
            console.log(`Created fallback for ${dest} after error`);
        } catch (e2) {
            console.error('Fatal error:', e2);
        }
    }
}

destinations.forEach(copyOrGenerate);
