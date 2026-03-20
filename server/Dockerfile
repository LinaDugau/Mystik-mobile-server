FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --omit=dev

# В образ попадает и ca.crt (TLS к Timeweb MySQL); db-mysql.js подхватывает его автоматически.
COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "index-mysql.js"]
