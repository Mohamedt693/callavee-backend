import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);


export const sendVerificationEmail = async (email, otp) => {
    try {
        const data = await resend.emails.send({
            from: 'CallaVee <admin@callavee.com>', 
            to: [email],
            subject: 'Verify your account',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h2 style="color: #333;">Welcome to Our Community!</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p style="color: #555; font-size: 16px;">Hello there,</p>
                        <p style="color: #555; font-size: 16px;">Thank you for joining us. To complete your registration and keep your account secure, please use the following verification code:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; background: #e7f1ff; padding: 15px 30px; border-radius: 8px;">
                                ${otp}
                            </span>
                        </div>
                        
                        <p style="color: #888; font-size: 14px;">This code will expire in <strong>10 minutes</strong>. If you did not create an account, you can safely ignore this email.</p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
                        &copy; ${new Date().getFullYear()} CallaVee. All rights reserved.
                    </div>
                </div>
            `,
        });

        console.log("OTP Email sent successfully:", data);
        return true;
    } catch (error) {
        console.error("Resend Error:", error);
        throw new Error("Failed to send verification email");
    }
}

export const sendPriceDropNotification = async (email, product, newPrice) => {
    try {
        const discount = Math.round(((product.currentPrice - newPrice) / product.currentPrice) * 100);
        
        const data = await resend.emails.send({
            from: 'Price Tracker <info@callavee.com>',
            to: [email],
            subject: `Price Drop Alert: ${product.title}`,
            html: `
                <div style="font-family: sans-serif;">
                    <h1>Great News!</h1>
                    <p>The product <strong>${product.title}</strong> you are watching has dropped in price.</p>
                    <p style="font-size: 18px;">Current Price: <strong>$${newPrice}</strong></p>
                    <p>You saved: <strong>${discount}%</strong> off the previous price!</p>
                    <a href="${product.amazonLink}" style="background: #28a745; color: white; padding: 10px; text-decoration: none;">Buy Now</a>
                </div>
            `,
        });
        console.log("Resend Price Drop Notification Success:", data);
        return true;
    } catch (error) {
        console.error("Resend Price Drop Error:", error);
        throw error;
    }
};


export const sendWelcomeEmail = async (email) => {
    await resend.emails.send({
        from: 'callaVee <support@callavee.com>', 
        to: [email],
        subject: 'Welcome to callaVee!',
        html: `
            <div style="font-family: sans-serif; color: #333;">
                <h2 style="color: #0f172a;">Welcome to callaVee!</h2>
                <p>Thanks for subscribing. We are happy to have you with us!</p>
                <p>Stay tuned for our latest skincare tips and updates.</p>
            </div>
        `
    });
};