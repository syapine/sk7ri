import admin from 'firebase-admin';

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    databaseURL: "https://sk7re-9eefb-default-rtdb.firebaseio.com/"
  });
}

const db = admin.database();

// 개별 쿠폰을 등록하고 결과를 해석하는 최종 함수
async function registerSingleCoupon(uid, coupon) {
  try {
    // 최종 수정: POST 방식이 아닌 GET 방식으로 URL에 정보를 담아 요청합니다.
    const targetUrl = `https://coupon.netmarble.com/api/coupon/use/tskgb?channel=COUPON&couponId=${coupon.code}&playerId=${uid}`;

    // method를 지정하지 않으면 기본적으로 GET 요청입니다.
    const response = await fetch(targetUrl);
    const result = await response.json();
    
    // 넷마블 서버 응답 코드에 따라 결과 메시지를 상세하게 설정
    if (result.resultCode === 'SUCCESS') {
      return `✅ [${coupon.name}] 등록 성공!`;
    } 
    // 실제 응답 코드에 맞춰 'ALREADY_USED_COUPON' 등을 추가할 수 있습니다.
    // 우선 resultString에 '사용된' 이라는 단어가 포함된 경우로 처리합니다.
    else if (result.resultString && result.resultString.includes('사용된 쿠폰')) {
      return `☑️ [${coupon.name}] 이미 사용한 쿠폰입니다.`;
    } 
    else {
      // 그 외 모든 실패는 서버가 주는 메시지를 그대로 사용
      return `❌ [${coupon.name}] 실패: ${result.resultString || result.resultCode}`;
    }
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