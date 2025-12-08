# IQ Sähkö Phase 1 Approval Site

A clean, single-page application for client approval of brand identity elements.

## 📁 File Structure

```
phase1-approval-site/
├── index.html          # Main HTML structure
├── styles.css          # All styling (separate file for easy editing)
├── script.js           # Tab navigation functionality
└── README.md           # This file
```

## 🚀 Quick Start

### Option 1: Python Local Server (Recommended)

```bash
cd phase1-approval-site
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

### Option 2: VS Code Live Server

1. Open folder in VS Code
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

### Option 3: Direct File

Simply open `index.html` in your browser (some features may not work)

## 🌐 Deploy to GitHub Pages

1. **Create new repo** (or use existing)
   ```bash
   git init
   git add .
   git commit -m "Initial Phase 1 approval site"
   ```

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/iq-sahko-phase1.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: Deploy from branch `main` / root
   - Save
   - Site will be live at: `https://yourusername.github.io/iq-sahko-phase1/`

## ✏️ Customization Guide

### Colors (in `styles.css`)

```css
:root {
    --amber: #FFA854;      /* Change hero color */
    --charcoal: #2D2D2D;   /* Change primary dark */
    --white: #F8F6F2;      /* Change primary light */
    /* ... more colors */
}
```

### Fonts

Currently using Google Fonts (loaded in `<head>`):
- **Outfit** - Headlines, logo, navigation
- **Work Sans** - Body text, descriptions

To change fonts:
1. Update Google Fonts link in `index.html`
2. Update variables in `styles.css`:
   ```css
   --font-primary: 'YourFont', sans-serif;
   --font-secondary: 'YourFont', sans-serif;
   ```

### Spacing

Adjust spacing variables in `styles.css`:
```css
:root {
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 40px;
    --spacing-xl: 60px;
}
```

### Add New Sections

1. Add nav link in `<nav class="nav-menu">`:
   ```html
   <li><a href="#newsection" class="nav-link" data-tab="newsection">New Section</a></li>
   ```

2. Add content section:
   ```html
   <section id="newsection" class="tab-content">
       <div class="content-header">
           <h2>New Section</h2>
       </div>
       <!-- Your content -->
   </section>
   ```

## 🎨 Working with Claude Code

Once you have the site running locally:

1. **Open in VS Code**
   ```bash
   code phase1-approval-site
   ```

2. **Start Claude Code session** in terminal

3. **Common tasks for Claude Code:**
   - "Add a favicon and optimize for mobile"
   - "Make the logo concepts clickable to zoom"
   - "Add a print stylesheet"
   - "Create a feedback form instead of mailto link"
   - "Add smooth scroll animations"
   - "Optimize images and add lazy loading"

## 📝 Content Updates

### Email Address

Change `petteri@petsq.works` in:
- Sidebar: `.nav-footer .feedback-btn`
- Next Steps: `.action-required .cta-button`

### Deadline

Update deadline in sidebar:
```html
<p class="deadline">Deadline: Dec 9, 2025</p>
```

### Logo Concepts

Logo SVGs are inline in `index.html` under `#logo` section.
To update, edit the `<svg>` elements directly.

## 🔧 Technical Notes

- **No dependencies** - Pure HTML/CSS/JS
- **Mobile responsive** - Works on all screen sizes
- **Keyboard navigation** - Arrow keys to navigate tabs
- **Hash-based routing** - URLs update as you navigate
- **Smooth animations** - Subtle fade-in effects

## 📋 Pre-Launch Checklist

Before sending to client:

- [ ] Update email addresses
- [ ] Update deadline if needed
- [ ] Check all content for typos
- [ ] Test on mobile device
- [ ] Test all navigation links
- [ ] Test feedback button
- [ ] Add any custom content
- [ ] Deploy to live URL

## 🤝 Workflow Tips

**Claude Chat (me)** → Design decisions, content, strategy
**Claude Code** → Implementation, debugging, optimization

Example workflow:
1. Discuss content changes with me
2. I provide the text/direction
3. You implement with Claude Code
4. Test and iterate

## 💡 Ideas for Phase 2

Once approved, these files can evolve into:
- Full website with service pages
- Blog/case studies section
- Contact form integration
- CMS integration (if needed)
- Multi-language support (Finnish/English)

## 🐛 Troubleshooting

**Fonts not loading?**
- Check internet connection (Google Fonts requires internet)
- Or download fonts and host locally

**Styles not applying?**
- Check `styles.css` is in same folder as `index.html`
- Check browser console for errors
- Try hard refresh (Cmd/Ctrl + Shift + R)

**Tabs not switching?**
- Check `script.js` is in same folder
- Check browser console for JavaScript errors
- Ensure all `data-tab` attributes match `id` attributes

## 📞 Support

For design questions → Claude Chat (me!)
For technical issues → Claude Code

---

Created December 2025 for IQ Sähkö brand launch