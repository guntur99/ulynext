# Gunakan Node.js LTS sebagai base image
FROM node:20-alpine AS builder

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json untuk menginstal dependensi
COPY package.json package-lock.json ./

# Instal dependensi produksi dan dev, lalu bersihkan cache
RUN npm ci --production && \
    npm install && \
    npm cache clean --force

# Salin semua file proyek Anda ke direktori kerja
COPY . .

# Bangun aplikasi Next.js untuk produksi
RUN npm run build

# Tahap produksi
FROM node:20-alpine AS runner

WORKDIR /app

# Salin dependensi produksi dari tahap builder
COPY --from=builder /app/node_modules ./node_modules

# Salin folder .next yang sudah di-build dan file public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Salin package.json untuk script start
COPY --from=builder /app/package.json ./package.json

# Atur environment variable untuk port yang akan digunakan Cloud Run (default: 8080)
ENV PORT 8080

# Jalankan aplikasi Next.js dalam mode produksi
CMD ["npm", "start"]