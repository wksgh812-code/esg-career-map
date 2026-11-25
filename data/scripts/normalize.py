import json,csv,re
F={'사회복지':'사회복지','취약계층 지원':'사회복지','환경보호':'환경','환경보전':'환경','교육':'교육','교육/ 학교/ 학술':'교육','교육/ 학교/학술':'교육','교육( S)':'교육',
'인재양성':'인재양성·일자리','인력개발':'인재양성·일자리','창업지원':'인재양성·일자리','일자리 창출':'인재양성·일자리',
'지역상생':'지역상생','지역경제 활성화':'지역상생','지역사회':'지역상생','문화예술':'문화예술·체육','문화예술/ 체육':'문화예술·체육','문화예술 /체육':'문화예술·체육','체육':'문화예술·체육',
'보건의료':'보건의료','의료보건':'보건의료','안전':'안전','주거 및 생활':'주거·생활','기타':'기타','':'미분류'}
T={'아동 및 청소년':'아동·청소년','청소년':'아동·청소년','아동/ 어린이':'아동·청소년','취약 계층':'취약계층','시니어 노인':'노인','불특정 다수':'일반 시민','-':'미분류','':'미분류'}
d=json.load(open('csr_programs.json'))
for x in d:
    if x['edition']==2022:
        x['scope']=re.sub(r'\s+\d{2,3}$','',x['scope']); x['description']=re.sub(r'\s*(부록|2022 사회공헌백서)\s*$','',x['description'])
    x['field']=re.sub(r'\s*\(\s*S\)','',x['field']); x['field_std']=F.get(x['field'],x['field']) if x['field'] else '미분류'
    x['target_std']=T.get(x['target'],x['target'])
    x['type']='기업' if x['section']=='100대 기업' else '공공기관'
    m=re.search(r'(19|20)\d\d',x['start_year']); x['start_year']=m.group(0) if m else ''
json.dump(d,open('csr_programs.json','w'),ensure_ascii=False,indent=1)
cols=['edition','base_year','type','section','seq','org','org_raw','program','description','start_year','field_std','field','target_std','target','esg','purpose','scope','page']
with open('csr_programs.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore'); w.writeheader(); w.writerows(d)
from collections import Counter
print(Counter(x['field_std'] for x in d)); print(Counter(x['target_std'] for x in d))
