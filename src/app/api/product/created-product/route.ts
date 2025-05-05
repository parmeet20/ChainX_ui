import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email, message, productName, imageUrl } = await request.json();

    if (!email || !message || !productName || !imageUrl) {
        return NextResponse.json(
            { message: "Email, message, product name, and image URL are required." },
            { status: 400 }
        );
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        // Modern HTML email template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Product Created</title>
            <style>
                body {
                    font-family: 'Roboto', sans-serif;
                    background: #FFFFFF;
                    color: #000000;
                    }
                    .section-dark {
                    background: #000000;
                    color: #FFFFFF;
                    }
                    .button {
                    background: #000000;
                    color: #FFFFFF;
                    padding: 10px 20px;
                    border: none;
                    transition: background 0.3s;
                    }
                    .button:hover {
                    background: #FFFFFF;
                    color: #000000;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Product Created Successfully</h1>
                    <p>ChainX Manufacturing Platform</p>
                </div>
                
                <div class="details">
                    <h2>${productName}</h2>
                    <img src="${imageUrl}" alt="${productName}" class="product-image">
                    <p>${message}</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} ChainX. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email details
        const mailOptions = {
            from: `ChainX Platform <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `New Product Created: ${productName}`,
            html: htmlTemplate,
            text: `New Product Created: ${productName}\n\n${message}\n\nProduct Image: ${imageUrl}`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to send email." },
            { status: 500 }
        );
    }
}