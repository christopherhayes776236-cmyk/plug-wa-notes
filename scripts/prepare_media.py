import os
import shutil
import subprocess
import time
from pypdf import PdfWriter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_BASE = os.path.join(ROOT, "notes and lm")
PUBLIC_UNITS = os.path.join(ROOT, "public", "units")

UNITS_CONFIG = [
    {
        "unit": "comp102",
        "src_folder": "Comp 102",
        "notes": "COMP102_Discrete_Mathematics_Notes.pdf",
        "slides": "Visualizing_Set_Theory.pdf",
        "audio": "How_Set_Theory_Powers_Digital_Logic (1).m4a",
        "video": "Set theory.mp4",
    },
    {
        "unit": "soen201",
        "src_folder": "Soen 201",
        "notes": "SOEN201_OOAD_Notes.pdf",
        "slides": "SOEN_201_OOAD_Blueprint.pdf",
        "audio": "Object_oriented_design_pillars_and_relationships.m4a",
        "video": "OOP Inheritance.mp4",
    },
    {
        "unit": "soen202",
        "src_folder": "Soen202",
        "notes": "SOEN202_Web_Programming_Notes.pdf",
        "slides": "Web_Architecture_Blueprint.pdf",
        "audio": "The_hidden_machinery_of_a_web_click.m4a",
        "video": "web programming.mp4",
    },
    {
        "unit": "soen203",
        "src_folder": "Soen203",
        "notes": "SOEN203_Database_Systems_Notes.pdf",
        "slides": "Database_Systems_Blueprint.pdf",
        "audio": "The_invisible_architecture_of_database_systems.m4a",
        "video": "Database.mp4",
    },
    {
        "unit": "soen220",
        "src_folder": "soen220",
        "notes_w12": "SOEN220_Data_Communication_Weeks1-2_Notes.pdf",
        "notes_w3": "SOEN220_Network_Topology_WEEK 3Notes.pdf",
        "slides": "SOEN220_Slide_Overview.pdf",
        "audio": "The_engineering_behind_every_data_packet.m4a",
        "video": "Communication.mp4",
    },
    {
        "unit": "soen240",
        "src_folder": "Soen240",
        "notes": "SOEN240_OOP_Java_Notes.pdf",
        "slides": "Architecting_Java.pdf",
        "audio": "The_Architecture_of_Java_and_OOP.m4a",
        "video": "Java.mp4",
    },
]

def compress_audio(src_path, dst_path):
    if os.path.exists(dst_path):
        print(f"  [AUDIO EXISTS] {dst_path} ({os.path.getsize(dst_path)/1024/1024:.2f} MB)")
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
    if os.path.exists(dst_path):
        print(f"  [VIDEO EXISTS] {dst_path} ({os.path.getsize(dst_path)/1024/1024:.2f} MB)")
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
    os.makedirs(PUBLIC_UNITS, exist_ok=True)
    
    for cfg in UNITS_CONFIG:
        unit = cfg["unit"]
        unit_dir = os.path.join(PUBLIC_UNITS, unit)
        os.makedirs(unit_dir, exist_ok=True)
        src_dir = os.path.join(SRC_BASE, cfg["src_folder"])
        
        print(f"\n================ Processing {unit.upper()} ================")
        
        # Notes
        if unit == "soen220":
            # Copy w1-2 and w3
            w12_src = os.path.join(src_dir, cfg["notes_w12"])
            w3_src = os.path.join(src_dir, cfg["notes_w3"])
            shutil.copy2(w12_src, os.path.join(unit_dir, "notes-w12.pdf"))
            shutil.copy2(w3_src, os.path.join(unit_dir, "notes-w3.pdf"))
            
            # Merge into complete notes.pdf
            merged_dst = os.path.join(unit_dir, "notes.pdf")
            merger = PdfWriter()
            merger.append(w12_src)
            merger.append(w3_src)
            merger.write(merged_dst)
            merger.close()
            print(f"  Merged notes created: {merged_dst} ({os.path.getsize(merged_dst)/1024:.1f} KB)")
        else:
            notes_src = os.path.join(src_dir, cfg["notes"])
            shutil.copy2(notes_src, os.path.join(unit_dir, "notes.pdf"))
            print(f"  Copied notes: notes.pdf ({os.path.getsize(notes_src)/1024:.1f} KB)")
            
        # Slides / Blueprint (PDF)
        slides_src = os.path.join(src_dir, cfg["slides"])
        shutil.copy2(slides_src, os.path.join(unit_dir, "slides.pdf"))
        print(f"  Copied slides/blueprint: slides.pdf ({os.path.getsize(slides_src)/1024/1024:.2f} MB)")
        
        # Audio
        audio_src = os.path.join(src_dir, cfg["audio"])
        audio_dst = os.path.join(unit_dir, "audio.m4a")
        compress_audio(audio_src, audio_dst)
        
        # Video
        video_src = os.path.join(src_dir, cfg["video"])
        video_dst = os.path.join(unit_dir, "video.mp4")
        compress_video(video_src, video_dst)

if __name__ == "__main__":
    t0 = time.time()
    process()
    print(f"\nAll units processed successfully in {time.time()-t0:.1f}s!")
