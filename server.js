const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(express.json({ limit: '10mb' }));
// Serve uploaded images statically
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081'); // Or '*' for any origin
    res.setHeader('Access-Control-Allow-Methods', 'POST'); // Add methods you need
    next();
});


// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Endpoint for uploading a single image
app.post('/upload-image', (req, res) => {
    const { image } = req.body;

    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }
  
    // Extract image type and base64 data
    const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Malformed base64 data' });
    }
  
    const ext = matches[1]; // e.g., 'png', 'jpeg'
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
  
    const filename = `upload-${Date.now()}.${ext}`;
    const filepath = path.join(__dirname, 'uploads', filename);
  
    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).json({ error: 'Failed to save image' });
      }
  
      res.status(200).json({ message: 'Image saved', filename });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`UploadDir: ${UPLOAD_DIR}`)
});
