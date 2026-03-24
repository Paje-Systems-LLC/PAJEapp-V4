import os
import numpy as np
from PIL import Image

def autocrop(image_path):
    im = Image.open(image_path).convert("RGB")
    data = np.array(im)
    
    # Assume the background color is heavily present in the top and bottom rows
    # Take an average of the top row to establish the baseline background avoiding noise
    bg_median = np.median(data[0:10, :], axis=(0,1))
    
    # Calculate difference from background (Euclidean-like)
    diff = np.abs(data.astype(int) - bg_median.astype(int))
    diff_sum = np.sum(diff, axis=2)
    
    # Tolerance for gradients/noise. AI gradients can sway by up to 20-30 units per channel.
    tolerance = 60 
    mask = diff_sum > tolerance
    
    coords = np.argwhere(mask)
    if coords.size == 0:
        print(f"No content found for {image_path}")
        return
        
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    
    p = 10
    y0 = max(0, y0 - p)
    x0 = max(0, x0 - p)
    y1 = min(data.shape[0], y1 + p)
    x1 = min(data.shape[1], x1 + p)
    
    cropped = im.crop((x0, y0, x1, y1))
    cropped.save(image_path)
    print(f"Cropped {image_path} cleanly from {data.shape[1]}x{data.shape[0]} to {x1-x0}x{y1-y0}")

paths = [
    r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\Master_Frame\img\logo\hdsys_logo_dark_mode.png",
    r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\Master_Frame\img\logo\hdsys_logo_light_mode.png",
    r"C:\aaa_appPAJEclub\Frontend_References\img\logo\hdsys_logo_dark_mode.png",
    r"C:\aaa_appPAJEclub\Frontend_References\img\logo\hdsys_logo_light_mode.png",
    r"C:\Users\Boas\.gemini\antigravity\brain\276d6b95-3661-4c50-b16f-a0afe63abb22\hdsys_logo_dark_mode_1773008898026.png",
    r"C:\Users\Boas\.gemini\antigravity\brain\276d6b95-3661-4c50-b16f-a0afe63abb22\hdsys_logo_light_mode_1773008913287.png"
]

for p in paths:
    if os.path.exists(p):
        try:
            autocrop(p)
        except Exception as e:
            print(f"Error on {p}: {e}")
