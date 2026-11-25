"""공공데이터포털 '공공기관 채용정보 조회서비스' 점검용 스크립트.

인증키는 환경변수 ALIO_KEY 에서만 읽는다. 공공데이터포털 키는 'Encoding 키'와 'Decoding 키'가
있어 어느 쪽을 저장했는지에 따라 호출 방식이 달라지므로 두 방식을 모두 시도한다.
결과에서는 키를 가린 뒤 data/alio_probe/ 에 저장한다.
"""
import os, sys, json, urllib.parse, urllib.request, datetime, pathlib

key = os.environ.get("ALIO_KEY", "").strip()
if not key:
    sys.exit("ALIO_KEY 가 설정되지 않았습니다.")
masks = {key, urllib.parse.quote(key, safe=""), urllib.parse.unquote(key)}

out = pathlib.Path("data/alio_probe"); out.mkdir(parents=True, exist_ok=True)
bases = ["https://apis.data.go.kr/1051000/recruitment/list"]
rest = urllib.parse.urlencode({"pageNo": "1", "numOfRows": "5", "resultType": "json"})
variants = {
    "key_as_is": key,                                     # 저장한 값을 그대로 사용
    "key_encoded": urllib.parse.quote(urllib.parse.unquote(key), safe=""),  # Decoding 키를 인코딩
}
report = {"checked_at": datetime.datetime.utcnow().isoformat() + "Z", "results": []}
n = 0
for base in bases:
    for name, k in variants.items():
        n += 1
        url = f"{base}?serviceKey={k}&{rest}"
        r = {"url": base, "variant": name}
        body = ""
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "esg-career-map-probe"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8", "replace")
                r.update(status=resp.status, content_type=resp.headers.get("Content-Type"))
        except Exception as e:
            if hasattr(e, "read"):
                body = e.read().decode("utf-8", "replace")
            r.update(error=repr(e)[:300])
        for m in masks:
            if m:
                body = body.replace(m, "***")
        (out / f"response_{n}_{name}.txt").write_text(body[:30000], encoding="utf-8")
        r["body_chars"] = len(body)
        r["body_head"] = body[:400]
        report["results"].append(r)
(out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
