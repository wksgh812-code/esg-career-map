"""고용24 채용정보 API 점검용 스크립트.

인증키는 환경변수 WORK24_AUTH_KEY 에서만 읽고, 저장하는 파일에는 키를 남기지 않는다.
여러 후보 주소를 호출해 응답 상태와 앞부분을 data/work24_probe/ 에 저장한다.
"""
import os, sys, json, urllib.parse, urllib.request, datetime, pathlib

key = os.environ.get("WORK24_AUTH_KEY", "").strip()
if not key:
    sys.exit("WORK24_AUTH_KEY 가 설정되지 않았습니다.")

out = pathlib.Path("data/work24_probe"); out.mkdir(parents=True, exist_ok=True)
params = {"authKey": key, "callTp": "L", "returnType": "XML", "startPage": "1", "display": "5", "keyword": "ESG"}
candidates = [
    "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do",
    "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApi210L01.do",
]
report = {"checked_at": datetime.datetime.utcnow().isoformat() + "Z", "params_sent": {k: ("***" if k == "authKey" else v) for k, v in params.items()}, "results": []}
for i, base in enumerate(candidates, 1):
    url = base + "?" + urllib.parse.urlencode(params)
    r = {"url": base}
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "esg-career-map-probe"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", "replace")
            r.update(status=resp.status, content_type=resp.headers.get("Content-Type"))
    except Exception as e:  # 네트워크 차단, 4xx/5xx 등
        body = getattr(e, "read", lambda: b"")().decode("utf-8", "replace") if hasattr(e, "read") else ""
        r.update(error=repr(e)[:300])
    body = body.replace(key, "***")
    (out / f"response_{i}.txt").write_text(body[:20000], encoding="utf-8")
    r["body_chars"] = len(body)
    r["body_head"] = body[:300]
    report["results"].append(r)
(out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
