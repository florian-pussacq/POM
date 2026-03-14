FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Remove dev files
RUN rm -f .env.example

EXPOSE 3000

CMD ["node", "app.js"]
