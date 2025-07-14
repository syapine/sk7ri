import admin from 'firebase-admin';

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin SDK 초기화 실패:', error);
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://syapine.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const couponsRef = db.collection('artifacts').doc('appid').collection('public').doc('data').collection('coupons');
    const snapshot = await couponsRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const couponList = [];
    snapshot.forEach(doc => {
      const couponData = doc.data();
        if (couponData && couponData.code && couponData.id) {
        couponList.push({
          id: couponData.id,
          code: couponData.code
        });
      }
    });

    couponList.sort((a, b) => a.id - b.id);

    res.status(200).json(couponList);

  } catch (error) {
    console.error('Firestore에서 데이터를 가져오는 중 오류 발생:', error);
    res.status(500).json({ message: '서버에서 쿠폰 목록을 가져오는 데 실패했습니다.' });
  }
}