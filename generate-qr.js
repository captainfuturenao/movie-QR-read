const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'out');
const QR_FILE = path.join(OUT_DIR, 'video_qr.png');
const URL = 'https://movie-qr-read.vercel.app/';

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

QRCode.toFile(QR_FILE, URL, {
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    },
    width: 300
}, function (err) {
    if (err) throw err;
    console.log(`QR Code generated at: ${QR_FILE}`);
});
