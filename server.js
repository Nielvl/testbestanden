const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configureer multer voor bestandsopslag
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Serveer statische bestanden
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Route voor het uploaden van foto's
app.post('/upload', upload.single('photo'), (req, res) => {
    if (req.file) {
        res.json({ location: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).send('No file uploaded.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});