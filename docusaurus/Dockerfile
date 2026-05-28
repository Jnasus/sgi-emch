# ── Stage 1: development ──────────────────────────────────────────────────────
FROM node:18-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# ── Stage 3: production ───────────────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
