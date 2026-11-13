"""Gera as páginas estáticas do site EVOXFIT Fitness Health Club Maia (UNO Studio).

Cada ficheiro em _fonte/pages/*.html começa com um comentário JSON:
<!--{"file":"maia.html","title":"...","title_en":"...","desc":"...","nav":"inicio","body":"page-home"}-->
Os dados do ginásio (telefone, morada, nota Google, horário da receção, equipamento...) estão em _fonte/site.json.
Placeholders de texto: {{tel}} {{tel_e164}} {{wa}} {{morada}} {{cp}} {{plus}} {{ig}} {{rota}} {{ficha}} {{nota}} {{n}} ...
Placeholders de ícone: {{icon:phone}} {{icon:arrow}} ...
Blocos gerados a partir do site.json: {{BOOK}} {{BOOK_FORM}} {{EQ_SUMMARY}} {{EQ_FULL}} {{EQ_TOTAL}} {{HOURS}} {{RECECAO_TAG}} {{EQ_TAG}} {{TEAM}} {{GALERIA}} {{FOTOS}}
Se existirem fotografias em assets/img/gym-*.jpg ou assets/img/evox-*.jpg, aparecem nas galerias.
"""
import json, os, re, glob, html

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
S = json.load(open(os.path.join(HERE, 'site.json'), encoding='utf-8'))

NAV = [
    ("inicio", "maia.html", "Início", "Home"),
    ("ginasio", "o-ginasio.html", "O ginásio", "The gym"),
    ("maquinas", "maquinas.html", "Máquinas", "Equipment"),
    ("equipa", "equipa.html", "Equipa", "Team"),
    ("treino", "primeiro-treino.html", "Primeiro treino", "First workout"),
    ("contactos", "contactos.html", "Contactos", "Contact"),
]

def svg(body, extra=''):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"{extra}>{body}</svg>'

ICON = {
    "arrow": svg('<path d="M4 12h15M13 6l6 6-6 6"/>', ' class="arr"'),
    "up": svg('<path d="M7 17L17 7M8 7h9v9"/>'),
    "phone": svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    "wa": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"/></svg>',
    "menu": svg('<path d="M4 6.5h16M4 12h16M4 17.5h16"/>'),
    "down": svg('<path d="M12 4v15M6 13l6 6 6-6"/>'),
    "close": svg('<path d="M5 5l14 14M19 5L5 19"/>'),
    "pin": svg('<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.3"/>'),
    "clock": svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    "desk": svg('<rect x="3" y="9" width="18" height="9" rx="3"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>'),
    "star": '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8L12 2.8Z"/></svg>',
    "ig": svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>'),
    "dumbbell": svg('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'),
    "parking": svg('<rect x="4" y="3" width="16" height="18" rx="5"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>'),
    "users": svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5a5 5 0 0 1 4.5 5"/>'),
    "user": svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    "bolt": svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    "left": svg('<path d="M15 5l-7 7 7 7"/>'),
    "right": svg('<path d="M9 5l7 7-7 7"/>'),
    "check": svg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
    "cal": svg('<rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
}

BRAND = '<a class="brand" href="maia.html" aria-label="EVOXFIT Fitness Health Club Maia, página inicial" data-en-aria="EVOXFIT Fitness Health Club Maia, home"><img src="assets/img/logo-evoxfit-128.png" width="40" height="40" alt=""><span class="sub">MAIA</span></a>'

def esc(s): return html.escape(s, quote=True)

# ---------------------------------------------------------------- dados
DAYS_PT = {1: "Segunda-feira", 2: "Terça-feira", 3: "Quarta-feira", 4: "Quinta-feira", 5: "Sexta-feira", 6: "Sábado", 0: "Domingo"}
DAYS_EN = {1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 0: "Sunday"}
ORDER = [1, 2, 3, 4, 5, 6, 0]
REC = S['rececao']; EQ = S['equipamento']

def _spans(dias):
    """Agrupa dias consecutivos com o mesmo horário: [inicio, fim, horario]."""
    out = []
    for d in ORDER:
        h = dias.get(str(d), [])
        key = '; '.join(f'{a}–{b}' for a, b in h)
        if out and out[-1][2] == key: out[-1][1] = d
        else: out.append([d, d, key])
    return out

def hours_html():
    def name(d, lang): return (DAYS_PT if lang == 'pt' else DAYS_EN)[d]
    def label(a, b, lang):
        if a == b: return name(a, lang)
        if lang == 'pt': return name(a, 'pt') + ' a ' + name(b, 'pt').split('-')[0].lower()
        return name(a, 'en') + ' to ' + name(b, 'en')
    rows_pt = ''.join(f'<li><span>{label(a, b, "pt")}</span><b>{k or "Fechada"}</b></li>' for a, b, k in _spans(REC['dias']))
    rows_en = ''.join(f'<li><span>{label(a, b, "en")}</span><b>{k or "Closed"}</b></li>' for a, b, k in _spans(REC['dias']))
    return ('<div class="hours-card"><h3 data-en="Gym access">Acesso ao ginásio</h3><ul class="hours"><li><span data-en="Every day">Todos os dias</span><b data-en="24 hours">24 horas</b></li></ul></div>'
            f'<div class="hours-card"><h3 data-en="Reception">Receção</h3><ul class="hours" data-en="{esc(rows_en)}">{rows_pt}</ul></div>')


ABB_PT = {1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb", 0: "Dom"}
ABB_EN = {1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Sun"}

def rec_line():
    """Resumo curto do horário da receção, ex.: Seg–Sex 08:00–21:00 · Sáb 09:00–13:00."""
    def lab(a, b, ab): return ab[a] if a == b else ab[a] + '–' + ab[b]
    sp = [(a, b, k) for a, b, k in _spans(REC['dias']) if k]
    pt = ' · '.join(f'{lab(a, b, ABB_PT)} {k.replace("; ", " e ")}' for a, b, k in sp)
    en = ' · '.join(f'{lab(a, b, ABB_EN)} {k.replace("; ", " and ")}' for a, b, k in sp)
    return f'<span data-en="{esc(en)}">{pt}</span>'

def eq_legend():
    out = []
    for g in EQ['grupos']:
        n = sum(x['n'] for x in g['itens'])
        out.append(f'<li class="lg lg--{g["id"]}"><i></i><span data-en="{esc(g["en"])}">{g["pt"]}</span><b>{n}</b></li>')
    return '<ul class="disc-legend">' + ''.join(out) + '</ul>'

def rec_core():
    w = REC['dias'].get('1') or next((v for v in REC['dias'].values() if v), [])
    if not w: return '—'
    return w[0][0][:2] + '–' + w[-1][1][:2]

def rating_num():
    return float(str(S['nota']).replace(',', '.'))

def eq_total():
    return sum(i['n'] for g in EQ['grupos'] for i in g['itens'])

def eq_tag():
    if not EQ.get('exemplo'): return ''
    return '<span class="chip chip--note" data-en="Sample list, to be replaced by the real inventory">Lista de exemplo, a substituir pelo inventário real</span>'

def rec_tag():
    if not REC.get('exemplo'): return ''
    return '<span class="chip chip--note" data-en="Sample hours, to be confirmed with the gym">Horário de exemplo, a confirmar com o ginásio</span>'

def eq_summary():
    cards = []
    for i, g in enumerate(EQ['grupos']):
        n = sum(x['n'] for x in g['itens'])
        top = ', '.join(x['pt'] for x in g['itens'][:3]); top_en = ', '.join(x['en'] for x in g['itens'][:3])
        cards.append(f'<a class="eq-card rv" style="--d:{i*0.08:.2f}s" href="maquinas.html#{g["id"]}"><span class="eq-n" data-count="{n}">{n}</span><h3 data-en="{esc(g["en"])}">{g["pt"]}</h3><p data-en="{esc(top_en)}…">{top}…</p><span class="eq-go">{ICON["up"]}</span></a>')
    return '<div class="eq-grid">' + ''.join(cards) + '</div>'

def eq_full():
    blocks = []
    for g in EQ['grupos']:
        n = sum(x['n'] for x in g['itens'])
        rows = ''.join(f'<li><span data-en="{esc(x["en"])}">{x["pt"]}</span><b>{x["n"]}</b></li>' for x in g['itens'])
        blocks.append(f'<article class="eq-block rv" id="{g["id"]}"><header><h2 data-en="{esc(g["en"])}">{g["pt"]}</h2><span class="eq-total"><b>{n}</b><i data-en="units">unidades</i></span></header><ul class="eq-list">{rows}</ul></article>')
    return '<div class="eq-full">' + ''.join(blocks) + '</div>'

def eq_list():
    rows = ''.join(f'<li><span data-en="{esc(g["en"])}">{g["pt"]}</span><b>{sum(x["n"] for x in g["itens"])}</b></li>' for g in EQ['grupos'])
    return f'<ul>{rows}</ul>' + ('<p class="small" data-en="Sample list, to be replaced by the real inventory.">Lista de exemplo, a substituir pelo inventário real.</p>' if EQ.get('exemplo') else '')

def book_html(mode):
    go = ('<a class="btn btn--y btn--big" data-go href="primeiro-treino.html"><span data-go-text data-en="Continue to booking">Continuar a marcação</span>' + ICON['arrow'] + '</a>') if mode == 'link' else ''
    return f'''<div class="book" data-book data-mode="{mode}">
  <div class="book-step"><span class="book-k" data-en="1 · Choose the day">1 · Escolha o dia</span><div class="book-days" data-days role="radiogroup" aria-label="Dia" data-en-aria="Day"></div></div>
  <div class="book-step"><span class="book-k" data-en="2 · Choose the time (reception hours)">2 · Escolha a hora (horário da receção)</span><div class="book-slots" data-slots role="radiogroup" aria-label="Hora" data-en-aria="Time"></div></div>
  <div class="book-bar" aria-hidden="true"><div class="bar-track"><i data-bar></i></div><div class="bar-scale"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span></div></div>
  <p class="book-note" data-note aria-live="polite"></p>
  {go}
</div>'''

def team_html():
    roles = [("Receção", "Reception", "desk"), ("Treinadores", "Trainers", "dumbbell"), ("Acompanhamento", "Member support", "users"), ("Gestão", "Management", "user")]
    cards = ''.join(
        f'<article class="team-card rv" style="--d:{i*0.08:.2f}s"><span class="avatar" aria-hidden="true">{ICON[ic]}</span><h3 data-en="{en}">{pt}</h3><p data-en="Name and photo to be added.">Nome e fotografia a acrescentar.</p></article>'
        for i, (pt, en, ic) in enumerate(roles))
    return f'<div class="team-grid">{cards}</div>'

# ---------------------------------------------------------------- substituições
def subst(text):
    rep = {
        '{{tel}}': S['telefone'], '{{tel_e164}}': S['telefone_e164'], '{{wa}}': S['whatsapp'],
        '{{morada}}': S['morada'], '{{cp}}': S['codigo_postal'], '{{plus}}': S['plus_code'],
        '{{ig}}': S['instagram'], '{{rota}}': S['google_rota'], '{{ficha}}': S['google_ficha'],
        '{{mapa}}': S['google_mapa_embed'], '{{nota}}': S['nota'], '{{n}}': str(S['n_avaliacoes']),
        '{{data_av}}': S['avaliacoes_data'], '{{EQ_TOTAL}}': str(eq_total()),
        '{{REC_LINE}}': rec_line(), '{{REC_CORE}}': rec_core(), '{{EQ_LEGEND}}': eq_legend(), '{{BOOK}}': book_html('link'), '{{BOOK_FORM}}': book_html('form'), '{{HOURS}}': hours_html(),
        '{{EQ_SUMMARY}}': eq_summary(), '{{EQ_LIST}}': eq_list(), '{{PORTFOLIO_LINK}}': portfolio_link('uno-link'), '{{EQ_FULL}}': eq_full(), '{{EQ_TAG}}': eq_tag(), '{{RECECAO_TAG}}': rec_tag(), '{{TEAM}}': team_html(),
        '{{PORTEFOLIO}}': S.get('portefolio_url') or '#uno',
    }
    for k, v in rep.items(): text = text.replace(k, v)
    for k, v in ICON.items(): text = text.replace('{{icon:' + k + '}}', v)
    return text

WA_MSG_PT = "Olá! Gostaria de obter mais informações sobre o EVOXFIT Fitness Health Club Maia."
WA_MSG_EN = "Hello! I would like to obtain more information about EVOXFIT Fitness Health Club Maia."

def head(m):
    ld = ''
    if m.get('ldjson'):
        data = {
            "@context": "https://schema.org", "@type": "ExerciseGym", "name": "EVOXFIT Fitness Health Club Maia",
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
<meta name="theme-color" content="#1f1f23">
<meta property="og:type" content="website">
<meta property="og:title" content="{esc(m['title'])}">
<meta property="og:description" content="{esc(m['desc'])}">
<meta property="og:image" content="assets/og.png">
<meta property="og:locale" content="pt_PT">
<link rel="icon" href="assets/img/logo-evoxfit-128.png" type="image/png">
<link rel="preload" href="assets/fonts/archivo-wdth.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add("js-anim")</script>
<link rel="stylesheet" href="assets/css/style.css">
{ld}
</head>'''

# ---------------------------------------------------------------- abertura UNO Studio
PILLS = [("Estratégia", "Strategy"), ("Conteúdo", "Content"), ("Imagem", "Image"), ("Websites", "Websites"), ("Resultados", "Results"), ("Redes sociais", "Social media"), ("Marca", "Brand")]
def _row(rev):
    items = ''.join(f'<span class="uno-pill" data-en="{en}">{pt}</span>' for pt, en in PILLS)
    return f'<div class="uno-row{" rev" if rev else ""}" aria-hidden="true"><div class="uno-track">{items}{items}{items}</div></div>'

UNO = f'''<div class="uno" data-uno role="dialog" aria-label="UNO Studio" aria-modal="true">
  <div class="uno-top"><span class="uno-chip"><b>UNO Studio</b> · <span data-en="Digital marketing">Marketing digital</span></span><button class="uno-skip" type="button" data-uno-skip data-en="Skip">Saltar</button></div>
  <div class="uno-rows">{_row(False)}{_row(True)}{_row(False)}</div>
  <div class="uno-card" data-uno-card>
    <div class="uno-mark" aria-label="UNO">UNO<i></i></div>
    <p class="uno-tag" data-en="Digital marketing studio">Estúdio de marketing digital</p>
    <p class="uno-for" data-en="We created this website for EVOXFIT Fitness Health Club">Criámos este website para o EVOXFIT Fitness Health Club</p>
  </div>
  <div class="uno-bot"><span class="uno-count"><b data-uno-count>000</b>%</span><span class="uno-bar"><i data-uno-bar></i></span></div>
</div>'''

# ---------------------------------------------------------------- cabeçalho, rodapé
LANG = '<div class="lang" role="group" aria-label="Idioma" data-en-aria="Language"><button type="button" data-lang="pt" aria-pressed="true">PT</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>'

def header(active):
    links = '\n'.join(
        f'<a href="{href}"{" aria-current=\"page\"" if key == active else ""} data-en="{en}">{pt}</a>'
        for key, href, pt, en in NAV)
    mlinks = '\n'.join(
        f'<a href="{href}"{" aria-current=\"page\"" if key == active else ""}><span data-en="{en}">{pt}</span>{ICON["arrow"]}</a>'
        for key, href, pt, en in NAV)
    mlinks += f'\n<a href="index.html"><span data-en="Switch gym">Mudar de ginásio</span>{ICON["arrow"]}</a>'
    return f'''<a class="skip" href="#conteudo" data-en="Skip to content">Saltar para o conteúdo</a>
<header class="hdr">
  <div class="hdr-pill">
    {BRAND}
    <nav class="hdr-nav" aria-label="Principal" data-en-aria="Main">
{links}
    </nav>
    <div class="hdr-r">
      {LANG}
      <a class="btn btn--y btn--sm hdr-cta" href="primeiro-treino.html"><span data-en="Book workout">Marcar treino</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-movel" aria-label="Menu" data-en-aria="Menu">{ICON['menu']}</button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="menu-movel" role="dialog" aria-label="Menu" data-en-aria="Menu">
  <div class="sheet-menu">
    <div class="top">
      {BRAND}
      <button class="close-btn" type="button" aria-label="Fechar" data-en-aria="Close">{ICON['close']}</button>
    </div>
    <nav aria-label="Menu" data-en-aria="Menu">
{mlinks}
    </nav>
    <div class="bottom">
      {LANG}
      <a class="btn btn--y" href="tel:{S['telefone_e164']}">{ICON['phone']}<span data-en="Call {S['telefone']}">Ligar {S['telefone']}</span></a>
    </div>
  </div>
</div>'''

def final_cta():
    return f'''<section class="sheet sheet--y final-cta" aria-labelledby="final-titulo">
  <div class="wrap">
    <p class="eyebrow" data-en="First workout">Primeiro treino</p>
    <h2 id="final-titulo" class="rv" data-en="Schedule your first workout.">Agende o seu primeiro treino.</h2>
    <p class="lead rv" data-en="Choose a day and a time within the reception hours. We confirm by message.">Escolha um dia e uma hora dentro do horário da receção. Confirmamos por mensagem.</p>
    <div class="actions rv" style="--d:.1s">
      <a class="btn btn--ink btn--big" href="primeiro-treino.html"><span data-en="Book first workout">Marcar primeiro treino</span>{ICON['arrow']}</a>
      <a class="btn btn--ghost btn--big" href="tel:{S['telefone_e164']}">{ICON['phone']}<span>{S['telefone']}</span></a>
    </div>
  </div>
</section>'''

def portfolio_link(cls='uno-link'):
    url = S.get('portefolio_url') or ''
    if url: return f'<a class="{cls}" href="{url}" target="_blank" rel="noopener" data-en="UNO Studio portfolio">Portefólio UNO Studio</a>'
    return f'<a class="{cls}" href="#uno" data-en="UNO Studio portfolio">Portefólio UNO Studio</a>'

def watermark():
    url = S.get('portefolio_url') or '#uno'
    ext = ' target="_blank" rel="noopener"' if S.get('portefolio_url') else ''
    return f'<a class="uno-wm" href="{url}"{ext} aria-label="Website por UNO Studio" data-en-aria="Website by UNO Studio" title="Website por UNO Studio"><span>UNO</span><i></i></a>'

def footer(active):
    PORT_URL = S.get('portefolio_url') or '#uno'
    PORT_EXT = ' target="_blank" rel="noopener"' if S.get('portefolio_url') else ''
    pages = '\n'.join(f'<li><a href="{href}" data-en="{en}">{pt}</a></li>' for key, href, pt, en in NAV)
    dock = '' if active == 'treino' else (f'<div class="dock" aria-label="Ações rápidas" data-en-aria="Quick actions"><a class="btn btn--ghost call" href="tel:{S["telefone_e164"]}" aria-label="Ligar" data-en-aria="Call">{ICON["phone"]}</a>'
                                           f'<a class="btn btn--y" href="primeiro-treino.html"><span data-en="Book first workout">Marcar primeiro treino</span>{ICON["arrow"]}</a></div>')
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="foot-brand">
        {BRAND}
        <p data-en="WE GOT THIS">WE GOT THIS</p>
        <p class="small">{S['morada']}, {S['codigo_postal']}</p>
      </div>
      <div><h3 data-en="Pages">Páginas</h3><ul>{pages}</ul></div>
      <div><h3 data-en="Contact">Contactos</h3><ul>
        <li><a href="tel:{S['telefone_e164']}" data-en="Call {S['telefone']}">Ligar {S['telefone']}</a></li>
        <li><a href="https://wa.me/{S['whatsapp']}?text={WA_MSG_PT.replace(' ', '%20')}" data-wa="{esc(WA_MSG_PT)}" data-wa-en="{esc(WA_MSG_EN)}" target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="{S['instagram']}" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="{S['google_ficha']}" target="_blank" rel="noopener" data-en="Google reviews">Avaliações no Google</a></li>
        <li><a href="index.html" data-en="Switch gym">Mudar de ginásio</a></li>
      </ul></div>
      <div><h3 data-en="Find us">Onde estamos</h3><ul>
        <li><a href="{S['google_rota']}" target="_blank" rel="noopener" data-en="Get directions">Como chegar</a></li>
        <li><a href="contactos.html" data-en="Opening hours">Horários</a></li>
      </ul></div>
    </div>
    <div class="uno-band" id="uno">
      <span class="uno-big" aria-hidden="true">UNO.</span>
      <div><p class="uno-by"><span data-en="Website created by">Website criado pela</span> <b>UNO Studio</b></p><p class="small" data-en="Digital marketing studio. Strategy, content, image and websites.">Estúdio de marketing digital. Estratégia, conteúdo, imagem e websites.</p></div>
      <a class="btn btn--y btn--sm" href="{PORT_URL}"{PORT_EXT} data-en="See our portfolio">Ver o nosso portefólio</a>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> EVOXFIT Fitness Health Club Maia · <span data-en="3D scenes are illustrative; photos and posters belong to EVOXFIT.">Cenas 3D ilustrativas; fotografias e cartazes são da EVOXFIT.</span></span>
      {portfolio_link()}
    </div>
  </div>
</footer>
{dock}
<script src="assets/js/config.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/anim.js" defer></script>
<script src="assets/js/agendar.js" defer></script>'''

# ---------------------------------------------------------------- galerias (fotografias reais)
def _imgs():
    base = os.path.join(OUT, 'assets', 'img')
    return sorted(glob.glob(os.path.join(base, 'evox-*.jpg')) + glob.glob(os.path.join(base, 'gym-*.jpg')))

LIGHTBOX = '''<div class="lightbox" role="dialog" aria-modal="true" aria-label="Fotografia" data-en-aria="Photo"><img alt=""><button class="lb-close" type="button" aria-label="Fechar" data-en-aria="Close">{{icon:close}}</button><button class="lb-prev" type="button" aria-label="Anterior" data-en-aria="Previous">{{icon:left}}</button><button class="lb-next" type="button" aria-label="Seguinte" data-en-aria="Next">{{icon:right}}</button></div>'''

ALTS = {
 'evox-01': ('Treinador EVOXFIT com t-shirt da marca, no ginásio.', 'EVOXFIT coach wearing the brand t-shirt, in the gym.'),
 'evox-02': ('Vista geral da sala de treino EVOXFIT, com zonas de máquinas e pesos livres.', 'Overview of the EVOXFIT training floor, with machine and free-weight areas.'),
 'evox-03': ('Treino assistido numa máquina de peito, num ginásio EVOXFIT.', 'Assisted workout on a chest press machine at an EVOXFIT gym.'),
 'evox-04': ('Sócia a treinar pernas com halteres no ginásio EVOXFIT.', 'Member training legs with dumbbells at the EVOXFIT gym.'),
 'evox-05': ('Equipa e sócios EVOXFIT juntos na sala de treino.', 'EVOXFIT team and members together on the training floor.'),
 'evox-06': ('Sócio a treinar bíceps com haltere no ginásio EVOXFIT.', 'Member training biceps with a dumbbell at the EVOXFIT gym.'),
 'evox-07': ('Personal trainer EVOXFIT a limpar o equipamento, em ambiente de treino.', 'EVOXFIT personal trainer cleaning equipment on the gym floor.'),
}

def _photo_buttons(imgs):
    out = []
    for p in imgs:
        rel = os.path.relpath(p, OUT).replace(os.sep, '/')
        key = os.path.splitext(os.path.basename(p))[0]
        pt, en = ALTS.get(key, ('EVOXFIT Fitness Health Club Maia', 'EVOXFIT Fitness Health Club Maia'))
        try:
            from PIL import Image
            with Image.open(p) as im: w, h = im.size
        except Exception:
            w, h = 4, 5
        out.append(f'<button type="button" data-full="{rel}" style="--ar:{w}/{h}" aria-label="Ver fotografia" data-en-aria="View photo"><img src="{rel}" alt="{pt}" data-en-alt="{en}" width="{w}" height="{h}" loading="lazy" decoding="async"></button>')
    return out

def gallery_html():
    return fotos_html()

def fotos_html():
    imgs = _imgs()
    if not imgs:
        print('AVISO: sem fotografias reais em assets/img/evox-*.jpg ou gym-*.jpg — a galeria não é mostrada.')
        return ''
    items = '\n'.join(_photo_buttons(imgs))
    return f'''<section class="sheet sheet--2 photos" aria-labelledby="fotos-titulo">
  <div class="wrap head">
    <div>
      <p class="eyebrow" data-en="Gallery">Galeria</p>
      <h2 id="fotos-titulo" data-en="The EVOXFIT <span class='y'>world.</span>">O mundo <span class="y">EVOXFIT.</span></h2>
    </div>
    <div class="strip-ctl">
      <button type="button" data-strip-prev aria-label="Anterior" data-en-aria="Previous">{ICON['left']}</button>
      <button type="button" data-strip-next aria-label="Seguinte" data-en-aria="Next">{ICON['right']}</button>
    </div>
  </div>
  <div class="strip" data-strip data-photos>
{items}
  </div>
</section>
{LIGHTBOX}'''

def write_config_js():
    cfg = {"nome": S['nome'], "wa": S['whatsapp'], "tel": S['telefone_e164'], "telDisplay": S['telefone'],
           "rota": S['google_rota'], "ig": S['instagram'], "rececao": REC['dias'], "rececaoExemplo": bool(REC.get('exemplo')),
           "rececaoNota": {"pt": REC.get('nota_pt', ''), "en": REC.get('nota_en', '')},
           "equip": [{"id": g["id"], "n": sum(x["n"] for x in g["itens"])} for g in EQ["grupos"]], "nota": rating_num(), "avaliacoes": S["n_avaliacoes"]}
    with open(os.path.join(OUT, 'assets', 'js', 'config.js'), 'w', encoding='utf-8') as f:
        f.write('/* Gerado por _fonte/build.py a partir de _fonte/site.json — não editar à mão */\nwindow.EVOX = ' + json.dumps(cfg, ensure_ascii=False) + ';\n')

def build():
    write_config_js()
    gal = gallery_html(); fotos = fotos_html()
    for path in sorted(glob.glob(os.path.join(HERE, 'pages', '*.html'))):
        src = open(path, encoding='utf-8').read()
        m = re.match(r'<!--(\{.*?\})-->\s*', src, re.S)
        meta = json.loads(m.group(1)); body = src[m.end():]
        body = body.replace('{{GALERIA}}', gal).replace('{{FOTOS}}', fotos)
        intro = UNO if meta.get('intro') else ''
        if meta.get('bare'):
            page = (head(meta) + f'\n<body class="{meta.get("body", "page-inner")}">\n' + intro + body + '\n'
                    + '\n<script src="assets/js/config.js"></script>\n<script src="assets/js/main.js"></script>\n</body>\n</html>\n')
        else:
            page = (head(meta) + f'\n<body class="{meta.get("body", "page-inner")} page-{meta["nav"]}">\n' + intro + header(meta['nav'])
                    + '\n<main id="conteudo">\n' + body + '\n</main>\n'
                    + (final_cta() if meta.get('cta', True) else '') + '\n' + footer(meta['nav']) + meta.get('extra_js', '') + '\n</body>\n</html>\n')
        page = subst(page)
        open(os.path.join(OUT, meta['file']), 'w', encoding='utf-8').write(page)
        print('ok', meta['file'])

if __name__ == '__main__':
    build()
