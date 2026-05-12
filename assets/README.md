# App icons

Place your app icons here before running `npm run make`.

| File | Platform | Size recommandée |
|---|---|---|
| `icon.icns` | macOS | 512×512 (multi-résolution) |
| `icon.ico` | Windows | 256×256 (multi-résolution) |
| `icon.png` | Linux | 512×512 |

Electron Forge sélectionne automatiquement le bon fichier selon la plateforme cible.

## Générer les fichiers depuis un PNG 512×512

```bash
# macOS — via electron-icon-maker
npx electron-icon-maker --input=icon.png --output=.

# Linux — imagemagick
convert icon.png -resize 512x512 icon.png
```
