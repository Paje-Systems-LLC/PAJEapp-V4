import os
import sys
from PIL import Image

def create_padded_square(img, target_size, padding_percentage=0):
    # Calculate target icon size with padding
    icon_size = int(target_size * (1 - padding_percentage))
    
    # Calculate aspect ratio
    w, h = img.size
    aspect = w / h
    
    if aspect > 1:
        new_w = icon_size
        new_h = int(icon_size / aspect)
    else:
        new_h = icon_size
        new_w = int(icon_size * aspect)
        
    resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create a new square image (rgba, transparent)
    new_img = Image.new("RGBA", (target_size, target_size), (255, 255, 255, 0))
    
    # Paste resized image into center
    paste_x = (target_size - new_w) // 2
    paste_y = (target_size - new_h) // 2
    new_img.paste(resized_img, (paste_x, paste_y))
    return new_img

def main():
    assets_dir = r"c:\aaa_appPAJEclub\assets"
    source_img_path = os.path.join(assets_dir, "Cocar_Logo sem fundo.png")
    
    if not os.path.exists(source_img_path):
        print(f"Error: Could not find {source_img_path}")
        sys.exit(1)
        
    try:
        img = Image.open(source_img_path).convert("RGBA")
        
        # 1. icon.png (1024x1024) - Base App Icon (Fill square)
        # Using a slight padding so it doesn't touch the absolute edges
        icon = create_padded_square(img, 1024, 0.1)
        icon.save(os.path.join(assets_dir, "icon.png"))
        print("Generated icon.png (1024x1024)")
        
        # 2. adaptive-icon.png (1024x1024) - Android Adaptive Icon
        # Needs to fit within the center 60% safe zone for Android
        adaptive_icon = create_padded_square(img, 1024, 0.4)
        adaptive_icon.save(os.path.join(assets_dir, "adaptive-icon.png"))
        print("Generated adaptive-icon.png (1024x1024)")
        
        # 3. favicon.png (192x192) - Web/PWA
        favicon = create_padded_square(img, 192, 0.1)
        favicon.save(os.path.join(assets_dir, "favicon.png"))
        print("Generated favicon.png (192x192)")
        
        # 4. splash.png (2048x2048) - App Splash Screen
        splash = create_padded_square(img, 2048, 0.4)
        splash.save(os.path.join(assets_dir, "splash.png"))
        print("Generated splash.png (2048x2048)")
        
        # 5. logo_login.png (512x512) - Login Screen
        logo_login = create_padded_square(img, 512, 0)
        logo_login.save(os.path.join(assets_dir, "logo_login.png"))
        print("Generated logo_login.png (512x512)")
        
        print("All assets generated successfully.")
    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
