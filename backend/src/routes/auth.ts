import { Router, Request, Response } from 'express';
import { Agent, fetch as undiciFetch } from 'undici';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { db } from '../firebase';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

const TOSS_API_BASE = 'https://apps-in-toss-api.toss.im';

const certPath = process.env.TOSS_CERT_PATH || './certs/first_public.crt';
const keyPath = process.env.TOSS_KEY_PATH || './certs/first_private.key';

const tlsAgent = new Agent({
  connect: {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
    rejectUnauthorized: true,
  },
});

function tossHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function tossFetch(url: string, init: Parameters<typeof undiciFetch>[1]) {
  return undiciFetch(url, {
    ...init,
    dispatcher: tlsAgent,
  });
}

function decodeJwtPayload(token: string): Record<string, any> {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

const TOSS_DECRYPT_KEY = process.env.TOSS_DECRYPT_KEY || '';
const TOSS_DECRYPT_AAD = process.env.TOSS_DECRYPT_AAD || '';

function decryptTossData(encryptedBase64: string): string {
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const IV_LENGTH = 12;
  const TAG_LENGTH = 16;

  const iv = encrypted.subarray(0, IV_LENGTH);
  const tag = encrypted.subarray(encrypted.length - TAG_LENGTH);
  const ciphertext = encrypted.subarray(IV_LENGTH, encrypted.length - TAG_LENGTH);

  const key = Buffer.from(TOSS_DECRYPT_KEY, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from(TOSS_DECRYPT_AAD));

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf-8');
}

function tryDecrypt(value: string | null): string | null {
  if (!value || !TOSS_DECRYPT_KEY) return value;
  try {
    return decryptTossData(value);
  } catch (e) {
    console.error('[decrypt] failed for value:', e);
    return value;
  }
}

const DEFAULT_CATEGORIES = [
  { name: '커피', icon: 'icon-coffee-drink-2', description: '하루 한 잔만 참아도 꽤 모여요', isDefault: true },
  { name: '택시', icon: 'icon-car-side-fill', description: '가까운 거리는 걸어보는 한 주', isDefault: true },
  { name: '담배', icon: 'icon-cigarette', description: '건강도 돈도 같이 아껴요', isDefault: true },
  { name: '배달', icon: 'icon-delivery-motorcycle', description: '집밥 한 번이 큰 절약이에요', isDefault: true },
  { name: '충동구매', icon: 'icon-shopping-bag-fill', description: '사고 싶을 때 하루만 미뤄보기', isDefault: true },
];

async function upsertUser(
  userId: string,
  userInfo: { name?: string; email?: string; gender?: string }
) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const now = FieldValue.serverTimestamp();

  if (userDoc.exists) {
    await userRef.update({
      ...userInfo,
      updatedAt: now,
    });
  } else {
    await userRef.set({
      ...userInfo,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
    });

    const batch = db.batch();
    for (const category of DEFAULT_CATEGORIES) {
      const catRef = userRef.collection('categories').doc();
      batch.set(catRef, {
        ...category,
        createdAt: now,
      });
    }
    await batch.commit();
  }
}

router.post('/login', async (req: Request, res: Response) => {
  const { authorizationCode, referrer } = req.body;

  if (!authorizationCode) {
    res.status(400).json({ error: 'authorizationCode is required' });
    return;
  }

  try {
    const tokenResponse = await tossFetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
      method: 'POST',
      headers: tossHeaders(),
      body: JSON.stringify({ authorizationCode, referrer }),
    });

    const tokenBody = (await tokenResponse.json()) as any;
    console.log('[generate-token] status:', tokenResponse.status, 'body:', JSON.stringify(tokenBody));

    if (tokenBody.resultType !== 'SUCCESS' || !tokenBody.success) {
      res.status(400).json(tokenBody);
      return;
    }

    const { accessToken, refreshToken, expiresIn } = tokenBody.success;

    const userResponse = await tossFetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
      method: 'GET',
      headers: tossHeaders({ Authorization: `Bearer ${accessToken}` }),
    });

    const userBody = (await userResponse.json()) as any;
    console.log('[login-me] status:', userResponse.status, 'body:', JSON.stringify(userBody));

    if (userBody.resultType !== 'SUCCESS' || !userBody.success) {
      console.warn('[login-me] failed, returning tokens without user info');
      res.json({ accessToken, refreshToken, expiresIn, user: null });
      return;
    }

    // JWT 디코딩 및 userId 추출
    const jwtPayload = decodeJwtPayload(accessToken);
    console.log('[jwt] payload keys:', Object.keys(jwtPayload), 'sub:', jwtPayload.sub);

    const userId = jwtPayload.sub as string;
    if (!userId) {
      console.error('[jwt] sub claim is missing, skipping Firestore save');
      const userInfo = userBody.success;
      res.json({ accessToken, refreshToken, expiresIn, user: userInfo });
      return;
    }

    const userInfo = userBody.success;
    const decryptedUser = {
      name: tryDecrypt(userInfo.name),
      email: tryDecrypt(userInfo.email),
      gender: tryDecrypt(userInfo.gender),
    };
    console.log('[decrypt] result:', JSON.stringify(decryptedUser));

    try {
      await upsertUser(userId, decryptedUser);
      console.log('[firestore] upsert success for:', userId);
    } catch (firestoreError) {
      console.error('[firestore] upsert failed:', firestoreError);
    }

    // isOnboarded 조회
    let isOnboarded = false;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      isOnboarded = userDoc.data()?.isOnboarded ?? false;
    } catch (e) {
      console.error('[firestore] isOnboarded check failed:', e);
    }

    res.json({
      accessToken,
      refreshToken,
      expiresIn,
      isOnboarded,
      user: { ...userInfo, ...decryptedUser, userId },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: String(error) });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' });
    return;
  }

  try {
    const response = await tossFetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/refresh-token`, {
      method: 'POST',
      headers: tossHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await response.json()) as any;
    console.log('[refresh-token] status:', response.status, 'body:', JSON.stringify(data));

    if (data.resultType !== 'SUCCESS' || !data.success) {
      res.status(400).json(data);
      return;
    }

    res.json(data.success);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: String(error) });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({ error: 'Authorization header is required' });
    return;
  }

  try {
    const response = await tossFetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token`, {
      method: 'POST',
      headers: tossHeaders({ Authorization: authorization }),
    });

    if (!response.ok) {
      const error = await response.json();
      res.status(response.status).json(error);
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRouter };
