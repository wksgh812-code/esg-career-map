import json,csv
from collections import defaultdict
A={'E1채리티오픈':'E1','POSCO홀딩스':'포스코홀딩스','S-Oil':'S-OIL','kCC':'KCC','네이버':'NAVER','비지에프리테일':'BGF리테일',
'씨제이대한통운':'CJ대한통운','에스케이하이닉스':'SK하이닉스','에이치디현대중공업':'HD현대중공업','현대중공업':'HD현대중공업',
'에이치엠엠':'HMM','엘지디스플레이':'LG디스플레이','엘지에너지솔루션':'LG에너지솔루션','엘지이노텍':'LG이노텍','중소기업은행':'기업은행',
'지에스건설':'GS건설','지에스리테일':'GS리테일','케이티':'KT','케이티앤지':'KT&G','코리안리재보험':'코리안리','코오롱인더':'코오롱인더스트리',
'한국항공우주':'한국항공우주산업','한화생명보험':'한화생명','현대자동차':'현대차','현대해상화재보험':'현대해상','삼성화재해상보험':'삼성화재',
'삼성생명보험':'삼성생명','동양생명보험':'동양생명','삼성에스디에스':'삼성SDS','삼성엔지니어링':'삼성E&A','금호석유':'금호석유화학',
'롯데칠성':'롯데칠성음료','현대미포조선':'HD현대미포','HL만도':'HL만도','만도':'HL만도','현대두산인프라코어':'HD현대인프라코어',
'동국홀딩스':'동국제강','대우조선해양':'한화오션','LSELECTRIC':'LS ELECTRIC','에스원':'에스원','신세계':'신세계'}
NOTE={'한화오션':'2022년판은 대우조선해양','HD현대인프라코어':'2022년판은 현대두산인프라코어','동국제강':'2023년판은 동국홀딩스','삼성E&A':'구 삼성엔지니어링','HD현대미포':'구 현대미포조선'}
d=json.load(open('csr_programs.json'))
for x in d: x['org']=A.get(x['org_norm'],x['org_norm'])
json.dump(d,open('csr_programs.json','w'),ensure_ascii=False,indent=1)
cols=['edition','base_year','section','seq','org','org_raw','program','description','start_year','field','esg','target','purpose','scope','page']
with open('csr_programs.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=cols,extrasaction='ignore'); w.writeheader(); w.writerows(d)
# company summary
s=defaultdict(lambda:{'editions':set(),'n':0,'raw':set(),'section':set(),'fields':defaultdict(int)})
for x in d:
    e=s[x['org']]; e['editions'].add(x['edition']); e['n']+=1; e['raw'].add(x['org_raw']); e['section'].add('기업' if x['section']=='100대 기업' else '공공기관')
    if x['field']: e['fields'][x['field']]+=1
rows=[]
for k,e in s.items():
    rows.append({'org':k,'section':'/'.join(sorted(e['section'])),'editions':' '.join(map(str,sorted(e['editions']))),'n_editions':len(e['editions']),'n_programs':e['n'],
     'top_fields':', '.join(f for f,_ in sorted(e['fields'].items(),key=lambda t:-t[1])[:3]),'name_variants':' / '.join(sorted(e['raw'])),'note':NOTE.get(k,'')})
rows.sort(key=lambda r:(r['section']!='기업',-r['n_editions'],-r['n_programs'],r['org']))
with open('organizations.csv','w',newline='',encoding='utf-8-sig') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
c=[r for r in rows if r['section']=='기업']
print('companies',len(c),'all4',sum(1 for r in c if r['n_editions']==4),'public orgs',len(rows)-len(c),'mixed',[r['org'] for r in rows if '/' in r['section']])
