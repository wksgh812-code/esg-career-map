import pdfplumber,sys,glob,json,re
f=glob.glob(f'{sys.argv[1]}/*-2022_*.pdf')[0]
rows=[]
with pdfplumber.open(f) as pdf:
    for pi in range(58,79):
        p=pdf.pages[pi]
        ws=p.extract_words(x_tolerance=1.5)
        heads=[w for w in ws if w['text']=='번호']
        for h in sorted(heads,key=lambda w:w['x0']):
            hy=h['top']
            hw=sorted([w for w in ws if abs(w['top']-hy)<3 and h['x0']-2<=w['x0']<h['x0']+620],key=lambda w:w['x0'])
            xs=[w['x0'] for w in hw][:8]
            if len(xs)<8: continue
            xs=xs+[h['x0']+600]
            region=[w for w in ws if xs[0]-3<=w['x0']<xs[8]+40 and hy+18<w['top']<p.height-30]
            starts=sorted([w for w in region if abs(w['x0']-xs[0])<8 and re.fullmatch(r'\d{1,3}',w['text'])],key=lambda w:w['top'])
            for i,s in enumerate(starts):
                top=s['top']-8; bot=starts[i+1]['top']-8 if i+1<len(starts) else p.height-30
                cell=['']*8
                rw=sorted([w for w in region if top<=w['top']<bot],key=lambda w:(round(w['top']),w['x0']))
                for w in rw:
                    ci=max(j for j in range(8) if w['x0']>=xs[j]-4)
                    cell[ci]+=(' ' if cell[ci] else '')+w['text']
                rows.append({'edition':2022,'page':pi+1,'row':cell})
json.dump(rows,open('raw2022.json','w'),ensure_ascii=False)
nums=[int(r['row'][0]) for r in rows]
print(len(rows),max(nums),sorted(set(range(1,max(nums)+1))-set(nums)))
for r in rows[:4]+rows[150:153]: print([c[:50] for c in r['row']])
