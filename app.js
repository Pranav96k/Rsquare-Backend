const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage: storage,
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "apiKey.json",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    const file = req.file;

    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: ['1mpXSrqzJP_h7KMKyy_GN0Eb2_eOwW69x'], // Address of directory where the file is stored
      },
      media: {
        body: fs.createReadStream(file.path),
      },
    });

    res.json({ file: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error uploading file");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(5000, () => {
  console.log("App listening on port 5000!"); // Corrected port number
});
