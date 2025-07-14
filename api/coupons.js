// api/coupons.js

// Firebase 관련 코드를 모두 삭제했습니다.
// 오직 테스트용 데이터를 보내는 역할만 합니다.
export default function handler(request, response) {

  const testCoupons = [
    { id: 1, code: 'TEST_성공하면_이게보여요' },
    { id: 2, code: 'FIREBASE_문제였는지_확인' }
  ];

  // 성공(200) 응답과 함께 테스트 데이터를 JSON 형태로 보냅니다.
  response.status(200).json(testCoupons);
}