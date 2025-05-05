import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email, name, description, contactInfo } = await request.json();
    
    if (!email || !name || !contactInfo) {
        return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // Modern slate black and white themed email template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Seller Registration</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #1a1a1a;
                    color: #ffffff;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 30px;
                    color: #333;
                }
                .content h2 {
                    color: #1a1a1a;
                    margin-top: 0;
                }
                .details {
                    background-color: #f5f5f5;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .detail-row {
                    display: flex;
                    margin-bottom: 10px;
                }
                .detail-label {
                    font-weight: 600;
                    color: #1a1a1a;
                    width: 150px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #666;
                    background-color: #f5f5f5;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #1a1a1a;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 600;
                    margin-top: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ffffff;
                    margin-bottom: 10px;
                }
                .description {
                    white-space: pre-wrap;
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 4px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">ChainX</div>
                    <h1>New Seller Registration Confirmation</h1>
                </div>
                
                <div class="content">
                    <h2>Welcome to ChainX Marketplace</h2>
                    <p>Your seller account has been successfully registered on ChainX. Here are your account details:</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <div class="detail-label">Seller Name:</div>
                            <div>${name}</div>
                        </div>
                        ${description ? `
                        <div class="detail-row">
                            <div class="detail-label">Business Description:</div>
                            <div class="description">${description}</div>
                        </div>
                        ` : ''}
                        <div class="detail-row">
                            <div class="detail-label">Contact Information:</div>
                            <div>${contactInfo}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Registered Email:</div>
                            <div>${email}</div>
                        </div>
                    </div>
                    
                    <p>You can now start listing your products and managing your inventory through the ChainX platform.</p>
                    
                    <p>If you have any questions or need assistance setting up your seller account, please contact our support team.</p>
                    
                    <a href="https://your-chainx-app.com/seller-dashboard" class="button">Access Seller Dashboard</a>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} ChainX. All rights reserved.</p>
                    <p>This is an automated message, please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email details
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: `Your Seller Account "${name}" Has Been Successfully Registered`,
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Confirmation email sent successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to send confirmation email." }, { status: 500 });
    }
}