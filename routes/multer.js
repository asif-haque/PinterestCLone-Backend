const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now();
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
