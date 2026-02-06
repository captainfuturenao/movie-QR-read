const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

// Configuration
const PORT = 3000;
const OUT_DIR = path.join(__dirname, 'out');
const VIDEO_FILE = path.join(OUT_DIR, 'video.mp4');
const HTML_FILE = path.join(OUT_DIR, 'index.html');
const QR_FILE = path.join(OUT_DIR, 'video_qr.png');

// Get Local IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIP();
// URL points to the web page now, not the MP4
const url = `http://${ip}:${PORT}/`;

// Ensure existance
if (!fs.existsSync(VIDEO_FILE)) {
    console.error(`Video file not found at ${VIDEO_FILE}. Run 'npm run build' first.`);
    process.exit(1);
}

// Generate QR
QRCode.toFile(QR_FILE, url, {
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    },
    width: 300
}, function (err) {
    if (err) throw err;
    console.log(`QR Code generated at: ${QR_FILE}`);
    console.log(`URL encoded: ${url}`);
});

// Start Server
const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);

    if (req.url === '/') {
        // Serve HTML
        if (fs.existsSync(HTML_FILE)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream(HTML_FILE).pipe(res);
        } else {
            res.writeHead(404);
            res.end("index.html not found");
        }
    } else if (req.url === '/video.mp4') {
        // Serve Video
        const stat = fs.statSync(VIDEO_FILE);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(VIDEO_FILE, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(VIDEO_FILE).pipe(res);
        }
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at ${url}`);
    console.log(`Use the QR code in 'out/video_qr.png' to access it.`);
    console.log(`Press Ctrl+C to stop.`);
});
