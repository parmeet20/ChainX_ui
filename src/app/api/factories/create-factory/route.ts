import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, message } = await request.json();

  if (!email || !message) {
    return NextResponse.json({ message: "Email and message are required." }, { status: 400 });
  }

  // Parse message to extract factory details
  let factoryName = "";
  let description = "";
  let latitude = "";
  let longitude = "";
  let contactInfo = "";
  let transactionSignature = "";

  message.split("\n").forEach((line: string) => {
    const [key, value] = line.split(": ").map((s) => s.trim());
    if (key === "Factory Name") factoryName = value;
    if (key === "Description") description = value;
    if (key === "Location") {
      const coords = value.match(/\((\-?\d+\.?\d*),\s*(\-?\d+\.?\d*)\)/);
      if (coords) {
        latitude = coords[1];
        longitude = coords[2];
      }
    }
    if (key === "Contact") contactInfo = value;
    if (key === "Transaction Signature") transactionSignature = value;
  });

  // Validate required fields
  if (!factoryName || !latitude || !longitude || !transactionSignature) {
    return NextResponse.json({ message: "Invalid message format." }, { status: 400 });
  }

  // Generate Google Maps link
  const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

  // Modern HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factory Created Successfully</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #1f2937; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Factory Created Successfully</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">Congratulations! Your new factory has been successfully registered on ChainX.</p>
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 20px;">Factory Details</h2>
            <table style="width: 100%; margin-top: 10px;">
              <tr>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;"><strong>Name:</strong></td>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;">${factoryName}</td>
              </tr>
              <tr>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;"><strong>Description:</strong></td>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;">${description || "N/A"}</td>
              </tr>
              <tr>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;"><strong>Location:</strong></td>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;">(${latitude}, ${longitude})</td>
              </tr>
              <tr>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;"><strong>Contact:</strong></td>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;">${contactInfo || "N/A"}</td>
              </tr>
              <tr>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;"><strong>Transaction:</strong></td>
                <td style="color: #374151; font-size: 14px; padding: 8px 0;">
                  <a href="https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet" style="color: #3b82f6; text-decoration: none;">View Transaction</a>
                </td>
              </tr>
            </table>
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 20px;">Factory Location</h2>
            <p style="margin-top: 10px;">
              <a href="${mapLink}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">View Factory Location on Google Maps</a>
            </p>
            <p style="color: #374151; font-size: 14px; margin-top: 20px; text-align: center;">
              Thank you for using ChainX. For support, contact us at <a href="mailto:support@chainx.com" style="color: #3b82f6; text-decoration: none;">support@chainx.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; text-align: center; background-color: #f4f4f4; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2025 ChainX. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Email details
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Your New Factory Created Successfully On ChainX (${factoryName})`,
      text: message, // Fallback for clients that don't support HTML
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error sending email." }, { status: 500 });
  }
}