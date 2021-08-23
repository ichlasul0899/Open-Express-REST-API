require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const multer  = require('multer')

const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
const port = 3000

app.use('/assets', express.static('assets')) // The reason is because by default the folder is not publicly accessible and you don't have a route that handles getting files from that url

const fileStorageEngine = multer.diskStorage({
    destination: (req,res,cb) => {
        cb(null, "./assets/images")
    },
    filename: (req,file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    }
})
const upload = multer({ storage: fileStorageEngine })


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth:{
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASSWORD
    }
})

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.post('/send', (req,res)=> {
    console.log('Sending email . . .')
    const { name, to, subject, text } = req.body

    const mailOptions = {
        from: process.env.MY_EMAIL,
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.status(400).json({
              message : 'Failed sending message!',
              description : error.response,
          })
        } else {
          console.log('Email sent: ' + info.response);
          res.status(200).json({
              message: 'Success sending message!',
              description: info.response,
          })
        }
      });
})

app.post('/upload_avatar', upload.single('avatar'), (req,res) => {
    console.log('Upload avatar . . .')
    try{
        console.log(req.file, req.body)
        res.status(200).json({
            message: 'Single file upload success',
            file: req.file,
        }) 
    } catch(error) {
        res.status(400).json({
            message: "Failed upload image",
            description: error.message
        })
    }
    
})

app.post('/upload_images', upload.array('images', 4), (req,res) => {
    console.log('Upload images . . .')
    try {
        console.log(req.files, req.body)
        let images = []
        req.files.forEach(image => {
            images.push(image)
        })
        res.status(201).json({
            msg: 'Files Uploaded Succesfully',
            files : images
        })
    } catch(error){
        res.status(400).json({
            message: "Failed upload files",
            description: error.message
        })
    }
})



app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})