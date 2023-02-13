var nodemailer = require('nodemailer');
module.exports = {
    mail_header: nodemailer.createTransport({
        host: "mail.daydonghodathat.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'no-reply@daydonghodathat.com',
            pass: '}mu8LK.c7HbO'
        }
    }),
}