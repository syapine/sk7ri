// api/registerAllCoupons.js

import admin from 'firebase-admin';

// Firebase Admin SDK 초기화 (위와 동일)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    databaseURL: "https://seven-knights-rebirth-sk7-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

const db = admin.database();

// 개별 쿠폰을 등록하는 함수
async function registerSingleCoupon(uid, coupon) {
  try {
    const response = await fetch('https://coupon.netmarble.com/api/coupon/use/tskgb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "channel": "COUPON",
        "couponId": coupon.code,
        "playerId": uid
      }),
    });
    const result = await response.json();
    
    if (result.resultCode === 'SUCCESS') {
      return `✅ [${coupon.name}] 등록 성공!`;
    } else {
      return `❌ [${coupon.name}] 실패: ${result.resultString || '알 수 없는 오류'}`;
    }
  } catch (error) {
    return `❌ [${coupon.name}] 실패: 요청 중 오류 발생`;
  }
}

export default async function handler(req, res) {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID가 필요합니다.' });
  }

  try {
    // 1. Firebase에서 최신 쿠폰 목록 가져오기
    const ref = db.ref('coupons');
    const snapshot = await ref.once('value');
    const coupons = snapshot.val();
    const couponArray = Object.keys(coupons).map(key => ({ name: coupons[key].name, code: coupons[key].code }));

    // 2. 모든 쿠폰에 대해 동시에 등록 시도
    const registrationPromises = couponArray.map(coupon => registerSingleCoupon(uid, coupon));
    const results = await Promise.all(registrationPromises);

    // 3. 결과 로그를 프론트엔드에 전달
    res.status(200).json({ log: results.join('\n') });

  } catch (error) {
    res.status(500).json({ message: '전체 쿠폰 등록 중 오류가 발생했습니다.', error: error.message });
  }
}