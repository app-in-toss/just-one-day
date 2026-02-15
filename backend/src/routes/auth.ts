import { Router, Request, Response } from 'express';
import { Agent, fetch as undiciFetch } from 'undici';
import fs from 'node:fs';

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
      // login-me 실패해도 토큰은 유효하므로 토큰과 함께 반환
      console.warn('[login-me] failed, returning tokens without user info');
      res.json({ accessToken, refreshToken, expiresIn, user: null });
      return;
    }

    res.json({ accessToken, refreshToken, expiresIn, user: userBody.success });
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
