import Config from '../utils/Config.js';
import Mailjet from 'node-mailjet';

export default function sendMail(recepient, templateID, variables) {
    const mailjet = new Mailjet({
        apiKey: Config.mjApiKey,
        apiSecret: Config.mjSecret
      });
    const request = mailjet
        .post("send", { version: 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: Config.mjEmail,
                        Name: "Hewlett Packard Enterprise"
                    },
                    To: [
                        {
                            Email: recepient,
                            Name: "Customer"
                        }
                    ],
                    TemplateID: templateID,
                    TemplateLanguage: true,
                    Subject: "HPE Support Case "+variables.ticket_number,
                    Variables: variables
                }
            ]
        });
    return request;
}