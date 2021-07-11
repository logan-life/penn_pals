const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const maxSize = 1024 * 1024;

aws.config.update({
  secretAccessKey: "ENTER HERE",
  accessKeyId: "ENTER HERE",
  region: "ENTER HERE", // region of your bucket
});
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "pennpalsstatus",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== "image/png" &&
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/gif"
    ) {
      req.fileValidationError = "Only PNG, GIF and JPEG files allowed";
      return cb(null, false, new Error("File type"));
    }
    cb(null, true);
  },
});
module.exports = upload;
