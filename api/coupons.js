import admin from 'firebase-admin';

try {
  if (admin.apps.length === 0) {
    // 1. Vercel에 저장된 Base64 텍스트를 가져옵니다.
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
    
    // 2. Base64를 원래의 JSON 형태로 되돌립니다.
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
    
    // 3. 되돌린 JSON 정보로 Firebase에 접속합니다.
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson))
    });
  }
} catch (e) {
  console.error('Firebase Admin Init Error', e);
}

const db = admin.firestore();

export default async function handler(request, response) {
  // 이하 로직은 동일합니다...
  try {
    const appId = process.env.APP_ID;
    if (!appId) {
        throw new Error('APP_ID 환경 변수가 설정되지 않았습니다.');
    }
    const couponsRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('coupons');
    const snapshot = await couponsRef.get();
    if (snapshot.empty) {
      return response.status(200).json([]);
    }
    const couponList = [];
    snapshot.forEach(doc => {
      couponList.push(doc.data());
    });
    couponList.sort((a, b) => a.id - b.id);
    return response.status(200).json(couponList);
  } catch (error) {
    console.error('Firestore Error:', error);
    return response.status(500).json({ message: error.message || '서버에서 쿠폰 목록을 가져오는 데 실패했습니다.' });
  }
}