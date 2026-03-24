import os
import re

base_path = r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\app_pages\templates\components\dashboards"

files = [
    os.path.join(base_path, r"health_manager\dashboard_health_manager.html"),
    os.path.join(base_path, r"healthcare_professional\dashboard_healthcare_professional.html"),
    os.path.join(base_path, r"patient\dashboard_patient.html")
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Rewrite inner <style> blocks (Dark Mode adaptation for native tables)
        content = re.sub(r'background:\s*#fff;', 'background: var(--glass-bg);', content)
        content = re.sub(r'background-color:\s*#fff;', 'background-color: var(--glass-bg);', content)
        content = re.sub(r'background:\s*#e6ecfa;', 'background: rgba(255, 255, 255, 0.05); color: var(--text-primary);', content)
        content = re.sub(r'background-color:\s*#e6ecfa;', 'background-color: rgba(255, 255, 255, 0.05); color: var(--text-primary);', content)
        content = re.sub(r'background-color:\s*#ecf0f1;', 'background-color: var(--glass-bg);', content)
        content = re.sub(r'color:\s*#153959;', 'color: var(--text-primary);', content)
        
        # 2. Rewrite Card UI Elements
        # Find explicit inline colored cards: class="card ..." style="background-color: ...;"
        content = re.sub(r'class="card([^"]*)"\s*style="background-color:\s*(?:rgba|rgb)[^;]+;([^"]*)"', r'class="card glass-panel\1" style="\2"', content)
        content = re.sub(r'class="card([^"]*)"\s*style="background-color:\s*#[a-fA-F0-9]+;([^"]*)"', r'class="card glass-panel\1" style="\2"', content)
        
        # Find generic cards and append glass-panel
        content = re.sub(r'class="card"', 'class="card glass-panel"', content)
        content = re.sub(r'class="card ', 'class="card glass-panel ', content)
        
        # Clean up duplicates if any
        content = content.replace("glass-panel glass-panel", "glass-panel")
        content = content.replace("card card-header", "card-header")
        
        # 3. Purge disruptive Bootstrap text/bg color forces that break CSS variables
        content = content.replace('text-black', '')
        content = content.replace('text-white', '')
        content = content.replace('bg-white', '')
        content = content.replace('custom-bg-dark-cyan', '')
        content = content.replace('custom-border-dark-cyan', '')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed Nano Banana Overhaul -> {os.path.basename(file_path)}")
    else:
        print(f"File not found -> {os.path.basename(file_path)}")
