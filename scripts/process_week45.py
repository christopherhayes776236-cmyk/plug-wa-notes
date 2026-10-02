import os
import shutil
import subprocess
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_BASE = os.path.join(ROOT, "notes and lm")
PUBLIC_UNITS = os.path.join(ROOT, "public", "units")
PUBLIC_MEDIA = os.path.join(ROOT, "public", "media")

CONFIGS = [
    {
        "unit": "comp102",
        "src_folder": "Comp 102",
        "notes": "COMP 102NOTES WEEK 4-5.pdf",
        "slides": "COMP 102 SLIDE WEEK 4-5.pdf",
        "audio": "COMP 102 AUDIO WEEK 4-5.m4a",
        "video": "COMP 102 VIDEO WEEK 4-5.mp4",
    },
    {
        "unit": "soen201",
        "src_folder": "Soen 201",
        "notes": "SOEN201_WEEK 4-5_Notes.pdf",
        "slides": "SOEN201_WEEK 4-5_SLIDES.pdf",
        "audio": "SOEN201_WEEK 4-5_AUDIO.m4a",
        "video": "SOEN201_WEEK 4-5_VIDEO.mp4",
    },
    {
        "unit": "soen202",
        "src_folder": "Soen202",
        "notes": "SOEN202_WEEK 4-5_Notes.pdf",
        "slides": "SOEN 202 SLIDES WEEK 4-5.pdf",
        "audio": "SOEN 202 AUDIO WEEK 4-5.m4a",
        "video": "SOEN 202 VIDEO WEEK 4-5.mp4",
    },
    {
        "unit": "soen203",
        "src_folder": "Soen203",
        "notes": "SOEN203_WEEK 4-5_Notes.pdf",
        "slides": "SOEN203_WEEK 4-5_SLIDES.pdf",
        "audio": "SOEN203_WEEK 4-5_SLIDES.m4a",
        "video": "SOEN203_WEEK 4-5_VIDEO.mp4",
    },
    {
        "unit": "soen220",
        "src_folder": "soen220",
        "notes": "SOEN220_week 4-5_Notes.pdf",
        "slides": "SOEN 220 slides WEEK 4-5.pdf",
        "audio": "SOEN 220 AUDIO WEEK 4-5.m4a",
        "video": "SOEN 220 VIDEO WEEK 4-5.mp4",
        "assignment_notes": "SOEN220_week 4-5_ASSINGMENT-NOTES.pdf",
        "assignment_video": "SOEN220_week 4-5_ASSINGMENT-VIDEO.mp4",
    },
    {
        "unit": "soen240",
        "src_folder": "Soen240",
        "notes": "SOEN240_WEEK 4-5_Notes.pdf",
        "slides": "SOEN240_WEEK 4-5_SLIDES.pdf",
        "audio": "SOEN240_WEEK 4-5_AUDIO.m4a",
        "video": "SOEN240_WEEK 4-5_VIDEO.mp4",
    },
]

def compress_audio(src_path, dst_path):
    if not os.path.exists(src_path):
        print(f"  [MISSING AUDIO SOURCE] {src_path}")
        return
    print(f"  Compressing audio: {os.path.basename(src_path)} -> {os.path.basename(dst_path)}")
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", src_path,
        "-c:a", "aac",
        "-b:a", "96k",
        dst_path
    ]
    subprocess.run(cmd, check=True)
    orig_mb = os.path.getsize(src_path) / 1024 / 1024
    new_mb = os.path.getsize(dst_path) / 1024 / 1024
    print(f"  Done audio: {orig_mb:.2f} MB -> {new_mb:.2f} MB")

def compress_video(src_path, dst_path):
    if not os.path.exists(src_path):
        print(f"  [MISSING VIDEO SOURCE] {src_path}")
        return
    print(f"  Compressing video: {os.path.basename(src_path)} -> {os.path.basename(dst_path)}")
    # H.264 CRF 26 fast preset + AAC 128k audio + faststart
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", src_path,
        "-c:v", "libx264",
        "-crf", "26",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        dst_path
    ]
    subprocess.run(cmd, check=True)
    orig_mb = os.path.getsize(src_path) / 1024 / 1024
    new_mb = os.path.getsize(dst_path) / 1024 / 1024
    print(f"  Done video: {orig_mb:.2f} MB -> {new_mb:.2f} MB")

def process():
    total_start = time.time()
    os.makedirs(PUBLIC_UNITS, exist_ok=True)
    os.makedirs(PUBLIC_MEDIA, exist_ok=True)

    # 1. Homepage Video
    homepage_src = os.path.join(SRC_BASE, "soen220", "homapage", "HOMEPAGE VIDEO OVERVIEW.mp4")
    homepage_dst = os.path.join(PUBLIC_MEDIA, "video-overview.mp4")
    if os.path.exists(homepage_src):
        print("\n================ Processing HOMEPAGE VIDEO ================")
        compress_video(homepage_src, homepage_dst)
    else:
        print(f"  [HOMEPAGE NOT FOUND] {homepage_src}")

    # 2. Units Weeks 4-5
    for cfg in CONFIGS:
        unit = cfg["unit"]
        unit_dir = os.path.join(PUBLIC_UNITS, unit)
        os.makedirs(unit_dir, exist_ok=True)
        src_dir = os.path.join(SRC_BASE, cfg["src_folder"])

        print(f"\n================ Processing {unit.upper()} (Weeks 4-5) ================")

        # Notes
        notes_src = os.path.join(src_dir, cfg["notes"])
        notes_dst = os.path.join(unit_dir, "notes-w45.pdf")
        if os.path.exists(notes_src):
            shutil.copy2(notes_src, notes_dst)
            print(f"  Copied notes: notes-w45.pdf ({os.path.getsize(notes_dst)/1024:.1f} KB)")
        else:
            print(f"  [MISSING NOTES] {notes_src}")

        # Slides
        slides_src = os.path.join(src_dir, cfg["slides"])
        slides_dst = os.path.join(unit_dir, "slides-w45.pdf")
        if os.path.exists(slides_src):
            shutil.copy2(slides_src, slides_dst)
            print(f"  Copied slides: slides-w45.pdf ({os.path.getsize(slides_dst)/1024/1024:.2f} MB)")
        else:
            print(f"  [MISSING SLIDES] {slides_src}")

        # Audio
        audio_src = os.path.join(src_dir, cfg["audio"])
        audio_dst = os.path.join(unit_dir, "audio-w45.m4a")
        compress_audio(audio_src, audio_dst)

        # Video
        video_src = os.path.join(src_dir, cfg["video"])
        video_dst = os.path.join(unit_dir, "video-w45.mp4")
        compress_video(video_src, video_dst)

        # SOEN 220 Assignment
        if unit == "soen220":
            print("\n  ---- Processing SOEN 220 Assignment ----")
            asg_notes_src = os.path.join(src_dir, cfg["assignment_notes"])
            asg_notes_dst = os.path.join(unit_dir, "assignment-notes.pdf")
            if os.path.exists(asg_notes_src):
                shutil.copy2(asg_notes_src, asg_notes_dst)
                print(f"  Copied assignment notes: assignment-notes.pdf ({os.path.getsize(asg_notes_dst)/1024:.1f} KB)")

            asg_video_src = os.path.join(src_dir, cfg["assignment_video"])
            asg_video_dst = os.path.join(unit_dir, "assignment-video.mp4")
            compress_video(asg_video_src, asg_video_dst)

    print(f"\n================ All Processing Finished in {time.time()-total_start:.1f}s ================")

if __name__ == "__main__":
    process()
