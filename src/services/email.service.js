import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to, verifyUrl) => {
    try {
        const data = await resend.emails.send({
            from: 'Price Tracker <onboarding@resend.dev>',
            to: [to],
            subject: 'Confirm your subscription',
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2>Price Alert Subscription</h2>
                    <p>Thank you for subscribing! Please click the button below to confirm your email and start receiving price drop alerts.</p>
                    <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Subscription</a>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });
        console.log("Resend Verification Email Success:", data);
        return true;
    } catch (error) {
        console.error("Resend Verification Error:", error);
        throw error;
    }
};

export const sendPriceDropNotification = async (email, product, newPrice) => {
    try {
        const discount = Math.round(((product.currentPrice - newPrice) / product.currentPrice) * 100);
        
        const data = await resend.emails.send({
            from: 'Price Tracker <onboarding@resend.dev>',
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


export const sendWelcomeEmail = async (email, interests) => {
    const productList = interests.map(i => `<li>${i.productId.title || 'Unknown Product'}</li>`).join(''); 
    
    await resend.emails.send({
        from: 'Price Tracker <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome! Your Price Alerts are active',
        html: `
            <div style="font-family: sans-serif;">
                <h2>Subscription Confirmed!</h2>
                <p>Your email is now active. You are currently tracking these products:</p>
                <ul>${productList}</ul>
                <p>We will notify you immediately if any price drops!</p>
            </div>
        `
    });
};