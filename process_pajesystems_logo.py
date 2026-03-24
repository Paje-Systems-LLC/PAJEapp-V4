import os
from PIL import Image, ImageFilter, ImageDraw

INPUT_IMAGE = r"C:\Users\Boas\.gemini\antigravity\brain\276d6b95-3661-4c50-b16f-a0afe63abb22\media__1772987723368.png"
OUTPUT_DIR = r"c:\LaMPS\IMAGENS\PAJESYSTEMS-imagens"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def remove_background(img):
    img = img.convert('RGBA')
    width, height = img.size
    
    # Preenche o exterior branco com Transparencia.
    # Usando floodfill no canto 0,0 com tolerancia
    ImageDraw.floodfill(img, (0, 0), (255, 0, 255, 0), thresh=45)
    ImageDraw.floodfill(img, (width-1, 0), (255, 0, 255, 0), thresh=45)
    ImageDraw.floodfill(img, (0, height-1), (255, 0, 255, 0), thresh=45)
    ImageDraw.floodfill(img, (width-1, height-1), (255, 0, 255, 0), thresh=45)
    
    # Agora substituir (255, 0, 255, 0) por transparente real
    data = img.getdata()
    new_data = []
    for item in data:
        if item == (255, 0, 255, 0):
            new_data.append((0, 0, 0, 0))
        # Remove pixels quase brancos que sobraram nas bordas (anti-aliasing debris fora do floodfill, se a opacidade for alta)
        elif item[0] > 240 and item[1] > 240 and item[2] > 240:
             # Deixa transparente mas preserva o Cocar? Cuidado, o interior do Cocar e branco!
             # Vamos usar apenas a mascara do floodfill para seguranca.
             new_data.append(item)
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

def create_glow_effect(img, glow_color=(14, 165, 233, 200), radius=5): # Nano Banana Cyan #0ea5e9
    # Cria a sombra extraindo o alpha
    alpha = img.split()[3]
    glow = Image.new('RGBA', img.size, glow_color)
    glow.putalpha(alpha)
    glow = glow.filter(ImageFilter.GaussianBlur(radius))
    
    # Compilar img original sobre o glow
    final = Image.alpha_composite(glow, img)
    return final

def generate_light_mode(base_transparent):
    # Tela Clara: Mantem o texto Dark Blue e o Cocar intocados.
    # Adicionamos um brilho Cyan tecnologico sutil (radius pequeno) para o vies "Tech"
    return create_glow_effect(base_transparent, glow_color=(14, 165, 233, 100), radius=3)

def generate_dark_mode(base_transparent):
    # Tela Escura: Fundo padrao sera o Cobalt (#051630). 
    # Precisamos transformar as letras (Dark Blue/Preto) em Branco ou Ciano.
    # Mas PROTEGENDO o Cocar (que fica na metade superior)
    img = base_transparent.copy()
    data = img.getdata()
    width, height = img.size
    
    new_data = []
    # Assumimos que o corte do Cocar termina em y = height * 0.45 (Cocar no topo, texto embaixo)
    split_y = int(height * 0.45)
    
    for i, item in enumerate(data):
        x = i % width
        y = i // width
        
        # Ignora pixels transparentes
        if item[3] == 0:
            new_data.append(item)
            continue
            
        if y > split_y:
            # Metade de baixo (Texto)
            # Se for escuro (Dark Blue ou Preto), converte para Branco
            # Avalia a luma
            luma = 0.299 * item[0] + 0.587 * item[1] + 0.114 * item[2]
            if luma < 100: # Pixels escuros da letra
                # Mantem a opacidade original das bordas anti-aliased
                new_data.append((255, 255, 255, item[3]))
            else:
                 # Azul ciano embaixo das letras do logo original (aquele risco azul)
                 # Se for o sublinhado Cyan, deixa Cyan!
                 if item[2] > item[0] + 50: # Tem mto mais azul que vermelho
                     new_data.append((14, 165, 233, item[3])) # Força pro ciano do banana
                 else:
                     new_data.append(item)
        else:
            # Metade de Cima (Cocar) - Intocado, a nao ser que possamos dar um Glow nele depois
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Adiciona o Glow de Neon Eletrico (Cyan/Branco) p/ fundo escuro
    return create_glow_effect(img, glow_color=(14, 165, 233, 200), radius=5)

def main():
    try:
        print("Iniciando tratamento do Master Logo PAJE SYSTEMS...")
        img = Image.open(INPUT_IMAGE)
        
        print("1. Executando Floodfill Inteligente para remoção de fundo (preservando Cocar)...")
        transparent_base = remove_background(img)
        
        print("2. Gerando Versionamento Light Mode (Sombra Cyber Cyan)...")
        light_mode = generate_light_mode(transparent_base)
        light_mode_path = os.path.join(OUTPUT_DIR, "MasterLogo_LightMode.png")
        light_mode.save(light_mode_path, "PNG")
        
        print("3. Gerando Versionamento Dark Mode (Inversao Neon + Glow)...")
        dark_mode = generate_dark_mode(transparent_base)
        dark_mode_path = os.path.join(OUTPUT_DIR, "MasterLogo_DarkMode.png")
        dark_mode.save(dark_mode_path, "PNG")
        
        print(f"Sucesso! Imagens salvas em: {OUTPUT_DIR}")
    except Exception as e:
        print(f"Erro catastrofico: {e}")

if __name__ == "__main__":
    main()
