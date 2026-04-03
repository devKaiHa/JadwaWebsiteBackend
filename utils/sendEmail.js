const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.judyinvest.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@judyinvest.com",
    pass: ")!hZdz=;5N?x",
  },
});

const sendEmail = async (options) => {
  try {
    const mailOpts = {
      from: `"JadwaInvest" <no-reply@judyinvest.com>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
    };

    //3-Send email
    await transporter.sendMail(mailOpts);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
