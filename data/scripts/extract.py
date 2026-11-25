import pdfplumber,sys,glob,json,re
U=sys.argv[1]
out=[]
for y in ['2022','2023','2024','2025']:
    f=glob.glob(f'{U}/*-{y}_*.pdf')[0]
    with pdfplumber.open(f) as pdf:
        for pi,p in enumerate(pdf.pages):
            txt=p.extract_text() or ''
            for tb in p.extract_tables():
                hdr=None
                for r in tb:
                    cells=[re.sub(r'\s*\n\s*',' ',c or '').strip() for c in r]
                    if cells and cells[0]=='번호': hdr=cells; continue
                    if hdr and cells and re.fullmatch(r'\d+',cells[0] or ''):
                        out.append({'edition':int(y),'page':pi+1,'hdr':hdr,'row':cells})
json.dump(out,open('raw.json','w'),ensure_ascii=False)
from collections import Counter
print(Counter((o['edition'],tuple(o['hdr'])) for o in out))
