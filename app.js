const express = require('express')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')
const twilio = require('twilio');

const port = 3000

const accountSid = process.env.twilio_account_id;
const authToken = process.env.twilio_auth_token;
const twilioClient = new twilio(accountSid, authToken);


const multer  = require('multer')
const s3 = new aws.S3({ accessKeyId: process.env.aws_access_key, secretAccessKey: process.env.aws_secret, region: 'ap-south-1' })
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.bucket_name,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    })
})


const app = express()
 

app.post('/', upload.single('screen'), function (req, res, next) {
    twilioClient.messages.create({
        body: `Intruder detected. Check here ${req.file.location}`,
        to: process.env.twilio_to,
        from: process.env.twilio_to
    })
    .then(
        (message) => console.log(message.sid)
        );
    res.send('User will be notified')
})

module.exports = app