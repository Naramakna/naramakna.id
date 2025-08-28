# 🎯 Setup Google AdSense untuk Naramakna.id

## Strategi Monetisasi Multi-Channel

### 1. **Google Ads Search Campaign** (Budget: Rp 100.000)
- ✅ Sudah aktif untuk drive traffic ke website
- Target: Keywords berita, trending topics
- Tujuan: Increase visitor count

### 2. **Google AdSense Display Network** (Revenue Generator)
- 🆕 Tampilkan iklan otomatis dari Google network
- Monetize website traffic dengan display ads
- Revenue sharing dengan Google

### 3. **Internal Banner Ads** (Local Advertisers)
- 🏪 Pengiklan lokal (warung, toko, jasa)
- Custom design & manual upload
- Premium pricing untuk placement

---

## 🔧 Setup Google AdSense

### Step 1: Daftar Google AdSense
1. Kunjungi [Google AdSense](https://www.google.com/adsense/)
2. Daftar dengan akun Google yang sama dengan Google Ads
3. Submit website naramakna.id untuk review
4. Tunggu approval (biasanya 1-3 hari)

### Step 2: Buat Ad Units untuk Semua Placement
Setelah approved, buat ad units dengan ukuran berikut di AdSense dashboard:

#### **Homepage Placements (970x250)**
- `hero-banner` → Display Ad 970x250
- `header` → Display Ad 970x250  
- `mid-content` → Responsive Display Ad
- `bottom-content` → Responsive Display Ad

#### **Content & Sidebar**
- `regular` → Leaderboard 728x90
- `sidebar` → Medium Rectangle 300x250

#### **Article Placements**
- `article-top` → Display Ad 970x250
- `article-mid` → Leaderboard 728x90
- `article-bottom` → Display Ad 970x250
- `article-final` → Leaderboard 728x90
- `content-ad` → Responsive In-article Ad

#### **Breaking News**
- `breaking-pre` → Leaderboard 728x90
- `breaking-post` → Leaderboard 728x90

### Step 3: Copy Ad Unit IDs
Dari setiap ad unit, copy ID slot dan masukkan ke environment:

### Step 3: Konfigurasi Environment Variables
1. Copy `.env.example` ke `.env`
2. Update dengan Publisher ID dan Ad Slots yang benar
3. Restart frontend application

### Step 4: Buat AdSense Ads di Admin Panel
1. Login sebagai superadmin
2. Buka **Advertisement Management**
3. Klik **+ Create Ad**
4. Pilih **Media Type: Google AdSense (Auto)**
5. Set placement dan schedule
6. Save - iklan otomatis akan muncul!

---

## 💰 Revenue Strategy

### AdSense Earnings (Estimasi)
- **RPM Indonesia**: Rp 3.000 - 8.000 per 1000 views
- **Target traffic**: 10.000 views/hari
- **Estimated revenue**: Rp 30.000 - 80.000/hari

### Local Ads Pricing
- **Hero Banner (970x250)**: Rp 200.000/minggu
- **Regular Banner (728x90)**: Rp 100.000/minggu  
- **Sidebar (300x250)**: Rp 125.000/minggu

### Combined Strategy
1. **Google Ads** untuk drive traffic
2. **AdSense** untuk monetize traffic
3. **Local ads** untuk premium revenue

---

## 🎨 Ad Placement Strategy

### Homepage
```
[Header Navigation]
[Hero AdSense Banner 970x250]    ← Auto Google ads
[Breaking News]
[Content Area] [Sidebar Local Ads] ← Manual local ads
[Mid-Content AdSense 728x90]      ← Auto Google ads
[Bottom Content]
```

### Article Pages
```
[Header Navigation] 
[Article Title]
[Top AdSense Banner 970x250]     ← Auto Google ads
[Article Content]
  [Mid-Article Local Ad 728x90]  ← Manual local ads
[Article Content continues...]
[Bottom AdSense 970x250]         ← Auto Google ads
[Related Articles]
```

---

## 📊 Performance Monitoring

### AdSense Metrics
- **Page RPM**: Revenue per 1000 pageviews
- **CPC**: Cost per click
- **CTR**: Click through rate
- **Impression count**

### Local Ads Metrics  
- **Click tracking**: Monitor dalam AdminAds
- **Impression count**: Auto tracked
- **Campaign duration**: Set di admin panel
- **Performance reports**: Export dari database

---

## 🚀 Next Steps

1. **Immediate**: Setup AdSense account
2. **Week 1**: Configure environment variables
3. **Week 2**: Create first AdSense campaigns
4. **Week 3**: Monitor performance & optimize
5. **Month 1**: Scale local advertiser acquisition

### Tools yang Dibutuhkan
- ✅ Google AdSense account
- ✅ Admin panel (sudah ada)
- ✅ AdBanner component (sudah integrated)
- ⏳ Environment configuration
- ⏳ Performance analytics dashboard

---

## 💡 Pro Tips

### Optimize AdSense Revenue
1. **Content quality**: High-quality articles = better ad rates
2. **Traffic source**: Organic traffic performs better
3. **User engagement**: Longer session = more ad views
4. **Mobile optimization**: 70%+ traffic dari mobile

### Local Advertiser Acquisition
1. **Cold outreach**: Approach local businesses
2. **Media kit**: Show traffic stats & demographics  
3. **Case studies**: Success stories dari advertiser pertama
4. **Bundling**: Combine dengan social media promotion

### Performance Optimization
1. **A/B testing**: Different ad placements
2. **Loading speed**: Fast loading = better user experience
3. **Ad balance**: Jangan terlalu banyak ads
4. **Relevancy**: Match ads dengan content context