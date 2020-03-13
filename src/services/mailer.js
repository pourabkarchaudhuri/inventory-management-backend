const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("Sender ID : ", process.env.MAILER_ID);

class mailer{
  
    constructor(){
  
        console.log("Intializing mailer service")
  
    }
  
    Sendmail(receivers,ccReceivers,msg,sub,callback){
  
        var transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                    user: process.env.MAILER_ID,
                    pass: process.env.MAILER_PASSWORD,
                }
            });
  
        let mailOptions = {
            from: '"DEVICE MANAGER" <'+ process.env.MAILER_ID +'>', 
            to: receivers, 
            subject: sub, 
            cc:ccReceivers,
            html:msg,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("ERROR: " + error);
            console.log(`Error sending mail to ${receivers}`+error);
            callback(error,null)
            
            }else{
                console.log(`Mail sent to ${receivers}`+ info.messageId+ " " + info.response);
                callback(null,info)
                
            }
        });
          
  
    }
  
}
  
module.exports = mailer;
