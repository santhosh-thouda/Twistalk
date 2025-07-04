// UploadRoute.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import UserModel from '../Models/userModel.js';

const router = express.Router();

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ POST route: for feed post image upload
router.post('/', upload.single("file"), (req, res) => {
  try {
    return res.status(200).json({ filename: req.file.filename });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Upload failed");
  }
});

// ✅ PUT route: for profile or cover image update
router.put('/:id/update-image', upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'profilePicture' or 'coverPicture'

  if (!req.file || !['profilePicture', 'coverPicture'].includes(type)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldFile = user[type];
    const newFile = req.file.filename;

    user[type] = newFile;
    await user.save();

    // Delete old file
    if (oldFile && fs.existsSync(`public/images/${oldFile}`)) {
      fs.unlinkSync(`public/images/${oldFile}`);
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating image:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
