// api/getCoupons.js

import admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    databaseURL: "https://sk7re-9eefb-default-rtdb.firebaseio.com/" // 본인의 DB 주소로 변경
  });
}

const db = admin.database();

export default async function handler(req, res) {
  try {
    const ref = db.ref('coupons'); // coupons 경로의 데이터를 참조
    const snapshot = await ref.once('value');
    const coupons = snapshot.val();

    const couponArray = Object.keys(coupons).map(key => ({
      name: coupons[key].name,
      code: coupons[key].code
    }));

    res.status(200).json(couponArray);
  } catch (error) {
    res.status(500).json({ message: 'Firebase에서 데이터를 가져오는 데 실패했습니다.', error: error.message });
  }
}