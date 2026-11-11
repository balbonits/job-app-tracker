from PIL import Image, ImageDraw, ImageFont
import json, sys
m=json.load(open('shots/meta.json')); out=sys.argv[1]
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22); FB=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',24)
P=[('now','1 Before (main adea3fd)'),('start','2 Tabs at start: end cue'),('middle-kbd','3 Middle (ArrowRight x2): both cues'),('end-kbd','4 End (End key): start cue'),('actions-hover','5 Move or edit: hover'),('actions-focus','6 Move or edit: focus-visible'),('actions-expanded','7 Expanded: chevron up, accent-soft')]
for w in (320,375):
  for s in ('light','dark'):
    ims=[]
    for k,t in P:
      if k=='now':
        im=Image.open(f'now-{w}-{s}.png').convert('RGB'); im=im.crop((0,300,im.width,300+760))
      else: im=Image.open(f'shots/{w}-{s}-{k}.png').convert('RGB')
      ims.append((t,im))
    pw=ims[0][1].width; ph=max(i.height for _,i in ims)
    cols=4; rows=2; W=cols*(pw+20)+20; legend=[]
    st=m[f'{w}-{s}-start']; mid=m[f'{w}-{s}-middle-kbd']; ex=m[f'{w}-{s}-actions-expanded']; fo=m[f'{w}-{s}-actions-focus']; ho=m[f'{w}-{s}-actions-hover']
    c=st['cues'][0]
    legend=[f"{w}px {s}, 2x, prefers-reduced-motion: reduce. Prototype injected into the built app (proto.mjs); not app code.",
      f"Cue: aria-hidden plate {c['rect'][2]:.0f}x{c['rect'][3]:.0f}px in --color-bg {c['bg']}, chevron 16px stroke 2 in --text-muted {c['color']}, 1px --border-subtle edge; pointer-events none.",
      f"Tablist scrollWidth {st['scroll'][1]} > clientWidth {st['scroll'][2]}: cues follow scroll position, hidden at each end (2, 4) and when nothing overflows.",
      f"3: selected tab {mid['sel'][0]} at x {mid['sel'][1]:.0f}..{mid['sel'][1]+mid['sel'][3]:.0f}, list {mid['list'][0]:.0f}..{mid['list'][0]+mid['list'][2]:.0f}: scrollIntoView nearest + scroll-padding-inline 40px keep it clear of both plates; focus ring inset (offset -4px), whole ring visible (3, 4).",
      f"5-7: Move or edit is Ember secondary + chevron: {fo['btn']['rect'][2]:.0f}x{fo['btn']['rect'][3]:.0f}px, border {st['btn']['border']}, hover bg {ho['btn']['bg']}, focus {fo['btn']['outline']}, expanded bg {ex['btn']['bg']}."]
    H=rows*(ph+50)+20+len(legend)*32+20
    o=Image.new('RGB',(W,H),(255,255,255)); d=ImageDraw.Draw(o)
    for i,(t,im) in enumerate(ims):
      x=20+(i%cols)*(pw+20); y=20+(i//cols)*(ph+50)
      d.text((x,y),t,fill=(0,0,0),font=FB); o.paste(im,(x,y+34)); d.rectangle([x-1,y+33,x+im.width,y+34+im.height],outline=(120,120,120))
    y=20+rows*(ph+50)
    for l in legend: d.text((20,y),l,fill=(0,0,0),font=F); y+=32
    o.save(f'{out}/tracker-{w}-{s}-mobile-polish.png',optimize=True); print(o.size)
