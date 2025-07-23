// 이 파일은 쿠폰 목록을 프론트엔드에 보내주는 역할을 합니다.
// 나중에 데이터베이스와 연결할 수도 있습니다.

export default function handler(req, res) {
  const coupons = [
    { name: '사전등록 보상 쿠폰', code: 'PRESKGB0315' },
    { name: '론칭 기념 쿠폰', code: 'LAUNCHSKG77' },
    { name: 'CM 루디의 선물', code: 'CMKGBLOVE' },
    { name: '새로운 이벤트 쿠폰', code: 'NEWEVENT777' },
    { name: '테스트용 없는 쿠폰', code: 'INVALIDCODE' } // 테스트용
  ];

  res.status(200).json(coupons);
}