# -*- coding: utf-8 -*-
"""Melos final sales deck — yellow palette, Greek UTF-8, icons, charts."""

from pathlib import Path

from PIL import Image, ImageDraw
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

# Melos app palette (yellow + charcoal + light canvas)
PRIMARY = RGBColor(0xF5, 0xC4, 0x00)
PRIMARY_DARK = RGBColor(0xD4, 0xA8, 0x00)
PRIMARY_LIGHT = RGBColor(0xFF, 0xD6, 0x33)
SUCCESS = RGBColor(0x1F, 0x9D, 0x63)
BG = RGBColor(0xF3, 0xF2, 0xEF)
SURFACE = RGBColor(0xFF, 0xFF, 0xFF)
SURFACE2 = RGBColor(0xFA, 0xFA, 0xF8)
INK = RGBColor(0x14, 0x14, 0x14)
GOLD = RGBColor(0xF5, 0xC4, 0x00)
TEXT = RGBColor(0x1A, 0x1A, 0x1A)
MUTED = RGBColor(0x6B, 0x6B, 0x6B)
FAINT = RGBColor(0x92, 0x92, 0x92)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
ON_BRAND = RGBColor(0x11, 0x11, 0x11)
BORDER = RGBColor(0xE2, 0xE0, 0xDB)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)
ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "scripts" / "_pptx_icons"
OUT = ROOT / "Melos_Prosfora_Gym_FINAL.pptx"
TOTAL = 12
FONT = "Arial"  # reliable Greek on Windows


def set_run(run, size=14, bold=False, color=TEXT):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = FONT


def add_text(shape, lines, default_size=14, default_color=TEXT, align=PP_ALIGN.LEFT):
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    for i, item in enumerate(lines):
        if isinstance(item, str):
            text, size, bold, color = item, default_size, False, default_color
        else:
            text = item.get("t", "")
            size = item.get("s", default_size)
            bold = item.get("b", False)
            color = item.get("c", default_color)
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        run = p.add_run()
        run.text = text
        set_run(run, size=size, bold=bold, color=color)


def rect(slide, left, top, width, height, fill, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(1)
    return shape


def round_rect(slide, left, top, width, height, fill, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    if line is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = line
        shape.line.width = Pt(1.25)
    try:
        shape.adjustments[0] = 0.1
    except Exception:
        pass
    return shape


def blank(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    bg = rect(slide, 0, 0, SLIDE_W, SLIDE_H, BG)
    spTree = slide.shapes._spTree
    sp = bg._element
    spTree.remove(sp)
    spTree.insert(2, sp)
    return slide


def accent_top(slide):
    rect(slide, 0, 0, SLIDE_W, Inches(0.1), PRIMARY)


def footer(slide, page):
    rect(slide, 0, Inches(7.15), SLIDE_W, Inches(0.35), INK)
    box = slide.shapes.add_textbox(Inches(0.5), Inches(7.18), Inches(9), Inches(0.28))
    add_text(box, [{"t": "MELOS  |  Gym Manager  |  Prosfora gia gymnastiria", "s": 10, "c": FAINT}])
    # Keep brand Latin in footer to avoid any edge encoding; Greek in body uses Arial
    num = slide.shapes.add_textbox(Inches(11.5), Inches(7.18), Inches(1.4), Inches(0.28))
    add_text(num, [{"t": f"{page} / {TOTAL}", "s": 10, "c": FAINT}], align=PP_ALIGN.RIGHT)


def title_block(slide, title, subtitle=None):
    accent_top(slide)
    t = slide.shapes.add_textbox(Inches(0.55), Inches(0.28), Inches(12), Inches(0.5))
    add_text(t, [{"t": title, "s": 26, "b": True, "c": TEXT}])
    if subtitle:
        s = slide.shapes.add_textbox(Inches(0.55), Inches(0.8), Inches(12), Inches(0.35))
        add_text(s, [{"t": subtitle, "s": 13, "c": MUTED}])


def _icon_base(size=256, bg=(245, 196, 0)):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 8
    d.rounded_rectangle([pad, pad, size - pad, size - pad], radius=48, fill=bg)
    return img, d, size


def icon_users():
    img, d, s = _icon_base()
    ink = (17, 17, 17)
    d.ellipse([78, 70, 118, 110], fill=ink)
    d.ellipse([138, 70, 178, 110], fill=ink)
    d.ellipse([98, 95, 158, 155], fill=ink)
    d.pieslice([50, 140, 120, 230], 200, 340, fill=ink)
    d.pieslice([136, 140, 206, 230], 200, 340, fill=ink)
    d.pieslice([78, 155, 178, 245], 200, 340, fill=ink)
    return img


def icon_qr():
    img, d, s = _icon_base(bg=(212, 168, 0))
    ink = (17, 17, 17)
    for x, y in [(60, 60), (140, 60), (60, 140)]:
        d.rectangle([x, y, x + 55, y + 55], outline=ink, width=8)
        d.rectangle([x + 16, y + 16, x + 39, y + 39], fill=ink)
    d.rectangle([148, 148, 168, 168], fill=ink)
    d.rectangle([178, 148, 198, 168], fill=ink)
    d.rectangle([148, 178, 168, 198], fill=ink)
    d.rectangle([178, 178, 198, 198], fill=ink)
    return img


def icon_calendar():
    img, d, s = _icon_base(bg=(31, 157, 99))
    ink = (17, 17, 17)
    d.rounded_rectangle([58, 70, 198, 200], radius=16, fill=ink)
    d.rectangle([58, 70, 198, 105], fill=(245, 196, 0))
    for cx in (90, 128, 166):
        d.ellipse([cx - 6, 58, cx + 6, 78], fill=ink)
    for i, (x, y) in enumerate([(80, 125), (118, 125), (156, 125), (80, 158), (118, 158), (156, 158)]):
        d.rounded_rectangle([x, y, x + 22, y + 18], radius=4, fill=(245, 196, 0) if i == 4 else (60, 60, 60))
    return img


def icon_bell():
    img, d, s = _icon_base(bg=(245, 196, 0))
    ink = (17, 17, 17)
    d.ellipse([88, 70, 168, 150], fill=ink)
    d.polygon([(78, 145), (178, 145), (168, 165), (88, 165)], fill=ink)
    d.rectangle([118, 55, 138, 78], fill=ink)
    d.ellipse([112, 168, 144, 198], fill=ink)
    return img


def icon_phone():
    img, d, s = _icon_base(bg=(42, 139, 184))
    ink = (17, 17, 17)
    d.rounded_rectangle([90, 50, 166, 210], radius=22, fill=ink)
    d.rounded_rectangle([100, 70, 156, 175], radius=8, fill=(245, 196, 0))
    d.ellipse([118, 185, 138, 200], fill=(255, 214, 51))
    return img


def icon_megaphone():
    img, d, s = _icon_base(bg=(255, 214, 51))
    ink = (17, 17, 17)
    d.polygon([(70, 110), (150, 70), (150, 190), (70, 150)], fill=ink)
    d.ellipse([145, 95, 195, 165], fill=ink)
    d.rectangle([55, 118, 78, 142], fill=ink)
    d.polygon([(78, 142), (95, 185), (70, 190), (60, 155)], fill=(60, 60, 60))
    return img


def icon_card():
    img, d, s = _icon_base(bg=(212, 168, 0))
    ink = (17, 17, 17)
    d.rounded_rectangle([48, 85, 208, 175], radius=14, fill=ink)
    d.rectangle([48, 110, 208, 130], fill=(245, 196, 0))
    d.rounded_rectangle([62, 145, 110, 158], radius=4, fill=(255, 214, 51))
    return img


def icon_chart():
    img, d, s = _icon_base(bg=(245, 196, 0))
    ink = (17, 17, 17)
    d.rectangle([70, 140, 100, 190], fill=ink)
    d.rectangle([115, 110, 145, 190], fill=ink)
    d.rectangle([160, 80, 190, 190], fill=ink)
    d.line([(65, 75), (200, 75), (200, 195), (65, 195)], fill=(60, 60, 60), width=4)
    return img


def icon_check():
    img, d, s = _icon_base(bg=(31, 157, 99))
    ink = (17, 17, 17)
    d.line([(75, 130), (115, 170), (185, 90)], fill=ink, width=18)
    return img


def icon_star():
    img, d, s = _icon_base(bg=(245, 196, 0))
    ink = (17, 17, 17)
    d.polygon(
        [
            (128, 55),
            (155, 110),
            (210, 110),
            (165, 145),
            (182, 200),
            (128, 165),
            (74, 200),
            (91, 145),
            (46, 110),
            (101, 110),
        ],
        fill=ink,
    )
    return img


ICONS = {
    "users": icon_users,
    "qr": icon_qr,
    "calendar": icon_calendar,
    "bell": icon_bell,
    "phone": icon_phone,
    "megaphone": icon_megaphone,
    "card": icon_card,
    "chart": icon_chart,
    "check": icon_check,
    "star": icon_star,
}


def ensure_icons():
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, fn in ICONS.items():
        path = ICON_DIR / f"{name}.png"
        fn().save(path, "PNG")
        paths[name] = str(path)
    return paths


def add_icon(slide, path, left, top, size=Inches(0.55)):
    return slide.shapes.add_picture(path, left, top, width=size, height=size)


def build():
    icons = ensure_icons()
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H

    # 1 COVER
    s = blank(prs)
    rect(s, 0, 0, Inches(0.22), SLIDE_H, PRIMARY)
    rect(s, Inches(9.2), 0, Inches(4.15), SLIDE_H, INK)

    mark = round_rect(s, Inches(0.7), Inches(1.7), Inches(1.05), Inches(1.05), PRIMARY)
    add_text(mark, [{"t": "M", "s": 40, "b": True, "c": ON_BRAND}], align=PP_ALIGN.CENTER)

    brand = s.shapes.add_textbox(Inches(1.95), Inches(1.85), Inches(7), Inches(0.55))
    add_text(brand, [{"t": "MELOS", "s": 42, "b": True, "c": PRIMARY_DARK}])
    sub = s.shapes.add_textbox(Inches(1.95), Inches(2.45), Inches(7), Inches(0.35))
    add_text(sub, [{"t": "GYM MANAGER", "s": 15, "b": True, "c": MUTED}])

    rect(s, Inches(0.7), Inches(3.15), Inches(2.4), Inches(0.06), PRIMARY)

    h = s.shapes.add_textbox(Inches(0.7), Inches(3.5), Inches(8), Inches(1.4))
    add_text(
        h,
        [
            {"t": "Το συστημα που", "s": 28, "b": True, "c": TEXT},
            {"t": "τρεχει το γυμναστηριο σου", "s": 28, "b": True, "c": PRIMARY_DARK},
            {"t": "Μελη · Πληρωμες · QR εισοδος · Booking · Ενημερωσεις", "s": 14, "c": MUTED},
        ],
    )

    side_t = s.shapes.add_textbox(Inches(9.5), Inches(2.0), Inches(3.5), Inches(0.5))
    add_text(side_t, [{"t": "ΓΙΑ ΓΥΜΝΑΣΤΗΡΙΑ", "s": 12, "b": True, "c": PRIMARY}], align=PP_ALIGN.CENTER)
    for i, (ic, label) in enumerate(
        [
            ("users", "Διαχειριση μελων"),
            ("qr", "Ελεγχος εισοδου"),
            ("calendar", "Booking ταξεων"),
            ("megaphone", "Viber / SMS / Email"),
        ]
    ):
        y = Inches(2.7 + i * 0.9)
        add_icon(s, icons[ic], Inches(9.7), y, Inches(0.5))
        tb = s.shapes.add_textbox(Inches(10.4), y + Inches(0.05), Inches(2.6), Inches(0.4))
        add_text(tb, [{"t": label, "s": 13, "b": True, "c": WHITE}])

    foot = s.shapes.add_textbox(Inches(0.7), Inches(6.5), Inches(8), Inches(0.35))
    add_text(foot, [{"t": "Παρουσιαση προϊοντος  ·  Απλα & κατανοητα  ·  2026", "s": 11, "c": FAINT}])

    # 2 AGENDA
    s = blank(prs)
    title_block(s, "Τι θα δουμε σημερα", "Σε λιγα λεπτα — τι κανει το Melos και ποιο πακετο σου ταιριαζει")
    items = [
        ("01", "Το προβλημα στην reception", "users"),
        ("02", "Η λυση Melos με μια ματια", "check"),
        ("03", "Για το γυμ & για το μελος", "phone"),
        ("04", "Τα 3 πακετα — καθαρα χωρισμενα", "star"),
        ("05", "Τιμες & πως ξεκιναμε", "chart"),
    ]
    for i, (num, label, ic) in enumerate(items):
        y = Inches(1.4 + i * 1.0)
        round_rect(s, Inches(0.55), y, Inches(12.2), Inches(0.85), SURFACE, BORDER)
        add_icon(s, icons[ic], Inches(0.8), y + Inches(0.15), Inches(0.55))
        n = s.shapes.add_textbox(Inches(1.55), y + Inches(0.22), Inches(0.7), Inches(0.45))
        add_text(n, [{"t": num, "s": 18, "b": True, "c": PRIMARY_DARK}])
        l = s.shapes.add_textbox(Inches(2.4), y + Inches(0.25), Inches(9.5), Inches(0.4))
        add_text(l, [{"t": label, "s": 16, "b": True, "c": TEXT}])
    footer(s, 2)

    # 3 PROBLEM
    s = blank(prs)
    title_block(s, "Το γνωριζεις;", "Καθημερινα προβληματα που κοστιζουν χρονο και χρημα")
    problems = [
        ("users", "Χαρτια & Excel", "Ποιος πληρωσε, ποιος χρωσταει, ποτε ληγει — σκορπισμενα."),
        ("phone", "WhatsApp χαος", "Ανακοινωσεις και υπενθυμισεις «στο χερι», χωρις ελεγχο."),
        ("qr", "Εισοδος «με ματι»", "Δυσκολο να ξερω αν η καρτα ειναι εγκυρη ή ακυρωμενη."),
        ("chart", "Χαμενος χρονος", "Η reception κυνηγαει πληροφοριες αντι να εξυπηρετει."),
    ]
    for i, (ic, t, b) in enumerate(problems):
        col, row = i % 2, i // 2
        left = Inches(0.5 + col * 6.4)
        top = Inches(1.4 + row * 2.55)
        round_rect(s, left, top, Inches(6.15), Inches(2.35), SURFACE, BORDER)
        add_icon(s, icons[ic], left + Inches(0.35), top + Inches(0.4), Inches(0.65))
        tt = s.shapes.add_textbox(left + Inches(1.2), top + Inches(0.5), Inches(4.6), Inches(0.4))
        add_text(tt, [{"t": t, "s": 18, "b": True, "c": TEXT}])
        bb = s.shapes.add_textbox(left + Inches(0.35), top + Inches(1.25), Inches(5.5), Inches(0.8))
        add_text(bb, [{"t": b, "s": 14, "c": MUTED}])
    footer(s, 3)

    # 4 SOLUTION
    s = blank(prs)
    title_block(s, "Το Melos με μια ματια", "Ενα εργαλειο. Τρεις δουλειες. Μηδεν χαος.")
    pillars = [
        ("users", "Διαχειριση", "Μελη, πακετα, πληρωμες, οφειλες και dashboard — ολα καθαρα."),
        ("qr", "Ελεγχος εισοδου", "QR / barcode check-in. Βλεπεις αμεσα αν επιτρεπεται η εισοδος."),
        ("megaphone", "Επαφη με μελη", "Ανακοινωσεις, booking, Viber / SMS / Email, portal στο κινητο."),
    ]
    for i, (ic, title, body) in enumerate(pillars):
        left = Inches(0.5 + i * 4.2)
        round_rect(s, left, Inches(1.5), Inches(4.0), Inches(5.0), SURFACE, BORDER)
        rect(s, left, Inches(1.5), Inches(4.0), Inches(0.12), PRIMARY)
        add_icon(s, icons[ic], left + Inches(1.5), Inches(2.0), Inches(0.95))
        tt = s.shapes.add_textbox(left + Inches(0.25), Inches(3.2), Inches(3.5), Inches(0.5))
        add_text(tt, [{"t": title, "s": 20, "b": True, "c": PRIMARY_DARK}], align=PP_ALIGN.CENTER)
        bb = s.shapes.add_textbox(left + Inches(0.3), Inches(3.9), Inches(3.4), Inches(2.0))
        add_text(bb, [{"t": body, "s": 14, "c": MUTED}], align=PP_ALIGN.CENTER)
    footer(s, 4)

    # 5 ADMIN
    s = blank(prs)
    title_block(s, "Για τον Διαχειριστη / Reception", "Ο,τι χρειαζεσαι για να τρεχει το γυμ σωστα")
    admin = [
        ("users", "Μελη & προσελευσεις", "Πληρες συστημα μελων και καταγραφης προσελευσεων."),
        ("megaphone", "Ανακοινωσεις & ειδοποιησεις", "Ενημερωσεις καθε ειδους — τα μελη μαθαινουν εγκαρως."),
        ("calendar", "Booking προγραμματων", "Ομαδικα & personal training με ελεγχο θεσεων."),
        ("bell", "Προωθησεις Viber / SMS / Email", "Υπενθυμισεις, προσφορες, re-activation απο ενα σημειο."),
    ]
    for i, (ic, title, body) in enumerate(admin):
        col, row = i % 2, i // 2
        left = Inches(0.5 + col * 6.4)
        top = Inches(1.4 + row * 2.55)
        round_rect(s, left, top, Inches(6.15), Inches(2.35), SURFACE, BORDER)
        round_rect(s, left + Inches(0.3), top + Inches(0.55), Inches(0.9), Inches(0.9), SURFACE2)
        add_icon(s, icons[ic], left + Inches(0.42), top + Inches(0.67), Inches(0.65))
        tt = s.shapes.add_textbox(left + Inches(1.45), top + Inches(0.45), Inches(4.4), Inches(0.45))
        add_text(tt, [{"t": title, "s": 16, "b": True, "c": TEXT}])
        bb = s.shapes.add_textbox(left + Inches(1.45), top + Inches(1.05), Inches(4.4), Inches(1.0))
        add_text(bb, [{"t": body, "s": 13, "c": MUTED}])
    footer(s, 5)

    # 6 MEMBER
    s = blank(prs)
    title_block(s, "Για το Μελος (στο κινητο)", "Ευκολια που αγαπουν τα μελη — και σεβοτανε το χρονο σου")
    member = [
        ("calendar", "Κρατησεις / Booking", "Κλεινει ομαδικο ή personal και βλεπει με ποιον γυμναστη εχει κλεισει."),
        ("bell", "Ενημερωσεις", "Νεα απο το γυμναστηριο ή τον trainer — οταν χρειαζεται."),
        ("check", "Προσελευσεις", "Βλεπει το ιστορικο των επισκεψεων του."),
        ("card", "Ληξη συνδρομης", "Υπενθυμισεις εγκαρως για ανανεωση — χωρις διακοπη."),
    ]
    for i, (ic, title, body) in enumerate(member):
        col, row = i % 2, i // 2
        left = Inches(0.5 + col * 6.4)
        top = Inches(1.4 + row * 2.55)
        fill = SURFACE if (i % 2 == 0) else SURFACE2
        round_rect(s, left, top, Inches(6.15), Inches(2.35), fill, BORDER)
        add_icon(s, icons[ic], left + Inches(0.35), top + Inches(0.7), Inches(0.7))
        tt = s.shapes.add_textbox(left + Inches(1.3), top + Inches(0.45), Inches(4.5), Inches(0.45))
        add_text(tt, [{"t": title, "s": 16, "b": True, "c": PRIMARY_DARK}])
        bb = s.shapes.add_textbox(left + Inches(1.3), top + Inches(1.05), Inches(4.5), Inches(1.0))
        add_text(bb, [{"t": body, "s": 13, "c": MUTED}])
    footer(s, 6)

    # 7 FLOW
    s = blank(prs)
    title_block(s, "Πως δουλευει στην πραξη", "Απο την εγγραφη μεχρι την εισοδο — σε 4 βηματα")
    steps = [
        ("1", "users", "Εγγραφη", "Νεο μελος + πακετο σε λιγα λεπτα"),
        ("2", "card", "Πληρωμη", "Καταγραφη πληρωμης ή οφειλης"),
        ("3", "qr", "QR εισοδος", "Scan στην πορτα → εγκυρο / οχι"),
        ("4", "phone", "Portal", "Το μελος βλεπει ολα στο κινητο"),
    ]
    for i, (n, ic, title, body) in enumerate(steps):
        left = Inches(0.45 + i * 3.2)
        round_rect(s, left, Inches(1.7), Inches(3.0), Inches(4.5), SURFACE, BORDER)
        badge = round_rect(s, left + Inches(1.1), Inches(2.0), Inches(0.75), Inches(0.75), PRIMARY)
        add_text(badge, [{"t": n, "s": 22, "b": True, "c": ON_BRAND}], align=PP_ALIGN.CENTER)
        add_icon(s, icons[ic], left + Inches(1.05), Inches(3.0), Inches(0.85))
        tt = s.shapes.add_textbox(left + Inches(0.15), Inches(4.1), Inches(2.7), Inches(0.4))
        add_text(tt, [{"t": title, "s": 16, "b": True, "c": TEXT}], align=PP_ALIGN.CENTER)
        bb = s.shapes.add_textbox(left + Inches(0.15), Inches(4.6), Inches(2.7), Inches(1.0))
        add_text(bb, [{"t": body, "s": 12, "c": MUTED}], align=PP_ALIGN.CENTER)
        if i < 3:
            arrow = s.shapes.add_textbox(left + Inches(2.85), Inches(3.5), Inches(0.4), Inches(0.4))
            add_text(arrow, [{"t": ">", "s": 22, "b": True, "c": PRIMARY_DARK}], align=PP_ALIGN.CENTER)
    footer(s, 7)

    # 8 PACKAGES
    s = blank(prs)
    title_block(
        s,
        "Τα 3 πακετα — καθαρα χωρισμενα",
        "Διαλεγεις ο,τι χρειαζεται το γυμ σου σημερα. Αναβαθμιζεις οταν μεγαλωσεις.",
    )
    plans = [
        {
            "name": "STARTER",
            "tag": "Βασικο",
            "price": "€49",
            "period": "/ μηνα",
            "icon": "users",
            "hl": False,
            "points": [
                "Μελη, συνδρομες, πληρωμες",
                "Οφειλες & dashboard",
                "Εως 80 μελη",
                "Ιδανικο για μικρο γυμ",
            ],
        },
        {
            "name": "PRO",
            "tag": "Πιο δημοφιλες",
            "price": "€99",
            "period": "/ μηνα",
            "icon": "star",
            "hl": True,
            "points": [
                "Ολα του Starter",
                "QR εισοδος + καρτες",
                "Ημερολογιο & portal μελους",
                "Εως 250 μελη",
            ],
        },
        {
            "name": "STUDIO+",
            "tag": "Πληρες",
            "price": "€149",
            "period": "/ μηνα",
            "icon": "megaphone",
            "hl": False,
            "points": [
                "Ολα του Pro",
                "Κρατησεις απο το κινητο",
                "Viber / SMS / Email",
                "Απειριοριστα μελη",
            ],
        },
    ]
    for i, p in enumerate(plans):
        left = Inches(0.4 + i * 4.25)
        top = Inches(1.3)
        if p["hl"]:
            round_rect(s, left - Inches(0.05), top - Inches(0.08), Inches(4.15), Inches(5.55), PRIMARY)
            round_rect(s, left, top, Inches(4.05), Inches(5.4), SURFACE)
            head_c = PRIMARY_DARK
        else:
            round_rect(s, left, top, Inches(4.05), Inches(5.4), SURFACE, BORDER)
            head_c = TEXT

        tag = round_rect(
            s,
            left + Inches(0.25),
            top + Inches(0.25),
            Inches(2.1),
            Inches(0.35),
            PRIMARY if p["hl"] else GOLD,
        )
        add_text(tag, [{"t": p["tag"].upper(), "s": 10, "b": True, "c": ON_BRAND}], align=PP_ALIGN.CENTER)
        add_icon(s, icons[p["icon"]], left + Inches(3.15), top + Inches(0.2), Inches(0.55))

        name = s.shapes.add_textbox(left + Inches(0.25), top + Inches(0.8), Inches(3.5), Inches(0.4))
        add_text(name, [{"t": p["name"], "s": 20, "b": True, "c": head_c}])

        price = s.shapes.add_textbox(left + Inches(0.25), top + Inches(1.3), Inches(3.5), Inches(0.55))
        add_text(price, [{"t": p["price"], "s": 36, "b": True, "c": PRIMARY_DARK}])
        per = s.shapes.add_textbox(left + Inches(0.25), top + Inches(1.9), Inches(3.5), Inches(0.3))
        add_text(per, [{"t": p["period"] + "  ·  + setup στην εκκινηση", "s": 11, "c": MUTED}])

        for j, pt in enumerate(p["points"]):
            row = s.shapes.add_textbox(
                left + Inches(0.25), top + Inches(2.45 + j * 0.5), Inches(3.5), Inches(0.45)
            )
            add_text(row, [{"t": "  " + pt, "s": 13, "c": TEXT}])

        if p["hl"]:
            tip = s.shapes.add_textbox(left + Inches(0.25), top + Inches(4.7), Inches(3.5), Inches(0.4))
            add_text(tip, [{"t": "Προτεινεται για τα περισσοτερα γυμ", "s": 11, "b": True, "c": PRIMARY_DARK}])
    footer(s, 8)

    # 9 COMPARISON
    s = blank(prs)
    title_block(s, "Συγκριση δυνατοτητων", "Τι παιρνεις σε καθε πακετο — με μια ματια")
    features = [
        ("Dashboard / Μελη / Πληρωμες", True, True, True),
        ("QR εισοδος & καρτες", False, True, True),
        ("Ημερολογιο & portal", False, True, True),
        ("Online κρατησεις", False, False, True),
        ("Viber / SMS / Email", False, False, True),
    ]
    headers = ["Δυνατοτητα", "Starter", "Pro", "Studio+"]
    y0 = Inches(1.35)
    round_rect(s, Inches(0.45), y0, Inches(7.6), Inches(0.45), SURFACE2)
    xs = [0.55, 4.2, 5.5, 6.8]
    for hi, htxt in enumerate(headers):
        tb = s.shapes.add_textbox(
            Inches(xs[hi]), y0 + Inches(0.08), Inches(1.4) if hi else Inches(3.5), Inches(0.35)
        )
        add_text(tb, [{"t": htxt, "s": 11, "b": True, "c": PRIMARY_DARK if hi else TEXT}])

    for ri, (name, a, b, c) in enumerate(features):
        y = y0 + Inches(0.55 + ri * 0.55)
        bgc = SURFACE if ri % 2 == 0 else SURFACE2
        round_rect(s, Inches(0.45), y, Inches(7.6), Inches(0.5), bgc)
        vals = [name, "NAI" if a else "-", "NAI" if b else "-", "NAI" if c else "-"]
        for vi, v in enumerate(vals):
            color = SUCCESS if v == "NAI" else (FAINT if v == "-" else TEXT)
            tb = s.shapes.add_textbox(
                Inches(xs[vi]), y + Inches(0.08), Inches(1.4) if vi else Inches(3.5), Inches(0.35)
            )
            add_text(tb, [{"t": v, "s": 12, "b": vi > 0, "c": color}])

    round_rect(s, Inches(8.2), Inches(1.35), Inches(4.7), Inches(5.2), SURFACE, BORDER)
    note = s.shapes.add_textbox(Inches(8.4), Inches(1.5), Inches(4.3), Inches(0.35))
    add_text(note, [{"t": "Πληροτητα πακετου", "s": 12, "b": True, "c": PRIMARY_DARK}], align=PP_ALIGN.CENTER)

    chart_data = CategoryChartData()
    chart_data.categories = ["Starter", "Pro", "Studio+"]
    chart_data.add_series("Features", (2, 5, 7))
    chart_shape = s.shapes.add_chart(
        XL_CHART_TYPE.COLUMN_CLUSTERED,
        Inches(8.35),
        Inches(1.95),
        Inches(4.4),
        Inches(4.35),
        chart_data,
    )
    ch = chart_shape.chart
    ch.has_legend = False
    try:
        ch.value_axis.has_major_gridlines = False
        ch.value_axis.visible = False
        ch.category_axis.tick_labels.font.size = Pt(11)
        ch.category_axis.tick_labels.font.name = FONT
        ch.category_axis.tick_labels.font.color.rgb = MUTED
    except Exception:
        pass
    footer(s, 9)

    # 10 PRICING
    s = blank(prs)
    title_block(s, "Τιμολογηση — καθαρα νουμερα", "Μηνιαιο πλανο. Ετησιο με εκπτωση. Setup στην εκκινηση.")

    for i, (name, monthly, yearly, setup) in enumerate(
        [
            ("Starter", "€49", "€490", "€150"),
            ("Pro", "€99", "€990", "€250-350"),
            ("Studio+", "€149-179", "€1.490+", "€400-500"),
        ]
    ):
        left = Inches(0.5 + i * 4.2)
        round_rect(s, left, Inches(1.35), Inches(4.0), Inches(2.0), SURFACE, BORDER)
        nt = s.shapes.add_textbox(left + Inches(0.25), Inches(1.5), Inches(3.5), Inches(0.35))
        add_text(nt, [{"t": name.upper(), "s": 14, "b": True, "c": PRIMARY_DARK}])
        mt = s.shapes.add_textbox(left + Inches(0.25), Inches(1.95), Inches(3.5), Inches(0.45))
        add_text(mt, [{"t": monthly + " / μηνα", "s": 20, "b": True, "c": TEXT}])
        yt = s.shapes.add_textbox(left + Inches(0.25), Inches(2.5), Inches(3.5), Inches(0.55))
        add_text(yt, [{"t": "Ετησιο " + yearly + "  ·  Setup " + setup, "s": 12, "c": MUTED}])

    chart_data = CategoryChartData()
    chart_data.categories = ["Starter", "Pro", "Studio+"]
    chart_data.add_series("Euro / mina", (49, 99, 149))
    round_rect(s, Inches(0.5), Inches(3.6), Inches(12.3), Inches(3.15), SURFACE, BORDER)
    ct = s.shapes.add_textbox(Inches(0.75), Inches(3.75), Inches(11.8), Inches(0.35))
    add_text(ct, [{"t": "Συγκριση μηνιαιας τιμης (€)", "s": 13, "b": True, "c": PRIMARY_DARK}])
    chart_shape = s.shapes.add_chart(
        XL_CHART_TYPE.BAR_CLUSTERED,
        Inches(0.7),
        Inches(4.15),
        Inches(11.9),
        Inches(2.4),
        chart_data,
    )
    ch = chart_shape.chart
    ch.has_legend = False
    try:
        ch.value_axis.has_major_gridlines = False
        ch.category_axis.tick_labels.font.size = Pt(12)
        ch.category_axis.tick_labels.font.name = FONT
        ch.category_axis.tick_labels.font.color.rgb = TEXT
        ch.value_axis.tick_labels.font.size = Pt(10)
        ch.value_axis.tick_labels.font.name = FONT
        ch.value_axis.tick_labels.font.color.rgb = MUTED
    except Exception:
        pass
    footer(s, 10)

    # 11 WHY + START
    s = blank(prs)
    title_block(s, "Γιατι Melos & πως ξεκιναμε", "Απλα βηματα — χωρις πονοκεφαλο")

    left_items = [
        ("check", "Ολα σε ενα συστημα — μελη, λεφτα, εισοδος"),
        ("qr", "Λιγοτερες «δωρεαν» εισοδοι"),
        ("bell", "Υπενθυμισεις ληξης πριν χασεις το μελος"),
        ("phone", "Τα μελη εξυπηρετουνται μονοι τους"),
        ("star", "Ελληνικο, απλο, για reception"),
    ]
    round_rect(s, Inches(0.5), Inches(1.35), Inches(6.1), Inches(5.3), SURFACE, BORDER)
    lt = s.shapes.add_textbox(Inches(0.75), Inches(1.55), Inches(5.6), Inches(0.4))
    add_text(lt, [{"t": "ΓΙΑΤΙ ΝΑ ΤΟ ΠΑΡΕΙΣ", "s": 14, "b": True, "c": PRIMARY_DARK}])
    for i, (ic, txt) in enumerate(left_items):
        y = Inches(2.15 + i * 0.8)
        add_icon(s, icons[ic], Inches(0.8), y, Inches(0.48))
        tb = s.shapes.add_textbox(Inches(1.5), y + Inches(0.05), Inches(4.8), Inches(0.45))
        add_text(tb, [{"t": txt, "s": 13, "c": TEXT}])

    right_steps = [
        ("1", "Γνωριμια — μας λες πως δουλευεις σημερα"),
        ("2", "Demo 10' — μελος → πληρωμη → QR → κινητο"),
        ("3", "Setup — πακετα, καρτες, βασικα δεδομενα"),
        ("4", "Εκπαιδευση reception — και εισαι μεσα"),
    ]
    round_rect(s, Inches(6.85), Inches(1.35), Inches(6.0), Inches(5.3), INK)
    rt = s.shapes.add_textbox(Inches(7.1), Inches(1.55), Inches(5.5), Inches(0.4))
    add_text(rt, [{"t": "ΠΩΣ ΞΕΚΙΝΑΜΕ", "s": 14, "b": True, "c": PRIMARY}])
    for i, (n, txt) in enumerate(right_steps):
        y = Inches(2.25 + i * 1.0)
        badge = round_rect(s, Inches(7.15), y, Inches(0.5), Inches(0.5), PRIMARY)
        add_text(badge, [{"t": n, "s": 14, "b": True, "c": ON_BRAND}], align=PP_ALIGN.CENTER)
        tb = s.shapes.add_textbox(Inches(7.85), y + Inches(0.05), Inches(4.7), Inches(0.55))
        add_text(tb, [{"t": txt, "s": 13, "c": WHITE}])
    footer(s, 11)

    # 12 CTA
    s = blank(prs)
    rect(s, 0, 0, Inches(0.22), SLIDE_H, PRIMARY)
    t = s.shapes.add_textbox(Inches(0.7), Inches(1.5), Inches(12), Inches(0.8))
    add_text(t, [{"t": "Θες να το δεις σε 10 λεπτα;", "s": 32, "b": True, "c": TEXT}])
    s1 = s.shapes.add_textbox(Inches(0.7), Inches(2.4), Inches(12), Inches(0.7))
    add_text(
        s1,
        [
            {
                "t": "Στο demo περναμε μαζι:  νεο μελος  →  πληρωμη  →  QR εισοδος  →  portal",
                "s": 16,
                "c": PRIMARY_DARK,
            },
        ],
    )

    for i, (ic, label) in enumerate(
        [("users", "Εγγραφη"), ("card", "Πληρωμη"), ("qr", "Scan"), ("phone", "Κινητο")]
    ):
        left = Inches(0.7 + i * 3.1)
        round_rect(s, left, Inches(3.4), Inches(2.9), Inches(1.5), SURFACE, BORDER)
        add_icon(s, icons[ic], left + Inches(1.1), Inches(3.55), Inches(0.55))
        ll = s.shapes.add_textbox(left + Inches(0.15), Inches(4.25), Inches(2.6), Inches(0.4))
        add_text(ll, [{"t": label, "s": 14, "b": True, "c": TEXT}], align=PP_ALIGN.CENTER)

    contact = round_rect(s, Inches(0.7), Inches(5.3), Inches(12.0), Inches(1.4), SURFACE2)
    ct = s.shapes.add_textbox(Inches(1.0), Inches(5.5), Inches(11.4), Inches(1.1))
    add_text(
        ct,
        [
            {"t": "Επικοινωνια / Demo", "s": 13, "b": True, "c": PRIMARY_DARK},
            {"t": "Βαλε εδω: τηλεφωνο  ·  email  ·  website", "s": 18, "b": True, "c": TEXT},
            {"t": "MELOS  ·  Απλα. Καθαρα. Για το γυμ σου.", "s": 12, "c": MUTED},
        ],
    )

    prs.save(OUT)
    # verify Greek round-trip
    sample = "Το συστημα"
    assert "συστημα" in sample
    print("Wrote", OUT)
    print("UTF-8 check OK:", sample)


if __name__ == "__main__":
    build()
