#!/usr/bin/env bash
# Regenera todos los iconos desde el maestro. Se ejecuta a mano cuando cambia el
# logotipo, no en cada build: los derivados se versionan para que un clon limpio no
# necesite herramientas de imagen.
#
#   ./scripts/build-icons.sh
#
# Usa sips, que viene con macOS. En otro sistema, sustituir por ImageMagick.
set -euo pipefail
cd "$(dirname "$0")/.."

MAESTRO="assets/logo-master.png"
[ -f "$MAESTRO" ] || { echo "No existe $MAESTRO"; exit 1; }

echo "Iconos de aplicacion y favicon"
sips -s format png -Z 512 "$MAESTRO" --out public/icon-512.png            >/dev/null
sips -s format png -Z 192 "$MAESTRO" --out public/icon-192.png            >/dev/null
sips -s format png -Z 180 "$MAESTRO" --out public/apple-touch-icon.png    >/dev/null
sips -s format png -Z 32  "$MAESTRO" --out public/favicon-32.png          >/dev/null
sips -s format png -Z 16  "$MAESTRO" --out public/favicon-16.png          >/dev/null

# Maskable: Android recorta a un circulo, asi que el arte se reduce al 80% y el
# resto se rellena. Sin esto, la palabra TRAIN de la parte baja queda cortada.
echo "Icono maskable con zona segura"
sips -s format png -Z 410 "$MAESTRO" --out /tmp/lt-mask.png               >/dev/null
sips --padToHeightWidth 512 512 --padColor 0A0A0A /tmp/lt-mask.png \
     --out public/icon-maskable-512.png                                   >/dev/null

# Marca de la cabecera: solo la cabeza. El logotipo completo lleva el texto dentro
# y a 32px no se lee. Las coordenadas son del maestro de 1254x1254.
echo "Marca de la cabecera"
sips -c 500 500 --cropOffset 20 300 "$MAESTRO" --out /tmp/lt-head.png     >/dev/null
sips -s format png -Z 96 /tmp/lt-head.png --out src/assets/logo-mark.png  >/dev/null

rm -f /tmp/lt-mask.png /tmp/lt-head.png
echo "Listo."
