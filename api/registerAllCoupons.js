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
    const targetUrl = `https://coupon.netmarble.com/api/coupon/reward?gameCode=tskgb&couponCode=${coupon.code}&langCd=KO_KR&pid=${uid}`;

    // --- 이 부분 수정: headers에 User-Agent 추가 ---
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      }
    });
    
    const result = await response.json();
    
    // 실제 응답 데이터의 errorCode를 기준으로 모든 케이스를 처리
    if (result.errorCode === 200 && result.success === true) {
      return `✅ [${coupon.code}] ${coupon.name} - 등록 성공! (보상 지급)`;
    } 
    else if (result.errorCode === 24004) {
      return `☑️ [${coupon.code}] ${coupon.name} - 이미 사용한 쿠폰입니다.`;
    } 
    else {
      return `❌ [${coupon.code}] ${coupon.name} - 실패: ${result.errorMessage || '알 수 없는 오류'}`;
    }
  } catch (error) {
    return `❌ [${coupon.code}] ${coupon.name} - 실패: 응답 해석 오류 - ${error.message}`;
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