# FocusRoom

Ambiente minimalista e inmersivo para sesiones de concentración. Pensado
para dejarlo abierto en un segundo monitor o tablet mientras trabajas.

## Funcionalidad

- Temporizador con 4 presets (Pomodoro, Foco corto, Trabajo profundo,
  Personalizado), basado en timestamps (no se desincroniza si la pestaña
  pierde foco)
- Intención de foco opcional, visible durante la sesión
- 4 ambientes visuales (Cuarto lluvioso, Cafetería, Bosque, Espacio
  profundo), cada uno con su propia paleta oscura — completamente
  desacoplados de la lógica del temporizador
- Sonido ambiental: el ruido blanco se genera 100% con Web Audio API,
  sin ningún archivo; los otros 3 necesitan que agregues tus propios
  archivos de audio (ver abajo)
- Modo foco: durante una sesión activa se ocultan los controles no
  esenciales
- Pantalla completa (opcional, con fallback si el navegador no la
  soporta)
- Registro de sesiones + estadísticas (tiempo total, sesiones de hoy,
  etc.), todo en `localStorage`
- Instalable como PWA

## Sobre el loop de los sonidos

Los sonidos con archivo (lluvia, cafetería, bosque) hacen un **crossfade
de 2 segundos** en cada vuelta del loop — dos copias del audio se
superponen brevemente con un fundido cruzado, para disimular cualquier
corte audible en el punto donde el clip vuelve a empezar, incluso si el
archivo que conseguiste no es un loop perfecto. El ruido blanco no lo
necesita: al ser una señal aleatoria continua, el punto de loop es
indistinguible de por sí.

## Agregar los sonidos ambientales

El ruido blanco funciona sin hacer nada. Para lluvia, cafetería y
bosque, necesitas conseguir tus propios archivos de audio (por temas de
licencia, no vienen incluidos) y ponerlos exactamente acá:

```
public/sounds/rain.mp3
public/sounds/coffee-shop.mp3
public/sounds/forest.mp3
```

Recomendado: [freesound.org](https://freesound.org), filtrando por
licencia **CC0** (dominio público, sin necesidad de atribución). Busca
algo como "rain loop", "coffee shop ambience", "forest ambience". Si el
archivo no existe, la app no se rompe — muestra un aviso indicando qué
archivo falta.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy a GitHub Pages

1. Settings → Pages → Source: GitHub Actions.
2. Push a `main`.
3. Si el repo no se llama `focusroom`, ajusta `base` en `vite.config.ts`
   **y** `start_url`/`scope` en el manifest dentro del mismo archivo
   (la PWA necesita que coincidan con el subpath real).

## Notas técnicas

- El temporizador recalcula el tiempo restante contra un timestamp de
  inicio (`Date.now()`) en cada tick, en vez de simplemente restar de un
  contador — así no se desincroniza si el dispositivo se suspende o la
  pestaña pierde foco un rato.
- Los íconos de `public/icons/` son un placeholder simple generado para
  que el manifest de la PWA sea válido — reemplázalos por tu propia
  marca cuando quieras.
- Paleta y tipografía (Sora + Space Mono) son propias de este proyecto,
  intencionalmente distintas al resto del portafolio — es un ambiente
  inmersivo oscuro, no encajaba con el tema claro/cálido de los demás.
