# Keyword Ranking Tracking Guide

## 🎯 Overview

Track how your blog posts rank in Google Search for different keywords across countries (Vietnam, China, Taiwan) and languages (English, Vietnamese, Chinese).

## 📊 Tracking Methods

### 1. **Google Search Console (FREE - Recommended)**

**Best for:** Official Google data, country-specific rankings, free

#### Setup Steps:

1. **Add Your Site to Google Search Console**
   - Go to: https://search.google.com/search-console
   - Add property: `https://tecxmate.com`
   - Verify ownership (DNS, HTML file, or meta tag)

2. **Submit Sitemap**
   - Go to: Sitemaps → Add new sitemap
   - Submit: `https://tecxmate.com/sitemap.xml`
   - Wait for Google to index your pages

3. **Monitor Performance**
   - Go to: Performance → Search Results
   - View queries, pages, countries, devices
   - Filter by country (Vietnam, China, Taiwan)
   - Filter by date range

4. **Track Specific Keywords**
   - Go to: Performance → Search Results
   - Click "Queries" tab
   - Search for your target keywords:
     - English: "tech consulting", "AI development"
     - Vietnamese: "tư vấn công nghệ", "phát triển AI"
     - Chinese: "技術諮詢", "AI開發"
   - See impressions, clicks, CTR, average position

5. **Country-Specific Tracking**
   - Go to: Performance → Search Results
   - Click "Countries" tab
   - See performance by country
   - Filter by specific countries (VN, CN, TW)

6. **Page Performance**
   - Go to: Performance → Pages
   - See which pages rank best
   - Identify top-performing blog posts
   - Track rankings for each post

#### Key Metrics to Monitor:

- **Impressions**: How often your site appears in search
- **Clicks**: How many users click your site
- **CTR (Click-Through Rate)**: Clicks / Impressions
- **Average Position**: Your average ranking position
- **Top Queries**: Keywords that drive traffic
- **Top Pages**: Blog posts that perform best

#### Export Data:

- Click "Export" button
- Download CSV or Google Sheets
- Track weekly/monthly changes
- Compare performance over time

---

### 2. **Google Analytics 4 (FREE - Already Installed)**

**Best for:** Traffic analysis, user behavior, country data

#### Setup Steps:

1. **Verify Installation**
   - Check: Your site already has Google Analytics
   - File: `components/google-analytics.tsx`
   - Verify: Data is flowing to GA4

2. **Set Up Custom Reports**
   - Go to: Google Analytics → Explore
   - Create custom report for:
     - Traffic by country
     - Traffic by language
     - Blog post performance
     - Keyword performance

3. **Monitor Traffic Sources**
   - Go to: Acquisition → Traffic Acquisition
   - See: Organic search traffic
   - Filter by: Country, language, device

4. **Track Blog Post Performance**
   - Go to: Engagement → Pages and Screens
   - See: Which blog posts get most traffic
   - Filter by: Country, date range
   - Track: Page views, time on page, bounce rate

5. **Country-Specific Analysis**
   - Go to: User → User Attributes → Demographics
   - See: Traffic by country
   - Track: Vietnam, China, Taiwan traffic
   - Monitor: Growth over time

#### Key Metrics to Monitor:

- **Organic Search Traffic**: Traffic from Google
- **Country Traffic**: Traffic by country (VN, CN, TW)
- **Top Landing Pages**: Blog posts that drive traffic
- **Bounce Rate**: User engagement
- **Session Duration**: Time spent on site
- **Pages per Session**: User engagement depth

---

### 3. **Manual Tracking (FREE - Simple)**

**Best for:** Quick checks, specific keywords, no setup

#### Method 1: Google Search (Manual)

1. **Use Incognito Mode** (to avoid personalization)
2. **Search for your keywords**:
   - English: "tech consulting Taiwan"
   - Vietnamese: "tư vấn công nghệ Việt Nam"
   - Chinese: "台灣技術諮詢"
3. **Check your ranking position**
4. **Note the position** in a spreadsheet
5. **Repeat weekly/monthly**

#### Method 2: Country-Specific Search

1. **Use Google Search with Country Parameter**:
   - Vietnam: `https://www.google.com.vn/search?q=tư+vấn+công+nghệ`
   - China: `https://www.google.com.hk/search?q=技術諮詢`
   - Taiwan: `https://www.google.com.tw/search?q=台灣技術諮詢`
2. **Check your ranking position**
3. **Track in spreadsheet**

#### Method 3: VPN + Google Search

1. **Use VPN** to change location:
   - Connect to Vietnam
   - Search: "tư vấn công nghệ"
   - Check ranking
   - Connect to China
   - Search: "技術諮詢"
   - Check ranking
2. **Note positions** in spreadsheet

#### Tracking Spreadsheet Template:

| Date | Keyword | Language | Country | Position | URL | Notes |
|------|---------|----------|---------|----------|-----|-------|
| 2024-01-15 | tech consulting | en | TW | 5 | /blog/post-1 | Improved |
| 2024-01-15 | tư vấn công nghệ | vi | VN | 12 | /blog/post-1 | New |
| 2024-01-15 | 技術諮詢 | zh | CN | 8 | /blog/post-1 | Stable |

---

### 4. **Paid Tools (Advanced Tracking)**

#### A. **Ahrefs** ($99/month)
- Track unlimited keywords
- Historical ranking data
- Competitor analysis
- Backlink tracking
- **Best for:** Professional SEO tracking

#### B. **SEMrush** ($119/month)
- Keyword tracking
- Position tracking
- Competitor analysis
- Traffic analytics
- **Best for:** Comprehensive SEO suite

#### C. **Serpstat** ($69/month)
- Keyword tracking
- Position tracking
- Competitor analysis
- **Best for:** Budget-friendly option

#### D. **Moz Pro** ($99/month)
- Keyword tracking
- Rank tracking
- Site audits
- **Best for:** All-in-one SEO tool

---

### 5. **Automated Tracking Script (Custom)**

**Best for:** Automated tracking, custom reports, free

#### Setup:

1. **Create tracking script** (Python/Node.js)
2. **Use Google Search API** or scraping
3. **Track keywords daily/weekly**
4. **Store data in database**
5. **Generate reports**

#### Example Script Structure:

```python
# keyword_tracker.py
import requests
from datetime import datetime

keywords = [
    {'keyword': 'tech consulting', 'country': 'TW', 'language': 'en'},
    {'keyword': 'tư vấn công nghệ', 'country': 'VN', 'language': 'vi'},
    {'keyword': '技術諮詢', 'country': 'CN', 'language': 'zh'},
]

def track_keyword(keyword, country, language):
    # Search Google
    # Find your site position
    # Return position
    pass

# Run daily
for kw in keywords:
    position = track_keyword(kw['keyword'], kw['country'], kw['language'])
    # Save to database
```

---

## 🎯 Recommended Tracking Strategy

### Phase 1: Initial Setup (Week 1)

1. **Set up Google Search Console**
   - Add site
   - Submit sitemap
   - Verify ownership

2. **Set up Google Analytics**
   - Verify tracking
   - Set up custom reports
   - Configure goals

3. **Create Tracking Spreadsheet**
   - List all target keywords
   - Include English, Vietnamese, Chinese
   - Set up weekly tracking schedule

### Phase 2: Weekly Tracking (Ongoing)

1. **Monday: Check Google Search Console**
   - Review performance report
   - Check new keywords
   - Identify top-performing posts

2. **Wednesday: Manual Keyword Check**
   - Check top 10 keywords manually
   - Note position changes
   - Update spreadsheet

3. **Friday: Analytics Review**
   - Review traffic by country
   - Check blog post performance
   - Identify trends

### Phase 3: Monthly Analysis (Monthly)

1. **Monthly Report**
   - Compare month-over-month
   - Identify growth keywords
   - Identify declining keywords
   - Adjust strategy

2. **Keyword Research**
   - Find new opportunities
   - Analyze competitor keywords
   - Update keyword list

---

## 📋 Target Keywords to Track

### English Keywords

**Primary Keywords:**
- tech consulting
- AI development
- business automation
- web development
- startup consulting
- SME solutions
- digital transformation

**Location-Specific:**
- tech consulting Taiwan
- tech consulting Vietnam
- tech consulting China
- Taiwan tech consultancy
- Vietnam technology services

### Vietnamese Keywords

**Primary Keywords:**
- tư vấn công nghệ
- phát triển AI
- tự động hóa doanh nghiệp
- phát triển web
- chuyển đổi số
- tư vấn công nghệ Việt Nam

### Chinese Keywords

**Primary Keywords:**
- 技術諮詢
- AI開發
- 業務自動化
- 網頁開發
- 數位轉型
- 台灣技術諮詢

---

## 📊 Tracking Dashboard Template

### Weekly Tracking Report

**Week of: [Date]**

#### Top Performing Keywords

| Keyword | Language | Country | Position | Change | URL |
|---------|----------|---------|----------|--------|-----|
| tech consulting | en | TW | 5 | +2 | /blog/post-1 |
| tư vấn công nghệ | vi | VN | 12 | +5 | /blog/post-1 |
| 技術諮詢 | zh | CN | 8 | -1 | /blog/post-1 |

#### Traffic by Country

| Country | Sessions | Change | Top Keyword |
|---------|----------|--------|-------------|
| Vietnam | 150 | +20% | tư vấn công nghệ |
| China | 120 | +15% | 技術諮詢 |
| Taiwan | 200 | +10% | tech consulting |

#### Top Performing Blog Posts

| Post | Views | Country | Top Keyword |
|------|-------|---------|-------------|
| AI Development Guide | 500 | TW | AI development |
| Business Automation | 300 | VN | tự động hóa doanh nghiệp |
| Digital Transformation | 250 | CN | 數位轉型 |

---

## 🚀 Quick Start Checklist

- [ ] Set up Google Search Console
- [ ] Submit sitemap
- [ ] Verify Google Analytics tracking
- [ ] Create keyword tracking spreadsheet
- [ ] List all target keywords (English, Vietnamese, Chinese)
- [ ] Set up weekly tracking schedule
- [ ] Check rankings manually (weekly)
- [ ] Review Google Search Console (weekly)
- [ ] Review Google Analytics (weekly)
- [ ] Create monthly report template
- [ ] Set up alerts for ranking changes

---

## 💡 Pro Tips

1. **Focus on Long-Tail Keywords**: More specific = less competition
2. **Track Competitor Keywords**: See what they rank for
3. **Monitor New Keywords**: Google Search Console shows new queries
4. **Track Seasonal Trends**: Some keywords perform better at certain times
5. **A/B Test Titles**: Different titles can improve rankings
6. **Update Old Posts**: Refresh content to improve rankings
7. **Build Backlinks**: Quality backlinks improve rankings
8. **Monitor Mobile Rankings**: Mobile rankings may differ from desktop

---

## 🔧 Tools & Resources

### Free Tools:
- Google Search Console (FREE)
- Google Analytics (FREE)
- Google Trends (FREE)
- Ubersuggest (Free tier)
- Answer The Public (FREE)

### Paid Tools:
- Ahrefs ($99/month)
- SEMrush ($119/month)
- Moz Pro ($99/month)
- Serpstat ($69/month)

### Browser Extensions:
- SEOquake (FREE)
- MozBar (FREE)
- Ahrefs SEO Toolbar (FREE)

---

## 📈 Success Metrics

### Track These Metrics:

1. **Keyword Rankings**
   - Average position
   - Number of keywords in top 10
   - Number of keywords in top 3

2. **Traffic**
   - Organic search traffic
   - Traffic by country
   - Traffic by language

3. **Engagement**
   - Click-through rate (CTR)
   - Bounce rate
   - Time on page
   - Pages per session

4. **Conversions**
   - Form submissions
   - Consultation bookings
   - Contact form submissions

---

## 🎯 Next Steps

1. **Set up Google Search Console** (if not done)
2. **Submit sitemap** (`https://tecxmate.com/sitemap.xml`)
3. **Create tracking spreadsheet** with your keywords
4. **Set up weekly tracking schedule**
5. **Start monitoring rankings**
6. **Create monthly reports**
7. **Adjust strategy based on data**

---

## 📞 Need Help?

- Google Search Console Help: https://support.google.com/webmasters
- Google Analytics Help: https://support.google.com/analytics
- SEO Best Practices: https://developers.google.com/search/docs

---

**Remember:** Tracking keyword rankings takes time. Don't expect immediate results. Focus on creating great content and the rankings will follow! 🚀

