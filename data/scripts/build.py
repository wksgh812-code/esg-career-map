import json,re,csv
from collections import defaultdict,Counter
def cl(s): 
    s=(s or '').replace('\x07','').replace('•','').strip()
    return re.sub(r'\s+',' ',s)
out=[]
# 2022
r22=[x for x in json.load(open('raw2022.json')) if cl(x['row'][2]) or len(cl(x['row'][3]))>20]
r22.sort(key=lambda x:int(x['row'][0]))
last=''
for x in r22:
    c=[cl(v) for v in x['row']]
    org=c[1] or last; last=org
    out.append(dict(edition=2022,section='100대 기업',seq=int(c[0]),org=org,program=c[2],description=c[3],start_year=c[4],field=c[5],esg='',target=c[6],purpose='',scope=c[7],page=x['page']))
raw=json.load(open('raw.json'))
for y in [2023,2024,2025]:
    rows=[x for x in raw if x['edition']==y]
    for x in rows:
        c=[cl(v) for v in x['row']]; h=x['hdr']
        public = ('기관명' in h[1]) or (y==2023 and x['page']>=130)
        sec='100대 기업' if not public else ('35대 공기업' if y==2023 else '공공기관')
        d=dict(edition=y,section=sec,seq=int(c[0]),org=c[1],program=c[2],description=c[3],start_year=c[4],page=x['page'],field='',esg='',target='',purpose='',scope='')
        if y==2023:
            m=re.match(r'(.*?)\s*\(([ESG])\)',c[5]); d['field']=m.group(1) if m else c[5]; d['esg']=m.group(2) if m else ''
            d['target']=c[6]; d['scope']=c[7]
        elif y==2024: d['target'],d['field'],d['purpose']=c[5],c[6],c[7]
        else: d['target'],d['field']=c[5],c[6]
        out.append(d)
# dedupe exact
seen=set();res=[]
for d in out:
    k=(d['edition'],d['section'],d['org'],d['program'])
    if k in seen: continue
    seen.add(k);res.append(d)
# 2024 has two public subsegments: keep ordering by page
res.sort(key=lambda d:(d['edition'],d['section']!='100대 기업',d['page'],d['seq']))
for d in res:
    d['org_raw']=d['org']
    n=re.sub(r'\(주\)|㈜|주식회사|\(株\)','',d['org']).strip()
    d['org_norm']=re.sub(r'\s+','',n)
    d['base_year']=d['edition']-1
json.dump(res,open('csr_programs.json','w'),ensure_ascii=False,indent=1)
cols=['edition','base_year','section','seq','org_raw','org_norm','program','description','start_year','field','esg','target','purpose','scope','page']
with open('csr_programs.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore'); w.writeheader(); w.writerows(res)
print(Counter((d['edition'],d['section']) for d in res))
print('orgs per edition',{y:len({d['org_norm'] for d in res if d['edition']==y}) for y in [2022,2023,2024,2025]})
print('empty program',sum(1 for d in res if not d['program']),'empty desc',sum(1 for d in res if len(d['description'])<15))
