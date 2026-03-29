const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this folder exists in your backend root
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // THE FIX: Add a random number to the timestamp so files never overwrite each other
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Example output: 1690000000000-123456789.jpg
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// (Optional) Add a file filter to only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs only!');
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

module.exports = upload;