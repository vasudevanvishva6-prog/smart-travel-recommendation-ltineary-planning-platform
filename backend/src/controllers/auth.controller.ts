import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db';
import { OtpService } from '../services/otp.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  budget: z.number().optional().default(20000),
  durationDays: z.number().optional().default(4),
  travelType: z.string().optional().default('FRIENDS'),
  interests: z.array(z.string()).optional().default(['Nature', 'Adventure']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const generateToken = (user: { id: string; email: string; role: string; fullName: string }) => {
  const secret = process.env.JWT_SECRET || 'travel_platform_super_secret_jwt_key_2026_xyz';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    secret,
    { expiresIn: '7d' }
  );
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        preference: {
          create: {
            budget: data.budget,
            durationDays: data.durationDays,
            travelType: data.travelType,
            interests: JSON.stringify(data.interests),
          },
        },
      },
      include: {
        preference: true,
      },
    });

    // Generate & send OTP
    const otp = OtpService.generateOtp();
    await OtpService.sendOtp(user.email, otp, 'Email Verification');

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your email with the OTP sent.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        preference: {
          ...user.preference,
          interests: JSON.parse(user.preference?.interests || '[]'),
        },
      },
    });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { preference: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);

    let parsedInterests = ['Nature', 'Adventure'];
    if (user.preference?.interests) {
      try {
        parsedInterests = JSON.parse(user.preference.interests);
      } catch (_e) {
        // Keep default
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        preference: user.preference
          ? {
              ...user.preference,
              interests: parsedInterests,
            }
          : null,
      },
    });
  }

  static async sendOtp(req: Request, res: Response): Promise<void> {
    const { email, purpose } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const otp = OtpService.generateOtp();
    await OtpService.sendOtp(email, otp, purpose || 'Verification');

    res.json({
      success: true,
      message: `OTP sent successfully to ${email}. Valid for 10 minutes.`,
    });
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    const data = verifyOtpSchema.parse(req.body);

    const isValid = await OtpService.verifyOtp(data.email, data.otp);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
      return;
    }

    const user = await prisma.user.update({
      where: { email: data.email.toLowerCase() },
      data: { isVerified: true },
      include: { preference: true },
    });

    res.json({
      success: true,
      message: 'Email successfully verified!',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let parsedInterests: string[] = [];
    if (user.preference?.interests) {
      try {
        parsedInterests = JSON.parse(user.preference.interests);
      } catch (_e) {
        parsedInterests = [];
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        preference: user.preference
          ? {
              ...user.preference,
              interests: parsedInterests,
            }
          : null,
      },
    });
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { fullName, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName || undefined,
        avatar: avatar || undefined,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      },
    });
  }

  static async updatePreferences(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { budget, durationDays, travelType, interests } = req.body;

    const preference = await prisma.preference.upsert({
      where: { userId: userId! },
      update: {
        budget: budget !== undefined ? Number(budget) : undefined,
        durationDays: durationDays !== undefined ? Number(durationDays) : undefined,
        travelType: travelType !== undefined ? travelType : undefined,
        interests: interests !== undefined ? JSON.stringify(interests) : undefined,
      },
      create: {
        userId: userId!,
        budget: Number(budget) || 20000,
        durationDays: Number(durationDays) || 4,
        travelType: travelType || 'FRIENDS',
        interests: JSON.stringify(interests || ['Nature', 'Adventure']),
      },
    });

    res.json({
      success: true,
      message: 'Travel preferences updated successfully',
      preference: {
        ...preference,
        interests: JSON.parse(preference.interests || '[]'),
      },
    });
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({ success: true, message: 'Password changed successfully' });
  }
}
