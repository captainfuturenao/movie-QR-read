const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Arguments: node automate.js <video_path> <target_url> [duration_sec]
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: node automate.js <video_path> <target_url> [duration_sec]");
    console.error("Example: node automate.js \"C:/path/to/movie.mov\" \"https://google.com\" 30");
    process.exit(1);
}

const sourceVideoPath = args[0];
const targetUrl = args[1];
const durationSec = args[2] ? parseInt(args[2]) : 30;

const projectDir = __dirname;
const publicDir = path.join(projectDir, 'public');
const srcDir = path.join(projectDir, 'src');
const outDir = path.join(projectDir, 'out');

// 1. Copy Video to Standard Name
console.log("--> Setting up video file...");
const standardVideoName = "input_video" + path.extname(sourceVideoPath);
const destVideoPath = path.join(publicDir, standardVideoName);

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
fs.copyFileSync(sourceVideoPath, destVideoPath);
console.log(`    Copied ${sourceVideoPath} to ${destVideoPath}`);

// 2. Update Composition.tsx
console.log("--> Updating Composition.tsx...");
const compPath = path.join(srcDir, 'Composition.tsx');
let compContent = fs.readFileSync(compPath, 'utf8');
compContent = compContent.replace(/src={staticFile\(".*?"\)}/g, `src={staticFile("${standardVideoName}")}`);
compContent = compContent.replace(/value="https?:\/\/[^"]+"/g, `value="${targetUrl}"`);
fs.writeFileSync(compPath, compContent);

// 3. Update Root.tsx
console.log("--> Updating Root.tsx...");
const rootPath = path.join(srcDir, 'Root.tsx');
let rootContent = fs.readFileSync(rootPath, 'utf8');
const frames = durationSec * 30;
rootContent = rootContent.replace(/durationInFrames={\d+}/, `durationInFrames={${frames}}`);
fs.writeFileSync(rootPath, rootContent);

// 4. Update index.html
console.log("--> Updating output HTML...");
const htmlPath = path.join(outDir, 'index.html');
if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace(/href="https?:\/\/[^"]+"/g, `href="${targetUrl}"`);
    fs.writeFileSync(htmlPath, htmlContent);
}

// 5. Build Video
console.log("--> Rendering video (this may take a while)...");
try {
    execSync(`npx remotion render src/index.ts MyComp out/video.mp4 --overwrite`, { stdio: 'inherit', cwd: projectDir });
} catch (e) {
    console.error("Build failed.");
    process.exit(1);
}

// 6. Upload to Cloud (Git Push)
console.log("--> Uploading to Cloud (GitHub/Vercel)...");
try {
    execSync(`git add .`, { stdio: 'inherit', cwd: projectDir });
    try {
        execSync(`git commit -m "Update video: ${new Date().toISOString()}"`, { stdio: 'inherit', cwd: projectDir });
    } catch (e) {
        console.log("    (Nothing to commit)");
    }
    execSync(`git push`, { stdio: 'inherit', cwd: projectDir });
    console.log("--> Upload Complete!");
    console.log("    Your changes will be live on Vercel in a few minutes.");
} catch (e) {
    console.error("Upload failed. You may need to run 'git push' manually.");
}

// 7. Start Local Server
console.log("--> Starting local server for check...");
console.log("    Press Ctrl+C to stop.");
require('./share-video.js');
