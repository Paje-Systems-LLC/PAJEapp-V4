import os
from PIL import Image, ImageFilter, ImageEnhance

# Caminhos
INPUT_IMAGE = r"C:\Users\Boas\.gemini\antigravity\brain\276d6b95-3661-4c50-b16f-a0afe63abb22\media__1772985769508.png"
OUTPUT_DIR = r"c:\LaMPS\IMAGENS\PAJESYSTEMS-imagens"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Tamanhos Padrao p/ Redes Sociais (width, height)
FORMATS = {
    "Instagram_Post_1080x1080": (1080, 1080),
    "Profile_Picture_400x400": (400, 400),
    "Facebook_Cover_820x312": (820, 312),
    "LinkedIn_Cover_1128x191": (1128, 191),
    "Stories_Reels_1080x1920": (1080, 1920),
    "HighRes_Master_2048x2048": (2048, 2048) # Para uso em sites e web (resolucao master)
}

def process_and_upscale(img):
    # Converte para RGBA se nao for, garantindo fundo transparente ou branco
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 1. Upscale brutal (Lanczos)
    width, height = img.size
    scale_factor = 4
    high_res = img.resize((width * scale_factor, height * scale_factor), Image.Resampling.LANCZOS)
    
    # 2. Suavizacao das bordas (Simulacao de Vetorizacao/Anti-aliasing hard)
    # Aplica um leve desfoque gaussiano para misturar pixalizacao e depois um UnsharpMask agressivo
    blurred = high_res.filter(ImageFilter.GaussianBlur(radius=1.5))
    sharpened = blurred.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    
    # 3. Melhoria de Contraste e Cor
    enhancer_color = ImageEnhance.Color(sharpened)
    colored = enhancer_color.enhance(1.1)
    
    enhancer_contrast = ImageEnhance.Contrast(colored)
    final_master = enhancer_contrast.enhance(1.05)
    
    return final_master

def create_social_media_assets(master_img, formats, output_dir):
    # O logo mestre
    for name, (w, h) in formats.items():
        # Cria um canvas transparente ou branco daquele tamanho
        canvas = Image.new('RGBA', (w, h), (255, 255, 255, 0)) # Fundo Transparente
        
        # Calcula escalonamento do logo para caber no canvas deixando uma margem de segurança (10%)
        margin = 0.8
        target_w, target_h = int(w * margin), int(h * margin)
        
        # Manter aspect ratio do Master
        master_w, master_h = master_img.size
        ratio = min(target_w / master_w, target_h / master_h)
        
        new_w, new_h = int(master_w * ratio), int(master_h * ratio)
        resized_logo = master_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Colar no centro do canvas
        offset_x = (w - new_w) // 2
        offset_y = (h - new_h) // 2
        
        canvas.paste(resized_logo, (offset_x, offset_y), resized_logo)
        
        save_path = os.path.join(output_dir, f"{name}.png")
        canvas.save(save_path, "PNG")
        print(f"[{name}] salvo com sucesso!")

def main():
    try:
        print(f"Abrindo vetor base: {INPUT_IMAGE}")
        img = Image.open(INPUT_IMAGE)
        
        print("Processando e aprimorando resolucao (Simulacao Master-Vector)...")
        master_img = process_and_upscale(img)
        
        print(f"Construindo assets para redes sociais e exportando para: {OUTPUT_DIR}")
        create_social_media_assets(master_img, FORMATS, OUTPUT_DIR)
        
        print("Tratamento de imagem concluido!")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    main()
