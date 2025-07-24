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
    const targetUrl = `https://coupon.netmarble.com/api/coupon/reward?gameCode=tskgb&couponCode=${coupon.code}&langCd=KO_KR&pid=${uid}`;

    const response = await fetch(targetUrl);
    const result = await response.json();
    
    // 서버가 준 응답(result)을 JSON 문자열 그대로 반환합니다.
    return `➡️ [${coupon.name}] 서버 응답: ${JSON.stringify(result)}`;

  } catch (error) {
    return `❌ [${coupon.name}] 실패: 요청 중 오류 발생 - ${error.message}`;
  }
}

export default async function handler(req, res) {
  const { uid } = a