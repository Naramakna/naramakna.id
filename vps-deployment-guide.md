# VPS Deployment Guide (Tanpa Domain)

## 🚀 Cara Deploy ke VPS Tanpa Domain

### Option 1: Akses Langsung via IP VPS

#### Setup Backend di VPS:
```bash
# Di VPS, clone repo
git clone https://github.com/your-username/naramakna.id.git
cd naramakna.id/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env sesuai VPS settings

# Set CORS untuk IP VPS
export CORS_ORIGIN="http://YOUR_VPS_IP:5173,https://YOUR_VPS_IP:5173"

# Jalankan backend
npm start
```

#### Setup Frontend di VPS:
```bash
# Di terminal baru
cd ../frontend

# Install dependencies  
npm install

# Edit config API untuk point ke VPS IP
# Edit src/config/api.ts:
# const API_BASE_URL = 'http://YOUR_VPS_IP:3001/api'

# Build dan serve frontend
npm run build
npm run preview -- --host 0.0.0.0 --port 5173
```

#### Akses dari Browser:
- Frontend: `http://YOUR_VPS_IP:5173`
- Backend API: `http://YOUR_VPS_IP:3001`

---

### Option 2: Ngrok/Localtunnel (Easiest untuk Testing)

#### Install Ngrok:
```bash
# Download ngrok dari https://ngrok.com/
# Atau pakai npm:
npm install -g ngrok

# Expose backend
ngrok http 3001

# Expose frontend (terminal baru)
ngrok http 5173
```

#### Update CORS dengan Ngrok URLs:
```bash
# Set environment variable
export CORS_ORIGIN="https://abc123.ngrok.io,https://def456.ngrok.io"
```

---

### Option 3: Cloudflare Tunnel (Free & Recommended)

#### Install Cloudflared:
```bash
# Ubuntu/Debian
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# CentOS/RHEL
sudo rpm -i https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
```

#### Setup Tunnel:
```bash
# Login ke Cloudflare
cloudflared tunnel login

# Buat tunnel
cloudflared tunnel create naramakna-backend
cloudflared tunnel create naramakna-frontend

# Route traffic
cloudflared tunnel route dns naramakna-backend backend-random123.cloudflareaccess.com
cloudflared tunnel route dns naramakna-frontend frontend-random123.cloudflareaccess.com

# Run tunnels
cloudflared tunnel run --hostname backend-random123.cloudflareaccess.com --url localhost:3001 naramakna-backend &
cloudflared tunnel run --hostname frontend-random123.cloudflareaccess.com --url localhost:5173 naramakna-frontend &
```

---

### Option 4: Port Forwarding (Untuk Testing Pribadi)

#### Setup SSH Tunnel:
```bash
# Dari komputer lokal, forward port VPS ke lokal
ssh -L 3001:localhost:3001 -L 5173:localhost:5173 user@YOUR_VPS_IP

# Sekarang bisa akses via:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

---

## 🔧 Quick Setup untuk Testing

**Paling gampang untuk testing cepat:**

1. **Deploy ke VPS dengan IP langsung:**
   ```bash
   # Edit CORS di VPS
   export CORS_ORIGIN="http://YOUR_VPS_IP:5173"
   
   # Uncomment line di app.js:
   # 'http://YOUR_VPS_IP:5173',
   ```

2. **Atau pakai Ngrok (super cepat):**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start
   ngrok http 3001
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   ngrok http 5173
   
   # Update CORS dengan ngrok URLs
   ```

## 🚨 Important Notes:

- **Firewall**: Pastikan port 3001 dan 5173 dibuka di VPS
- **SSL**: Untuk HTTPS, pakai reverse proxy (nginx) atau Cloudflare
- **Security**: Jangan expose database port ke internet
- **Performance**: Untuk production, pakai PM2 atau Docker

Mau coba yang mana? Ngrok paling gampang untuk testing cepat! 🚀
