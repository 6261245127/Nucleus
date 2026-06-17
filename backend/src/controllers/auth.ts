import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma';
import { z } from 'zod';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['VIEWER', 'CREATOR']).default('VIEWER'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        signupBonusAwarded: true,
        wallet: {
          create: {
            coinBalance: 1500,
            rewardBalance: 0,
            transactions: {
              create: [
                {
                  amount: 1500,
                  type: 'BONUS_REWARD',
                  description: 'Signup Bonus',
                }
              ]
            }
          }
        }
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { accessToken, role } = req.body;
    
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!googleRes.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
    
    const payload = await googleRes.json();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'User',
          googleId,
          avatarUrl: picture,
          role: role === 'CREATOR' ? 'CREATOR' : 'VIEWER',
          isVerified: true,
          signupBonusAwarded: true,
          wallet: {
            create: {
              coinBalance: 1500,
              fiatBalance: 0,
              rewardBalance: 0,
              transactions: {
                create: [
                  {
                    amount: 1500,
                    type: 'BONUS_REWARD',
                    description: 'Signup Bonus',
                  }
                ]
              }
            }
          }
        },
      });
    } else if (!user.signupBonusAwarded) {
      // Legacy user who hasn't received the bonus yet, give it to them atomically
      await prisma.$transaction(async (tx) => {
        let wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: user.id, coinBalance: 0, fiatBalance: 0, rewardBalance: 0 }
          });
        }
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { coinBalance: { increment: 1500 } }
        });
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: 1500,
            type: 'BONUS_REWARD',
            description: 'Signup Bonus',
          }
        });
        await tx.user.update({
          where: { id: user.id },
          data: { signupBonusAwarded: true }
        });
      });
      // Re-fetch user so JWT has latest state
      user = await prisma.user.findUnique({ where: { email } }) as any;
    }

    const jwtToken = jwt.sign({ id: user!.id, role: user!.role }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d',
    });

    res.json({ token: jwtToken, user: { id: user!.id, name: user!.name, email: user!.email, role: user!.role } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const bypassLogin = async (req: Request, res: Response) => {
  try {
    const { role } = req.body; // 'CREATOR' | 'VIEWER' | 'ADMIN'
    
    if (!['CREATOR', 'VIEWER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const email = `demo@${role.toLowerCase()}.com`;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: `Demo ${role}`,
          role: role as 'CREATOR' | 'VIEWER' | 'ADMIN',
          isVerified: true,
          wallet: {
            create: {
              coinBalance: 0,
              fiatBalance: 0,
              rewardBalance: 0,
            }
          }
        },
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Bypass login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, wallet: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
