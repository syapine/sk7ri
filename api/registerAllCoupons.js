import admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    databaseURL: "https://sk7re-9eefb-default-rtdb.firebaseio.com/"
  });
}

const db = admin.database();

// 결과를 해석하지 않고, 서버 응답을 그대로 보여주는 진단용 함수
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
    
    // 서버가 준 응답(result)을 JSON 문자열 그대로 반환합니다.
    return `➡️ [${coupon.name}] 서버 응답: ${JSON.stringify(result)}`;

  } catch (error) {
    return `❌ [${coupon.name}] 실패: 요청 중 오류 발생 - ${error.message}`;
  }
}

export default async function handler(req, res) {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID가 필요합니다.' });
  }

  try {
    const ref = db.ref('coupons');
    const snapshot = await ref.once('value');
    const coupons = snapshot.val();
    const couponArray = Object.keys(coupons).map(key => ({ name: coupons[key].name, code: coupons[key].app_id }));

    const registrationPromises = couponArray.map(coupon => registerSingleCoupon(uid, coupon));
    const results = await Promise.all(registrationPromises);

    res.status(200).json({ log: results.join('\n') });

  } catch (error) {
    res.status(500).json({ message: '전체 쿠폰 등록 중 오류가 발생했습니다.', error: error.message });
  }
}