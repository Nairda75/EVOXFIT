"""Gera as páginas estáticas do site EVOXFIT Maia (UNO Studio).

Cada ficheiro em _fonte/pages/*.html começa com um comentário JSON:
<!--{"file":"index.html","title":"...","title_en":"...","desc":"...","nav":"inicio","body":"page-home"}-->
Os dados do ginásio (telefone, morada, nota Google...) estão em _fonte/site.json.
Placeholders de texto: {{tel}} {{tel_e164}} {{wa}} {{morada}} {{cp}} {{plus}} {{ig}} {{rota}} {{ficha}} {{nota}} {{n}} ...
Placeholders de ícone: {{icon:phone}} {{icon:arrow}} ...
Se existirem fotografias em assets/img/gym-*.jpg, aparecem sozinhas na tira do início ({{FOTOS}}) e na galeria de 'O ginásio' ({{GALERIA}}).
"""
import json, os, re, glob, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
S = json.load(open(os.path.join(HERE, 'site.json'), encoding='utf-8'))

NAV = [
    ("inicio", "maia.html", "Início", "Home"),
    ("ginasio", "o-ginasio.html", "O ginásio", "The gym"),
    ("treino", "primeiro-treino.html", "Primeiro treino", "First workout"),
    ("contactos", "contactos.html", "Contactos", "Contact"),
]

def svg(body, extra=''):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"{extra}>{body}</svg>'

ICON = {
    "arrow": svg('<path d="M4 12h15M13 6l6 6-6 6"/>', ' class="arr"'),
    "phone": svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    "wa": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>',
    "menu": svg('<path d="M3 7h18M3 12h18M3 17h12"/>'),
    "close": svg('<path d="M5 5l14 14M19 5L5 19"/>'),
    "pin": svg('<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.3"/>'),
    "clock": svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    "star": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8Z"/></svg>',
    "ig": svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>'),
    "dumbbell": svg('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'),
    "plate": svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'),
    "parking": svg('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>'),
    "spark": svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
    "users": svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4.5 5"/>'),
    "bolt": svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    "down": svg('<path d="M12 4v15M6 13l6 6 6-6"/>'),
    "left": svg('<path d="M15 5l-7 7 7 7"/>'),
    "right": svg('<path d="M9 5l7 7-7 7"/>'),
    "check": svg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
    "msg": svg('<path d="M4 5h16v11H9l-5 4z"/>'),
}

MARK = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="11" fill="#FFD21F"/><g transform="translate(5.1 0) skewX(-12)" fill="#0a0a0b"><rect x="13" y="11" width="7" height="26"/><rect x="13" y="11" width="23" height="6.5"/><rect x="13" y="20.7" width="18" height="6.5"/><rect x="13" y="30.5" width="23" height="6.5"/></g></svg>'
BRAND = '<a class="brand" href="maia.html" aria-label="EVOXFIT Maia, página inicial" data-en-aria="EVOXFIT Maia, home"><img src="assets/img/logo-evoxfit-128.png" width="46" height="46" alt=""><span class="sub">MAIA</span></a>'

def esc(s): return html.escape(s, quote=True)

def subst(text):
    rep = {
        '{{tel}}': S['telefone'], '{{tel_e164}}': S['telefone_e164'], '{{wa}}': S['whatsapp'],
        '{{morada}}': S['morada'], '{{cp}}': S['codigo_postal'], '{{plus}}': S['plus_code'],
        '{{ig}}': S['instagram'], '{{rota}}': S['google_rota'], '{{ficha}}': S['google_ficha'],
        '{{mapa}}': S['google_mapa_embed'], '{{nota}}': S['nota'], '{{n}}': str(S['n_avaliacoes']),
        '{{data_av}}': S['avaliacoes_data'],
    }
    for k, v in rep.items(): text = text.replace(k, v)
    for k, v in ICON.items(): text = text.replace('{{icon:' + k + '}}', v)
    return text

WA_MSG_PT = "Olá! Gostava de saber mais sobre o EVOXFIT Maia."
WA_MSG_EN = "Hello! I would like to know more about EVOXFIT Maia."

def head(m):
    ld = ''
    if m.get('ldjson'):
        data = {
            "@context": "https://schema.org", "@type": "ExerciseGym", "name": "EVOXFIT Maia",
            "telephone": S['telefone_e164'], "sameAs": [S['instagram'], S['google_ficha']],
            "address": {"@type": "PostalAddress", "streetAddress": S['morada'], "postalCode": "4470-605", "addressLocality": "Maia", "addressCountry": "PT"},
            "geo": {"@type": "GeoCoordinates", "latitude": S['lat'], "longitude": S['lng']},
            "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "00:00", "closes": "23:59"}],
        }
        ld = '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
    return f'''<!doctype html>
<html lang="pt-PT" class="no-js" data-title-en="{esc(m['title_en'])}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(m['title'])}</title>
<meta name="description" content="{esc(m['desc'])}">
<meta name="theme-color" content="#0a0a0b">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(m['title'])}">
<meta property="og:description" content="{esc(m['desc'])}">
<meta property="og:image" content="assets/og.png">
<meta property="og:locale" content="pt_PT">
<link rel="icon" href="assets/img/logo-evoxfit-128.png" type="image/png">
<link rel="preload" href="assets/fonts/barlow-condensed-latin-800-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
{ld}
</head>'''

def header(active):
    links = '\n'.join(
        f'<a href="{href}"{" aria-current=\"page\"" if key == active else ""} data-en="{en}">{pt}</a>'
        for key, href, pt, en in NAV if key != 'treino')
    mlinks = '\n'.join(
        f'<a href="{href}"{" aria-current=\"page\"" if key == active else ""}><i>0{i+1}</i><span data-en="{en}">{pt}</span></a>'
        for i, (key, href, pt, en) in enumerate(NAV))
    lang = '<div class="lang" role="group" aria-label="Idioma" data-en-aria="Language"><button type="button" data-lang="pt" aria-pressed="true">PT</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>'
    return f'''<a class="skip" href="#conteudo" data-en="Skip to content">Saltar para o conteúdo</a>
<div class="progress" aria-hidden="true"></div>
<header class="site-header">
  <div class="wrap">
    {BRAND}
    <nav class="nav" aria-label="Principal" data-en-aria="Main">
{links}
    </nav>
    <div class="header-actions">
      <a class="switch" href="index.html" data-en="Switch gym">Mudar de ginásio</a>
      {lang}
      <a class="btn btn--y header-cta" href="primeiro-treino.html"><span data-en="First workout">Primeiro treino</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-movel" aria-label="Abrir menu" data-en-aria="Open menu">{ICON['menu']}</button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="menu-movel" aria-label="Menu" data-en-aria="Menu">
  <div class="top">
    {BRAND}
    <button class="close-btn" type="button" aria-label="Fechar menu" data-en-aria="Close menu">{ICON['close']}</button>
  </div>
  <nav aria-label="Menu" data-en-aria="Menu">
{mlinks}
  </nav>
  <div class="bottom">
    <div class="row">{lang}<a class="link" href="index.html" data-en="Switch gym">Mudar de ginásio</a></div>
    <a class="btn btn--y btn--big" href="tel:{S['telefone_e164']}">{ICON['phone']}<span data-en="Call {S['telefone']}">Ligar {S['telefone']}</span></a>
  </div>
</div>'''

def final_cta():
    return f'''<section class="final-cta" aria-labelledby="final-titulo">
  <div class="wrap">
    <h2 id="final-titulo" data-en="Your first workout is waiting.">O teu primeiro treino está à espera.</h2>
    <div class="actions">
      <a class="btn btn--k btn--big" href="primeiro-treino.html"><span data-en="Book my first workout">Marcar o meu primeiro treino</span>{ICON['arrow']}</a>
      <a class="btn btn--line btn--big" href="tel:{S['telefone_e164']}">{ICON['phone']}<span>{S['telefone']}</span></a>
    </div>
  </div>
</section>'''

def footer(active):
    pages = '\n'.join(f'<li><a href="{href}" data-en="{en}">{pt}</a></li>' for key, href, pt, en in NAV)
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div>
        {BRAND}
        <p data-en="Train when you want, at EVOXFIT Maia.">Treina quando quiseres, no EVOXFIT Maia.</p>
      </div>
      <div>
        <h3 data-en="Pages">Páginas</h3>
        <ul>{pages}</ul>
      </div>
      <div>
        <h3 data-en="Contact">Contactos</h3>
        <ul>
          <li><a href="tel:{S['telefone_e164']}" data-en="Call {S['telefone']}">Ligar {S['telefone']}</a></li>
          <li><a href="https://wa.me/{S['whatsapp']}?text={WA_MSG_PT.replace(' ', '%20')}" data-wa="{esc(WA_MSG_PT)}" data-wa-en="{esc(WA_MSG_EN)}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="{S['instagram']}" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="{S['google_ficha']}" target="_blank" rel="noopener" data-en="Google reviews">Avaliações no Google</a></li>
          <li><a href="index.html" data-en="Switch gym">Mudar de ginásio</a></li>
        </ul>
      </div>
      <div>
        <h3 data-en="Find us">Onde estamos</h3>
        <ul>
          <li><a href="{S['google_rota']}" target="_blank" rel="noopener">{S['morada']}<br>{S['codigo_postal']}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> EVOXFIT Maia</span>
      <span data-en="Website by UNO Studio">Website por UNO Studio</span>
    </div>
  </div>
</footer>
{'' if active == 'treino' else f'''<div class="dock" aria-label="Ações rápidas" data-en-aria="Quick actions">
  <a class="btn btn--line call" href="tel:{S['telefone_e164']}" aria-label="Ligar" data-en-aria="Call">{ICON['phone']}</a>
  <a class="btn btn--y" href="primeiro-treino.html"><span data-en="First workout">Primeiro treino</span>{ICON['arrow']}</a>
</div>'''}
<script src="assets/js/config.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>
<script src="assets/js/anim.js" defer></script>'''

def _imgs():
    return sorted(glob.glob(os.path.join(OUT, 'assets', 'img', 'gym-*.jpg')))

LIGHTBOX = '''<div class="lightbox" role="dialog" aria-modal="true" aria-label="Fotografia" data-en-aria="Photo"><img alt=""><button class="lb-close" type="button" aria-label="Fechar" data-en-aria="Close">{{icon:close}}</button><button class="lb-prev" type="button" aria-label="Anterior" data-en-aria="Previous">{{icon:left}}</button><button class="lb-next" type="button" aria-label="Seguinte" data-en-aria="Next">{{icon:right}}</button></div>'''

def _photo_buttons(imgs):
    out = []
    for p in imgs:
        rel = os.path.relpath(p, OUT).replace(os.sep, '/')
        out.append(f'<button type="button" data-full="{rel}" aria-label="Ver fotografia" data-en-aria="View photo"><img src="{rel}" alt="Treino no EVOXFIT Maia" data-en-alt="Training at EVOXFIT Maia" loading="lazy" decoding="async"></button>')
    return out

def gallery_html():
    """Grelha da página 'O ginásio': só aparece quando existem fotografias reais."""
    imgs = _imgs()
    if not imgs: return ''
    return ('''<section class="section" aria-labelledby="gal-titulo">
  <div class="wrap">
    <p class="eyebrow" data-en="Inside">Por dentro</p>
    <h2 id="gal-titulo" style="margin-bottom:36px" data-en="See it for yourself.">Vê com os teus olhos.</h2>
    <div class="gallery" data-photos>''' + '\n'.join(_photo_buttons(imgs)) + '</div>\n  </div>\n</section>\n' + LIGHTBOX)

PLACEHOLDERS = [
    ("Zona de máquinas", "Machines area"), ("Peso livre", "Free weights"), ("Entrada e receção", "Entrance and reception"),
    ("Espaço de treino", "Training floor"), ("Exterior e estacionamento", "Outside and parking"), ("A equipa", "The team"),
]

def fotos_html():
    """Tira de fotos do início. Sem fotografias reais mostra marcadores a dizer que foto entra em cada sítio."""
    imgs = _imgs()
    if imgs:
        items = '\n'.join(_photo_buttons(imgs)); attr = ' data-photos'; extra = LIGHTBOX
    else:
        print('AVISO: sem fotografias em assets/img/gym-*.jpg — a tira do início mostra marcadores.')
        items = '\n'.join(
            f'<figure class="ph">{ICON["dumbbell"]}<b data-en="{en}">{pt}</b><span data-en="A real photo of the gym goes here.">Aqui entra uma foto real do ginásio.</span></figure>'
            for pt, en in PLACEHOLDERS)
        attr = ''; extra = ''
    return f'''<section class="section photos" aria-labelledby="fotos-titulo">
  <div class="wrap head">
    <div>
      <p class="eyebrow" data-en="Inside">Por dentro</p>
      <h2 id="fotos-titulo" data-en="See the <span class='y'>space.</span>">Vê o <span class="y">espaço.</span></h2>
    </div>
    <div class="strip-ctl">
      <button type="button" data-strip-prev aria-label="Anterior" data-en-aria="Previous">{ICON['left']}</button>
      <button type="button" data-strip-next aria-label="Seguinte" data-en-aria="Next">{ICON['right']}</button>
    </div>
  </div>
  <div class="strip" data-strip{attr}>
{items}
  </div>
</section>
{extra}'''

def write_config_js():
    cfg = {"nome": S['nome'], "wa": S['whatsapp'], "tel": S['telefone_e164'], "telDisplay": S['telefone'],
           "rota": S['google_rota'], "ig": S['instagram']}
    with open(os.path.join(OUT, 'assets', 'js', 'config.js'), 'w', encoding='utf-8') as f:
        f.write('/* Gerado por _fonte/build.py a partir de _fonte/site.json — não editar à mão */\nwindow.EVOX = ' + json.dumps(cfg, ensure_ascii=False) + ';\n')

def build():
    write_config_js()
    gal = subst(gallery_html()); fotos = subst(fotos_html())
    for path in sorted(glob.glob(os.path.join(HERE, 'pages', '*.html'))):
        src = open(path, encoding='utf-8').read()
        m = re.match(r'<!--(\{.*?\})-->\s*', src, re.S)
        meta = json.loads(m.group(1)); body = src[m.end():]
        body = body.replace('{{GALERIA}}', gal).replace('{{FOTOS}}', fotos)
        body = subst(body)
        if meta.get('bare'):
            page = head(meta) + f'\n<body class="{meta.get("body", "page-inner")}">\n' + body + '\n<script src="assets/js/main.js"></script>\n</body>\n</html>\n'
        else:
            page = (head(meta) + f'\n<body class="{meta.get("body", "page-inner")} page-{meta["nav"]}">\n' + header(meta['nav'])
                    + '\n<main id="conteudo">\n' + body + '\n</main>\n'
                    + (final_cta() if meta.get('cta', True) else '') + '\n' + footer(meta['nav']) + subst('') + meta.get('extra_js', '') + '\n</body>\n</html>\n')
            page = subst(page)
        open(os.path.join(OUT, meta['file']), 'w', encoding='utf-8').write(page)
        print('ok', meta['file'])

if __name__ == '__main__':
    build()
