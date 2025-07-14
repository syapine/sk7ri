import admin from 'firebase-admin';

// Firebase Admin SDK 초기화
try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
    });
  }
} catch (e) {
  console.error('Firebase Admin Init Error', e);
}

const db = admin.firestore();

export default async function handler(request, response) {
  try {
    // Vercel 환경 변수에서 앱 ID를 가져옵니다.
    const appId = process.env.APP_ID;
    if (!appId) {
        throw new Error('APP_ID 환경 변수가 설정되지 않았습니다.');
    }

    // 원래 사용하시던 Firestore 경로
    const couponsRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('coupons');
    const snapshot = await couponsRef.get();

    if (snapshot.empty) {
      return response.status(200).json([]);
    }

    const couponList = [];
    snapshot.forEach(doc => {
      couponList.push(doc.data());
    });

    // ID 순서대로 정렬
    couponList.sort((a, b) => a.id - b.id);

    return response.status(200).json(couponList);

  } catch (error) {
    console.error('Firestore Error:', error);
    return response.status(500).json({ message: error.message || '서버에서 쿠폰 목록을 가져오는 데 실패했습니다.' });
  }
}