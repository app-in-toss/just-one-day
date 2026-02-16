import { Router, Response } from 'express';
import { db } from '../firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// 사용자의 카테고리 목록 조회
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('categories')
      .get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ categories });
  } catch (error) {
    console.error('[challenge/categories] error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 카테고리 선택 + 단가 설정 + 첫 주간 챌린지 생성
router.post('/setup', async (req: AuthRequest, res: Response) => {
  const { categoryId, unitPrice } = req.body;

  if (!categoryId || unitPrice == null) {
    res.status(400).json({ error: 'categoryId and unitPrice are required' });
    return;
  }

  try {
    const userId = req.userId!;
    const userRef = db.collection('users').doc(userId);
    const categoryRef = userRef.collection('categories').doc(categoryId);

    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const categoryData = categoryDoc.data()!;

    // 단가 업데이트
    await categoryRef.update({ unitPrice });

    // 이번 주 월~일 기준 계산
    const now = new Date();
    const day = now.getDay(); // 0=일, 1=월, ...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // 챌린지 문서 생성
    const challengeRef = userRef.collection('challenges').doc();
    await challengeRef.set({
      categoryId,
      categoryName: categoryData.name,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
      status: 'active',
      dailyChecks: {},
      successDays: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    // isOnboarded 설정
    await userRef.update({ isOnboarded: true });

    res.json({
      challengeId: challengeRef.id,
      categoryId,
      categoryName: categoryData.name,
      unitPrice,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
    });
  } catch (error) {
    console.error('[challenge/setup] error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 현재 활성 챌린지 조회
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const userRef = db.collection('users').doc(userId);

    const userDoc = await userRef.get();
    const userData = userDoc.data();
    const isOnboarded = userData?.isOnboarded ?? false;

    const snapshot = await userRef
      .collection('challenges')
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.json({ isOnboarded, challenge: null });
      return;
    }

    const doc = snapshot.docs[0];
    const challenge = { id: doc.id, ...doc.data() };

    // 해당 카테고리의 unitPrice도 함께 반환
    const categoryRef = userRef.collection('categories').doc((challenge as any).categoryId);
    const categoryDoc = await categoryRef.get();
    const unitPrice = categoryDoc.exists ? categoryDoc.data()?.unitPrice ?? 0 : 0;

    res.json({
      isOnboarded,
      challenge: { ...challenge, unitPrice },
    });
  } catch (error) {
    console.error('[challenge/status] error:', error);
    res.status(500).json({ error: String(error) });
  }
});

export { router as challengeRouter };
