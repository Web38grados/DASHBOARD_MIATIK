# syntax=docker/dockerfile:1.7
#
# Imagen genérica del dashboard (frontend estático + mock opcional).
# Criterios de LLD-03 §4 que aplican a un frontend: bases fijadas por digest, usuario no root,
# sin herramientas de red añadidas y una sola fuente (este Dockerfile) para todos los destinos.
#
# Destinos (--target):
#   web   (por defecto) nginx sin privilegios sirve dist/ y reenvía /api a API_UPSTREAM.
#   mock  servidor de solo lectura de db.json (mismas rutas que json-server, errores con su código HTTP).
#
# Para actualizar una base: docker buildx imagetools inspect <imagen:tag> y reemplazar el digest.

ARG NODE_IMAGE=node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.28-alpine@sha256:7377697a821c131a924a7105fafbe7414db4e9fcc77a6f08f776f33f141ec3f8

# ---------- build: compila la app con Vite ----------
FROM ${NODE_IMAGE} AS build
WORKDIR /app
# Primero el manifiesto, para reaprovechar la capa de dependencias si solo cambia el código.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---------- mock: sirve db.json (solo para entornos sin API real) ----------
FROM ${NODE_IMAGE} AS mock
WORKDIR /mock
ENV NODE_ENV=production \
    PORT=3001 \
    DB_PATH=/mock/db.json
COPY --chown=node:node scripts/servidor-mock.mjs db.json ./
USER node
EXPOSE 3001
CMD ["node", "servidor-mock.mjs"]

# ---------- web: estáticos con nginx sin root (destino por defecto) ----------
FROM ${NGINX_IMAGE} AS web
# PORT lo fija Cloud Run (8080 por defecto). API_UPSTREAM: URL base del backend o del mock, sin «/» final.
ENV PORT=8080 \
    API_UPSTREAM=http://mock:3001
# La imagen oficial procesa /etc/nginx/templates/*.template con envsubst al arrancar.
COPY --chown=nginx:nginx docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
