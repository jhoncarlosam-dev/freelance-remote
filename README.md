# Portafolio de edición de video

Sitio para mostrar edición de Reels, TikTok y Shorts en CapCut, con portadas y miniaturas en Canva, y para preparar los mensajes a los primeros contactos.

La página pública está en `sitio/index.html`. Las notas de prospección, que no se envían a los clientes, están en `sitio/kit.html`.

## Personalizar

Edita `sitio/js/perfil.js`:

- `nombre`
- `ciudad`
- `whatsapp` con indicativo y solo números, por ejemplo `573001112233`
- `email`
- `instagram` sin @
- `portafolioUrl` cuando tengas el enlace público
- `videos` cuando haya piezas reales, con `titulo`, `url` https y `nota`

## Contactos

La lista de personas va en `privado/contactos.ejemplo.json`. Esa carpeta no se publica. Cada ficha necesita nombre, canal, usuario, a qué se dedica, qué te gusta de su contenido y el enlace.

## Ver en local

```bash
cd sitio && python3 -m http.server 8765 --bind 127.0.0.1
```

Abre `http://127.0.0.1:8765`.
