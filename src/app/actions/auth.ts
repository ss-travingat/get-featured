'use server';

import { db } from '@/lib/db';
import { users, otps } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendOtpEmail } from '@/lib/mail';

export async function requestOtpAction(email: string) {
  try {
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length > 0) {
      return { error: 'An account with this email already exists. Please log in.' };
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    // Delete existing OTPs for this email first to prevent clutter
    await db.delete(otps).where(eq(otps.email, email));
    await db.insert(otps).values({ email, otp, expiresAt });

    // Send OTP
    await sendOtpEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}

export async function verifyOtpAction(email: string, otp: string) {
  try {
    const existingOtps = await db.select().from(otps).where(eq(otps.email, email)).limit(1);
    const otpRecord = existingOtps[0];

    if (!otpRecord) {
      return { error: 'No OTP requested for this email.' };
    }

    if (otpRecord.otp !== otp) {
      return { error: 'Invalid OTP.' };
    }

    if (new Date() > otpRecord.expiresAt) {
      return { error: 'OTP has expired. Please request a new one.' };
    }

    // Create user
    await db.insert(users).values({ email });
    await db.delete(otps).where(eq(otps.email, email));
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { error: 'Failed to create user account. Please try again.' };
  }
}

export async function submitApplicationAction(email: string, data: {
  firstName: string;
  lastName: string;
  country: string;
  visitedCount: number;
  links: string[];
}) {
  try {
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length === 0) {
      return { error: 'User not found. Please verify your email first.' };
    }

    await db.update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        visitedCount: data.visitedCount,
        links: data.links,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
      
    return { success: true };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { error: 'Failed to save application data.' };
  }
}
