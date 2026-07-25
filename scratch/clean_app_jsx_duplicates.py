with open('/Volumes/Disk D/datathon 2026/client/src/App.jsx', 'r') as f:
    lines = f.readlines()

seen_imports = set()
new_lines = []

for line in lines:
    stripped = line.strip()
    if stripped.startswith('import Sidebar') or stripped.startswith('import Topbar') or stripped.startswith('import LoginModal'):
        if stripped in seen_imports:
            continue
        seen_imports.add(stripped)
    if 'const [sidebarCollapsed, setSidebarCollapsed] = useState(false);' in stripped:
        if 'sidebarCollapsed' in seen_imports:
            continue
        seen_imports.add('sidebarCollapsed')
    new_lines.append(line)

with open('/Volumes/Disk D/datathon 2026/client/src/App.jsx', 'w') as f:
    f.writelines(new_lines)

print("Deduplicated App.jsx imports and states!")
