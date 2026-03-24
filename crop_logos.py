import os
from PIL import Image, ImageChops

def trim(im):
    # Get the background color from the top-left pixel (assumes flat background)
    bg_color = im.getpixel((0, 0))
    bg = Image.new(im.mode, im.size, bg_color)
    diff = ImageChops.difference(im, bg)
    
    # Optional: fuzzy match if there is slight noise (usually not for AI vector flat bg, but just in case)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    
    bbox = diff.getbbox()
    if bbox:
        # Give a small padding
        p = 20
        padded_bbox = (
            max(0, bbox[0] - p),
            max(0, bbox[1] - p),
            min(im.size[0], bbox[2] + p),
            min(im.size[1], bbox[3] + p)
        )
        return im.crop(padded_bbox)
    return im

files_to_crop = [
    r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\Master_Frame\img\logo\hdsys_logo_dark_mode.png",
    r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\Master_Frame\img\logo\hdsys_logo_light_mode.png",
    r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\static\img\logo\hdsys_logo_dark_mode.png",
    r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\static\img\logo\hdsys_logo_light_mode.png",
    r"C:\aaa_appPAJEclub\Frontend_References\img\logo\hdsys_logo_dark_mode.png",
    r"C:\aaa_appPAJEclub\Frontend_References\img\logo\hdsys_logo_light_mode.png"
]

for file_path in files_to_crop:
    if os.path.exists(file_path):
        try:
            im = Image.open(file_path).convert("RGB")
            cropped_im = trim(im)
            cropped_im.save(file_path)
            print(f"Sucesso ao recortar: {file_path}")
        except Exception as e:
            print(f"Erro em {file_path}: {e}")
    else:
        print(f"Arquivo não encontrado: {file_path}")
