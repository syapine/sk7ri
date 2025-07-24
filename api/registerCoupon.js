export default async function handler(req, res) {
  // 프론트엔드에서 보낸 UID와 쿠폰 코드를 받습니다.
  const { uid, couponCode } = req.body;

  if (!uid || !couponCode) {
    return res.status(400).json({ message: 'UID와 쿠폰 코드가 필요합니다.' });
  }

  try {

    const response = await fetch('https://coupon.netmarble.com/api/coupon/use/tskgb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        "channel": "COUPON",
        "couponId": couponCode,
        "playerId": uid
      }),
    });

    const result = await response.json();


    res.status(response.status).json(result);

  } catch (error) {
    res.status(500).json({ message: '쿠폰 등록 중 서버 오류가 발생했습니다.', error: error.message });
  }
}