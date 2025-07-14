// 이 파일은 Vercel에서 서버처럼 동작합니다.

export default async function handler(request, response) {
    // 1. 프론트엔드에서 보낸 UID와 쿠폰 코드를 받습니다.
    const { uid, couponCode } = request.body;

    // 2. 넷마블 쿠폰 등록 API의 실제 URL과 필요한 정보를 설정합니다.
    //    (이 부분은 '리버스 엔지니어링'으로 직접 알아내야 합니다.)
    const netmarbleCouponURL = 'https://coupon.netmarble.com/api/v1/coupon/use'; // 예시 URL

    try {
        // 3. 우리 서버가 넷마블 서버에 직접 등록 요청을 보냅니다.
        const apiResponse = await fetch(netmarbleCouponURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 넷마블 API가 요구하는 다른 헤더 정보들 (필요시 추가)
            },
            body: JSON.stringify({
                playerId: uid,
                couponCode: couponCode,
                // 넷마블 API가 요구하는 다른 정보들
            })
        });

        const resultData = await apiResponse.json();

        // 4. 넷마블 서버의 응답 결과에 따라 성공 또는 실패를 프론트엔드에 전달합니다.
        if (resultData.success) { // 넷마블 응답이 성공적이라면
            response.status(200).json({ success: true, message: '등록 성공!' });
        } else {
            response.status(400).json({ success: false, message: resultData.message || '넷마블 서버에서 오류가 발생했습니다.' });
        }

    } catch (error) {
        response.status(500).json({ success: false, message: '백엔드 서버 오류가 발생했습니다.' });
    }
}