const express = require('express');
const multer = require('multer');
const mkdirp = require('mkdirp');
const sharp = require('sharp');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const app = express();

const PORT = 3000;
const UPLOAD_PATH = path.join(__dirname, '/uploads');

mkdirp.sync(path.join(__dirname, '/uploads'));

const storage = multer.diskStorage({
    destination: (req, file, done) => {
        done(null, UPLOAD_PATH);
    },
    filename: (req, file, done) => {
        done(null, uuid() + '___' + file.originalname);
    },
});

const limits = {
    fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, done) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        done(null, true);
    } else {
        done(new Error('file type not supported'), false);
    }
};

const upload = multer({ storage, limits, fileFilter }).single('image');

app.post('/file-upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        try {
            const { file } = req;
            if (!file) {
                return res.status(400).json({ success: false, message: 'file not supplied' });
            }
            const newFilePath = path.join(UPLOAD_PATH, uuid() + '_' + file.originalname);
            // save newFilePath in your db as image path
            await sharp(file.path).resize().jpeg({ quality: 50 }).toFile(newFilePath);
            fs.unlinkSync(file.path);

            return res.status(200).json({ success: true, message: 'image uploaded' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    });
});

app.listen(PORT, () => {
    console.log(chalk.bold.yellow('server is running on port ', PORT));
});