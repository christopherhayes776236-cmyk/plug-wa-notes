import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_BASE = os.path.join(ROOT, "notes and lm")

# Files to delete — only the new uncompressed Week 4-5 originals
# (Week 1-3 originals are kept intact)
TO_DELETE = [
    # COMP 102
    ("Comp 102", "COMP 102 VIDEO WEEK 4-5.mp4"),
    ("Comp 102", "COMP 102 AUDIO WEEK 4-5.m4a"),
    # SOEN 201
    ("Soen 201", "SOEN201_WEEK 4-5_VIDEO.mp4"),
    ("Soen 201", "SOEN201_WEEK 4-5_AUDIO.m4a"),
    # SOEN 202
    ("Soen202", "SOEN 202 VIDEO WEEK 4-5.mp4"),
    ("Soen202", "SOEN 202 AUDIO WEEK 4-5.m4a"),
    # SOEN 203
    ("Soen203", "SOEN203_WEEK 4-5_VIDEO.mp4"),
    ("Soen203", "SOEN203_WEEK 4-5_SLIDES.m4a"),  # audio mislabelled as SLIDES
    # SOEN 220
    ("soen220", "SOEN 220 VIDEO WEEK 4-5.mp4"),
    ("soen220", "SOEN 220 AUDIO WEEK 4-5.m4a"),
    ("soen220", "SOEN220_week 4-5_ASSINGMENT-VIDEO.mp4"),
    # SOEN 220 homepage raw (already compressed to public/media)
    (os.path.join("soen220", "homapage"), "HOMEPAGE VIDEO OVERVIEW.mp4"),
    # SOEN 240
    ("Soen240", "SOEN240_WEEK 4-5_VIDEO.mp4"),
    ("Soen240", "SOEN240_WEEK 4-5_AUDIO.m4a"),
]

total_freed = 0
for folder, filename in TO_DELETE:
    path = os.path.join(SRC_BASE, folder, filename)
    if os.path.exists(path):
        size = os.path.getsize(path)
        os.remove(path)
        total_freed += size
        print(f"  ✓ Deleted: {folder}/{filename}  ({size/1024/1024:.1f} MB)")
    else:
        print(f"  [SKIP] Not found: {folder}/{filename}")

print(f"\nTotal space freed: {total_freed/1024/1024/1024:.2f} GB")
print("Done. Week 1-3 originals are untouched.")
