const nodemailer = require('nodemailer');
require('dotenv').config()

    Sendmail(receivers,ccReceivers,msg,sub,callback){
 
        var transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                    user: process.env.MAILER_ID,
                    pass: process.env.MAILER_PASSWORD,
                }
            });
 
        let mailOptions = {
            from: '"Inventory Engine Service"', 
            to: receivers, 
            subject: sub, 
            cc:'lohitkumarb@hexaware.com',
            html:msg,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("ERROR: " + error);
            // logger.error(`Error sending mail to ${receivers}`+error);
            callback(error,null)
            
            }else{
                // logger.info(`Mail sent to ${receivers}`+ info.messageId+ " " + info.response);
                callback(null,info)
                
            }
        });
          
 
    }