const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const { google } = require('googleapis');
const { oAuth2Client } = require('./googleDriveAuth');
const token = require('./token.json');
oAuth2Client.setCredentials(token);
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

const app = express();
const PORT = 3000;
// const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use(express.json({ limit: '10mb' }));
// Serve uploaded images statically
// app.use('/uploads', express.static(UPLOAD_DIR));
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081'); // Or '*' for any origin
    res.setHeader('Access-Control-Allow-Methods', 'POST'); // Add methods you need
    next();
});


// // Ensure the upload directory exists
// if (!fs.existsSync(UPLOAD_DIR)) {
//     fs.mkdirSync(UPLOAD_DIR);
// }

// // Configure multer
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, UPLOAD_DIR);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//     }
// });

const upload = multer({ dest: 'uploads/' }); // Temporary storage

app.post('/upload-image', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    // Extract base64 part
    const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Malformed base64 data' });
    }

    const ext = matches[1]; // png / jpeg
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to temp file
    const filename = `temp-${Date.now()}.${ext}`;
    const filepath = path.join(__dirname, 'uploads', filename);
    fs.writeFileSync(filepath, buffer);

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: `image/${ext}`,
        parents: ["1fFuseeIMS84Y0qgdWBM_HzBDcg__wp_W"] // Optional: FolderID
      },
      media: {
        mimeType: `image/${ext}`,
        body: fs.createReadStream(filepath),
      },
    });

    // Optional: Make file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const result = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink',
    });

    // Delete local temp file
    fs.unlinkSync(filepath);

    res.json({ link: result.data.webViewLink });

  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
