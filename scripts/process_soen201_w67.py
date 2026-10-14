import os
import shutil
import subprocess
import time
from pathlib import Path
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "notes and lm" / "Soen 201"
PUBLIC = ROOT / "public"
DEST_DIR = PUBLIC / "units" / "soen201"
PREVIEWS_DIR = PUBLIC / "previews"

DEST_DIR.mkdir(parents=True, exist_ok=True)
PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)

NOTES_SRC = SRC_DIR / "SOEN201_Assignment_Guide week 6-7 notes.pdf"
SLIDES_SRC = SRC_DIR / "SOEN201_Assignment_Guide week 6-7 SLIDES.pdf"
AUDIO_SRC = SRC_DIR / "SOEN201_Assignment_Guide week 6-7 AUDIO.m4a"
VIDEO_SRC = SRC_DIR / "SOEN201_Assignment_Guide week 6-7 VIDEO.mp4"

NOTES_DST = DEST_DIR / "notes-w67.pdf"
SLIDES_DST = DEST_DIR / "slides-w67.pdf"
AUDIO_DST = DEST_DIR / "audio-w67.m4a"
VIDEO_DST = DEST_DIR / "video-w67.mp4"

def compress_audio(src, dst):
    print(f"Compressing audio: {src.name} -> {dst.name}...")
    t0 = time.time()
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", str(src),
        "-c:a", "aac",
        "-b:a", "96k",
        str(dst)
    ]
    subprocess.run(cmd, check=True)
    orig_mb = src.stat().st_size / (1024 * 1024)
    new_mb = dst.stat().st_size / (1024 * 1024)
    print(f"  Audio done in {time.time() - t0:.1f}s: {orig_mb:.2f} MB -> {new_mb:.2f} MB")

def compress_video(src, dst):
    print(f"Compressing video: {src.name} -> {dst.name}...")
    t0 = time.time()
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", str(src),
        "-c:v", "libx264",
        "-crf", "26",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(dst)
    ]
    subprocess.run(cmd, check=True)
    orig_mb = src.stat().st_size / (1024 * 1024)
    new_mb = dst.stat().st_size / (1024 * 1024)
    print(f"  Video done in {time.time() - t0:.1f}s: {orig_mb:.2f} MB -> {new_mb:.2f} MB")

def render_pdf_cover(pdf_path, out_jpg):
    print(f"Rendering PDF preview: {pdf_path.name} -> {out_jpg.name}...")
    doc = pdfium.PdfDocument(str(pdf_path))
    page = doc[0]
    img = page.render(scale=2.0).to_pil()
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(str(out_jpg), "JPEG", quality=88)
    print(f"  Cover rendered: {out_jpg.name}")

def extract_video_frame(video_path, out_jpg, timestamp="00:00:03"):
    print(f"Extracting video frame: {video_path.name} -> {out_jpg.name}...")
    cmd = [
        "ffmpeg", "-y", "-ss", timestamp,
        "-i", str(video_path),
        "-frames:v", "1",
        "-q:v", "2",
        str(out_jpg)
    ]
    subprocess.run(cmd, check=True)
    print(f"  Video frame extracted: {out_jpg.name}")

def main():
    start = time.time()
    print("=== Processing SOEN 201 Weeks 6-7 Materials ===")

    # 1. Copy Notes PDF
    print(f"Copying notes: {NOTES_SRC.name}...")
    shutil.copy2(NOTES_SRC, NOTES_DST)
    print(f"  Notes copied: {NOTES_DST.name} ({NOTES_DST.stat().st_size / 1024:.1f} KB)")

    # 2. Copy Slides PDF
    print(f"Copying slides: {SLIDES_SRC.name}...")
    shutil.copy2(SLIDES_SRC, SLIDES_DST)
    print(f"  Slides copied: {SLIDES_DST.name} ({SLIDES_DST.stat().st_size / (1024 * 1024):.2f} MB)")

    # 3. Compress Audio
    compress_audio(AUDIO_SRC, AUDIO_DST)

    # 4. Compress Video
    compress_video(VIDEO_SRC, VIDEO_DST)

    # 5. Extract Previews
    render_pdf_cover(NOTES_DST, PREVIEWS_DIR / "soen201-w67-notes.jpg")
    render_pdf_cover(SLIDES_DST, PREVIEWS_DIR / "soen201-w67-slides.jpg")
    extract_video_frame(VIDEO_DST, PREVIEWS_DIR / "soen201-w67-video.jpg")

    print(f"\nAll Weeks 6-7 files and previews ready in {time.time() - start:.1f}s!")

if __name__ == "__main__":
    main()
