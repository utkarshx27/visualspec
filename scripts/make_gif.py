import sys
from PIL import Image

def main():
    if len(sys.argv) < 3:
        print("Usage: make_gif.py <out_path> <frame1> <frame2> ...")
        sys.exit(1)

    out_path = sys.argv[1]
    frame_paths = sys.argv[2:]

    frames = [Image.open(p).convert("RGBA") for p in frame_paths]
    p_frames = []
    for f in frames:
        bg = Image.new("RGB", f.size, (9, 13, 22))
        bg.paste(f, mask=f.split()[3])
        p_frames.append(bg.convert("P", palette=Image.Palette.ADAPTIVE, colors=128))

    delays = [2600, 2600, 2600, 2600, 3500]
    p_frames[0].save(
        out_path,
        save_all=True,
        append_images=p_frames[1:],
        duration=delays,
        loop=0,
        optimize=True,
        disposal=2
    )
    print("[OK] Successfully assembled animated GIF with Pillow.")

if __name__ == "__main__":
    main()
