# /api/registerAllCoupons.py

from http.server import BaseHTTPRequestHandler
import json
import requests
import firebase_admin
from firebase_admin import credentials, db
import os

# Firebase Admin SDK 초기화
# Vercel 환경 변수에서 서비스 계정 키를 읽어옵니다.
if not firebase_admin._apps:
    cert_json = json.loads(os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY'))
    cred = credentials.Certificate(cert_json)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://sk7re-9eefb-default-rtdb.firebaseio.com/'
    })

# 개별 쿠폰을 등록하고 결과를 해석하는 함수
def register_single_coupon(uid, coupon):
    try:
        target_url = f"https://coupon.netmarble.com/api/coupon/reward?gameCode=tskgb&couponCode={coupon['code']}&langCd=KO_KR&pid={uid}"
        
        # Python requests 라이브러리는 브라우저와 유사한 User-Agent를 기본으로 사용합니다.
        response = requests.get(target_url)
        result = response.json()

        if result.get('errorCode') == 200 and result.get('success') == True:
            return f"✅ [{coupon['code']}] {coupon['name']} - 등록 성공! (보상 지급)"
        elif result.get('errorCode') == 24004:
            return f"☑️ [{coupon['code']}] {coupon['name']} - 이미 사용한 쿠폰입니다."
        else:
            return f"❌ [{coupon['code']}] {coupon['name']} - 실패: {result.get('errorMessage', '알 수 없는 오류')}"
            
    except Exception as e:
        return f"❌ [{coupon['code']}] {coupon['name']} - 실패: 요청 중 오류 발생 - {str(e)}"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        uid = data.get('uid')

        if not uid:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'UID가 필요합니다.'}).encode())
            return

        try:
            # Firebase에서 쿠폰 목록 가져오기
            ref = db.reference('coupons')
            coupons = ref.get()
            coupon_array = [{'name': v['name'], 'code': v['app_id']} for k, v in coupons.items()]

            # 모든 쿠폰 등록 시도
            results = [register_single_coupon(uid, c) for c in coupon_array]
            
            # 성공 응답 전송
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'log': '\n'.join(results)}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'message': str(e)}).encode())