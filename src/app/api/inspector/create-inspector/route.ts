import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { email, name, inspectionOutcome, notes, fee } = await request.json();
    
    if (!email || !name || !inspectionOutcome || !fee) {
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
            <title>Product Inspection Completed</title>
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
                    width: 180px;
                }
                .outcome {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    margin-left: 5px;
                }
                .pass {
                    background-color: #e6f7e6;
                    color: #2e7d32;
                }
                .fail {
                    background-color: #ffebee;
                    color: #c62828;
                }
                .pending {
                    background-color: #fff8e1;
                    color: #f9a825;
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
                .notes {
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
                    <h1>Product Inspection Report</h1>
                </div>
                
                <div class="content">
                    <h2>Inspection Details Submitted</h2>
                    <p>A new product inspection has been completed and recorded on the blockchain.</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <div class="detail-label">Inspection Name:</div>
                            <div>${name}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Inspection Outcome:</div>
                            <div>
                                ${inspectionOutcome.replace(/_/g, " ")}
                                <span class="outcome ${inspectionOutcome.toLowerCase()}">
                                    ${inspectionOutcome}
                                </span>
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Inspection Fee:</div>
                            <div>$${fee} per product</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Inspector Email:</div>
                            <div>${email}</div>
                        </div>
                        ${notes ? `
                        <div class="detail-row">
                            <div class="detail-label">Inspection Notes:</div>
                            <div class="notes">${notes}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <p>This inspection has been permanently recorded on the ChainX blockchain network.</p>
                    
                    <p>If you have any questions about this inspection, please contact our support team.</p>
                    
                    <a href="https://your-chainx-app.com/dashboard" class="button">View Inspection Details</a>
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
            subject: `Product Inspection Completed: ${name} - ${inspectionOutcome}`,
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Inspection report sent successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to send inspection report." }, { status: 500 });
    }
}