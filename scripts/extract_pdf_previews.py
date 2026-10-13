import os
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
UNITS_DIR = PUBLIC / "units"
OUT_DIR = PUBLIC / "previews"

OUT_DIR.mkdir(parents=True, exist_ok=True)

UNITS = ["comp102", "soen201", "soen202", "soen203", "soen220", "soen240"]

PDF_TASKS = []

for u in UNITS:
    # Notes previews
    PDF_TASKS.append((UNITS_DIR / u / "notes.pdf", OUT_DIR / f"{u}-notes.jpg"))
    PDF_TASKS.append((UNITS_DIR / u / "notes-w45.pdf", OUT_DIR / f"{u}-w45-notes.jpg"))
    # Real slide previews from the slide PDFs (NOT duplicate video frames)
    PDF_TASKS.append((UNITS_DIR / u / "slides.pdf", OUT_DIR / f"{u}-slides.jpg"))
    PDF_TASKS.append((UNITS_DIR / u / "slides-w45.pdf", OUT_DIR / f"{u}-w45-slides.jpg"))

# Extra notes for soen220
PDF_TASKS.append((UNITS_DIR / "soen220" / "notes-w12.pdf", OUT_DIR / "soen220-notes-w12.jpg"))
PDF_TASKS.append((UNITS_DIR / "soen220" / "notes-w3.pdf", OUT_DIR / "soen220-notes-w3.jpg"))
PDF_TASKS.append((UNITS_DIR / "soen220" / "assignment-notes.pdf", OUT_DIR / "soen220-asg-notes.jpg"))

print("Extracting PDF previews (Notes + Slides) using pypdfium2...")

for pdf_path, out_path in PDF_TASKS:
    if not pdf_path.exists():
        print(f"  [SKIP] Not found: {pdf_path.name}")
        continue
    try:
        pdf = pdfium.PdfDocument(str(pdf_path))
        if len(pdf) < 1:
            print(f"  [SKIP] Empty PDF: {pdf_path.name}")
            continue
        page = pdf[0]
        # Render at 150 DPI (scale = 2.0)
        image = page.render(scale=2.0).to_pil()
        # Convert RGBA or grayscale to RGB for JPEG
        if image.mode != "RGB":
            image = image.convert("RGB")
        image.save(str(out_path), "JPEG", quality=85)
        print(f"  [OK] Rendered {pdf_path.relative_to(PUBLIC)} -> {out_path.name}")
    except Exception as e:
        print(f"  [ERROR] {pdf_path.name}: {e}")

print("PDF preview extraction complete.")
