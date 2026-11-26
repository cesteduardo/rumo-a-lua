#!/bin/bash
# Roda um script do Godot sem ficar preso: ferramentas/godot-rodar.sh <segundos> <marcador de fim> <args do godot...>
P="$HOME/www/Rumo a Lua"; SEG=$1; FIM=$2; shift 2
SAIDA=$(mktemp)
flatpak run --filesystem="$P" --filesystem=/tmp org.godotengine.Godot --path "$P/godot" "$@" </dev/null >"$SAIDA" 2>&1 &
for ((i=0;i<SEG*2;i++)); do sleep 0.5; grep -q "$FIM" "$SAIDA" && break; grep -q "SCRIPT ERROR\|Parse Error" "$SAIDA" && { sleep 1; break; }; done
flatpak kill org.godotengine.Godot 2>/dev/null
grep -v "^Godot Engine\|^$\|OpenGL API\|Vulkan" "$SAIDA"; rm -f "$SAIDA"
