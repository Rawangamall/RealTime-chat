const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'Files'));
  },
  filename: async function (req, file, cb) {

    const fileExtension = path.extname(file.originalname); 
    const fileName = path.basename(file.originalname, fileExtension); 

    const currentDate = new Date().toISOString().replace(/:/g, '-');
    const modifiedFileName = `${fileName}_${currentDate}${fileExtension}`;
    req.filename = modifiedFileName
    cb(null, modifiedFileName);
  }
});

const uploadFile = multer({ storage: storage }).single('file');

exports.uploadFile = uploadFile;

