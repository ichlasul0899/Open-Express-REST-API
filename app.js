require('dotenv').config()
const express = require('express')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
const port = 3000

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
    res.send("Hello Iklas!")
    
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

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})