# Nordic Smart Cabin — Landing Page Build Instructions

## Overview
Build a single-file landing page (`index.html`) for "Nordic Smart Cabin" — a co-branded concept by IQ Sähkö × Loxone. The page sells intelligent cabin automation to Nordic resort owners while simultaneously impressing Loxone's team with the quality of execution.

This file contains everything needed: design specs, complete copy, component details, and technical requirements.

---

## Technical Requirements

- **Single HTML file** (`index.html`) — all CSS and JS inline
- **External dependencies:** Google Fonts only (Outfit + Work Sans)
- **Images:** Local files in `./images/` folder (hero.jpg, problem.jpg, solution.jpg, resort.jpg)
- **Vanilla HTML/CSS/JS** — no frameworks
- **Responsive:** Must look excellent on desktop (1440px+) and tablet (768px+). Mobile (375px) is nice-to-have.
- **Performance:** Lazy load images below the fold. Use `loading="lazy"` on img tags.

---

## Design System

### Colors
```css
:root {
    --bg-primary: #0D0D0D;
    --bg-secondary: #141414;
    --bg-card: rgba(255, 255, 255, 0.04);
    --border-subtle: rgba(255, 255, 255, 0.08);
    --text-primary: #F5F5F0;
    --text-secondary: #A0A0A0;
    --text-muted: #666666;
    --accent-amber: #FFA854;
    --accent-amber-glow: rgba(255, 168, 84, 0.3);
    --accent-green: #74C365;
    --accent-green-glow: rgba(116, 195, 101, 0.3);
    --gradient-amber: linear-gradient(135deg, #FFA854, #FF8A2A);
    --gradient-green: linear-gradient(135deg, #74C365, #5AA847);
}
```

### Typography
```css
/* Headings */
font-family: 'Outfit', sans-serif;
/* H1: 72px / weight 700 / letter-spacing: -2px */
/* H2: 48px / weight 600 / letter-spacing: -1px */
/* Eyebrow labels: 13px / weight 600 / letter-spacing: 3px / uppercase */

/* Body */
font-family: 'Work Sans', sans-serif;
/* Body: 18px / weight 300 / line-height: 1.7 */
/* Body large (intro paragraphs): 20px / weight 300 / line-height: 1.8 */
```

### Spacing
- Sections: 120px padding top/bottom minimum
- Max content width: 1200px, centered
- Generous whitespace between all elements — let it breathe

### Visual Effects
- **Noise/grain overlay:** Subtle SVG filter noise texture over the entire page background (opacity ~0.03)
- **Glow effects:** Accent colors should feel like light sources. Use box-shadow with color-matched glows.
- **Cards:** Dark glass-morphism style — rgba white background, subtle border, backdrop-filter blur if supported
- **Geometric accents:** Subtle 33° angled lines or shapes as decorative elements (this references Loxone's design language)

### Animations
- **Scroll reveal:** Elements fade-in-up (translateY 30px → 0, opacity 0 → 1) when entering viewport. Use Intersection Observer. Stagger children by ~100ms.
- **Hero parallax:** Background image moves at 50% scroll speed.
- **Counter animation:** Stats count up from 0 when scrolled into view. Duration ~2s with easeOutExpo.
- **Logo pulse:** IQ Sähkö logo has a breathing amber glow (see logo code below).
- **Smooth scroll:** CSS scroll-behavior: smooth on html element.

---

## IQ Sähkö Logo Component

Use this exact code for the IQ Sähkö logo in the header and footer:

```html
<a href="https://iqsahko.fi" class="iq-header-logo" target="_blank">
    <div class="iq-header-icon">IQ</div>
    <span class="iq-header-text">SÄHKÖ</span>
</a>
```

```css
.iq-header-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
}
.iq-header-icon {
    width: 36px;
    height: 36px;
    border: 2px solid #FFA854;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 11px;
    color: #FFA854;
    flex-shrink: 0;
    animation: logoPulseHeader 3s ease-in-out infinite;
}
.iq-header-text {
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    font-size: 18px;
    letter-spacing: 2px;
    color: #F8F6F2;
}
.iq-header-logo:hover .iq-header-icon {
    box-shadow: 0 0 20px rgba(255, 168, 84, 0.6), 0 0 35px rgba(255, 168, 84, 0.3);
}
.iq-header-logo:hover .iq-header-text {
    color: #FFA854;
}
@keyframes logoPulseHeader {
    0%, 100% {
        box-shadow: 0 0 6px rgba(255, 168, 84, 0.25);
    }
    50% {
        box-shadow: 0 0 12px rgba(255, 168, 84, 0.6), 0 0 20px rgba(255, 168, 84, 0.3);
    }
}
```

---

## Loxone Logo Component

Create a matching text-based logo for Loxone in their brand style:

```html
<a href="https://www.loxone.com" class="loxone-header-logo" target="_blank">
    <span class="loxone-header-text">LOXONE</span>
</a>
```

Style it with:
- Font: 'Outfit', sans-serif (as a stand-in; their actual font Averta isn't freely available)
- Weight: 400
- Font-size: 20px
- Letter-spacing: 3px
- Color: #74C365
- On hover: add a green glow similar to the amber glow on IQ Sähkö logo

---

## Header Layout

Fixed/sticky header with transparent background that gets a subtle dark backdrop-filter blur on scroll. Contains:
- Left: IQ Sähkö logo
- Center: "×" symbol in muted text (connecting the two brands)
- Right: Loxone logo

---

## Page Sections — Complete Copy

---

### SECTION 1: HERO

**Layout:** Full viewport height (100vh). Background image (`hero.jpg`) with dark overlay (gradient from rgba(13,13,13,0.7) to rgba(13,13,13,0.9)). Content vertically centered.

**Content:**

Eyebrow (small, above headline): `IQ SÄHKÖ × LOXONE`

Headline (H1):
```
Nordic Smart Cabin
```

Subheadline:
```
Intelligent automation for Nordic resort living.
Your cabins take care of themselves.
```

Scroll indicator at bottom: animated bouncing chevron (CSS only)

---

### SECTION 2: THE PROBLEM

**Layout:** Dark section with `problem.jpg` as a subtle low-opacity background on one side, or as an accent image.

**Eyebrow:** `THE CHALLENGE`

**Headline (H2):**
```
Remote cabins. Harsh conditions. Constant worry.
```

**Body text:**
```
Running a cabin resort in the Nordics means managing properties that are 50 kilometers away, in temperatures that drop to –30 °C, with pipes that freeze, heating bills that spike when nobody's there, and guests who expect everything to work perfectly the moment they arrive.

Today, most resort owners rely on manual checks, separate systems for heating, locks, and ventilation — and a lot of hope that nothing goes wrong between visits.
```

**Three problem cards (in a row on desktop, stacked on mobile):**

Card 1:
- Icon: SVG thermometer or snowflake
- Title: `Energy waste`
- Text: `Empty cabins running at full heating. Energy costs spiraling with no visibility or control.`

Card 2:
- Icon: SVG water droplet with alert
- Title: `Freeze & leak risk`
- Text: `Pipes freeze. Water damage goes undetected. A single incident can cost thousands and close a cabin for weeks.`

Card 3:
- Icon: SVG key or lock
- Title: `Access & oversight`
- Text: `Managing locks, check-ins, and maintenance across dozens of cabins spread over vast distances.`

Cards should have the dark glassmorphism style: var(--bg-card) background, var(--border-subtle) border, slight backdrop-filter blur.

---

### SECTION 3: THE SOLUTION — PEACE OF MIND

**Layout:** This is the emotional centerpiece. Use `solution.jpg` as a background or large accent image. Should feel warm and inviting — the visual contrast to the problem section.

**Eyebrow:** `THE SOLUTION`

**Headline (H2):**
```
One system. Zero worry.
```

**Body text:**
```
Nordic Smart Cabin is a fully integrated automation package built on the Loxone platform — purpose-designed for the unique demands of Nordic resort properties.

Instead of juggling separate smart thermostats, standalone leak sensors, and manual lock management, everything runs through one intelligent system. Your cabins monitor themselves, optimize themselves, and only notify you when something actually needs your attention.
```

**Highlighted promise block** (visually distinct — perhaps a bordered left-accent block, or a large-text quote-style element with amber + green accent):

```
The cabin is empty? Heating drops to frost protection mode. A guest is arriving tomorrow? The system warms up automatically. A pipe temperature drops dangerously low? You get an alert before anything breaks. A guest checks out? Ventilation scales down, lights switch off, doors lock.

All of it — automatic.
```

The "All of it — automatic." line should be visually emphasized (larger, bolder, or in accent color).

---

### SECTION 4: HOW IT WORKS — CAPABILITIES

**Layout:** Clean grid. 2 columns × 3 rows on desktop, single column on mobile. Each item has an icon, title, and description.

**Eyebrow:** `CAPABILITIES`

**Headline (H2):**
```
Every worry, handled.
```

**Intro line:**
```
Each capability is designed around one principle: the resort owner shouldn't have to think about it.
```

**Grid items:**

1. Icon: energy/lightning bolt
   Title: `Energy Management`
   Text: `Intelligent heating control based on occupancy, weather, and energy prices. Empty cabins drop to minimum. Pre-heat before check-in. Integrate with spot-price electricity to heat smart, not expensive.`

2. Icon: water shield
   Title: `Water & Freeze Protection`
   Text: `Continuous pipe temperature monitoring. Automatic alerts when temperatures approach freezing. Leak sensors that shut off the main valve instantly — preventing damage before it starts.`

3. Icon: wind/airflow
   Title: `Climate & Ventilation`
   Text: `Airflow adjusts to occupancy. No more ventilating empty cabins at full power. Fresh air when guests arrive, energy savings when they don't.`

4. Icon: lock/key
   Title: `Access Control`
   Text: `Remote lock management across all cabins. Grant and revoke access from anywhere. Welcome lighting triggers when a guest unlocks the door.`

5. Icon: lightbulb
   Title: `Lighting Automation`
   Text: `Welcome scenes for arriving guests. Automatic safety lighting. All lights off after checkout. Exterior lighting on timers and motion sensors for security.`

6. Icon: dashboard/monitor
   Title: `Central Dashboard`
   Text: `One interface for your entire resort. Real-time status of every cabin — temperature, occupancy, energy use, alerts. Accessible from anywhere.`

Icons should be simple SVG line icons in the accent colors (alternate between amber and green for visual rhythm).

---

### SECTION 5: THE BUSINESS CASE

**Layout:** Background image (`resort.jpg`) with dark overlay for the stats area, then text below.

**Eyebrow:** `WHY IT MAKES SENSE`

**Headline (H2):**
```
The numbers speak for themselves.
```

**Stats row (3 large animated counters, side by side):**

Stat 1:
- Number: `40%` (animate counting up, with "Up to" as small prefix)
- Label: `reduction in heating costs`
- Accent: amber

Stat 2:
- Number: `24/7` (appear with a subtle glow animation)
- Label: `automated monitoring & protection`
- Accent: green

Stat 3:
- Number: `1` (animate count)
- Label: `system replacing many`
- Accent: amber

**Body text below stats:**
```
For a resort with 10–30 cabins, the impact is transformative. Reduced energy bills, fewer emergency calls, less manual work, and happier guests who walk into a perfectly prepared cabin every time.

The system scales linearly — adding a new cabin takes hours, not weeks. And because everything runs on one platform, there's one partner to call, one system to learn, one dashboard to check.
```

**Highlighted callout:**
```
Everything in one system. No separate smart thermostats, no standalone sensors, no patchwork of apps. One platform, one login, complete control.
```

---

### SECTION 6: WHY IQ SÄHKÖ × LOXONE

**Layout:** Two-column layout with a subtle dividing line or gradient between them.

**Eyebrow:** `YOUR PARTNER`

**Headline (H2):**
```
Built by experts who understand Nordic conditions — and the technology.
```

**Body intro:**
```
IQ Sähkö is a Finnish smart home and electrical contracting company with over a decade of experience designing and installing intelligent building systems. As an experienced Loxone partner, we engineer complete solutions tailored to each property.
```

**Two columns:**

**Left column — amber accent:**
Title: `IQ Sähkö brings`
- 10+ years in smart home engineering
- Deep Loxone platform expertise
- Finnish market knowledge and presence
- End-to-end delivery: design, install, commissioning
- Ongoing maintenance and support

**Right column — green accent:**
Title: `Loxone provides`
- Industry-leading automation platform
- Proven across thousands of installations worldwide
- Complete product ecosystem
- Local data processing — no cloud dependency
- Architecture that scales from one cabin to a full resort

---

### SECTION 7: CALL TO ACTION

**Layout:** Full-width section with a gradient background (subtle amber-to-green horizontal gradient at very low opacity over the dark base).

**Headline (H2):**
```
Let's build this together.
```

**Body text:**
```
Nordic Smart Cabin is ready to move from concept to reality. Whether you're a resort owner exploring smart automation — or part of the Loxone team evaluating this partnership — we'd love to talk.
```

**CTA Button:** Large, prominent button with amber gradient background:
```
Get in Touch →
```
Button links to: `mailto:mika@iqsahko.fi` (or appropriate contact)

**Contact line below button (small, muted):**
```
Mika Lähteenmäki — IQ Sähkö
mika@iqsahko.fi | +358 XX XXX XXXX
```

NOTE: Replace contact details with Mika's real info before publishing.

---

### FOOTER

Minimal footer. Both logos (IQ Sähkö + Loxone) side by side, smaller. Below:
```
Nordic Smart Cabin — A concept by IQ Sähkö × Loxone
© 2026 IQ Sähkö. All rights reserved.
```

---

## Folder Structure

```
nordic-smart-cabin/
├── index.html          ← The single-file landing page
└── images/
    ├── hero.jpg        ← Luxury cabin(s) at night with warm lighting
    ├── problem.jpg     ← Cold, remote, isolated cabin landscape
    ├── solution.jpg    ← Warm, modern cabin interior
    └── resort.jpg      ← Aerial/wide view of multiple resort cabins
```

---

## Quality Checklist

- [ ] Both logos render correctly with proper styling and animations
- [ ] All 7 sections have correct copy as specified above
- [ ] Scroll-triggered fade-in animations work
- [ ] Stats counter animation triggers when section enters viewport
- [ ] Hero has parallax background effect
- [ ] All images load from ./images/ folder
- [ ] Page looks great at 1440px, 1024px, and 768px widths
- [ ] Color palette is consistent — amber for IQ Sähkö elements, green for Loxone elements
- [ ] Typography hierarchy is clear and consistent
- [ ] Generous whitespace throughout
- [ ] No horizontal scroll on any viewport
- [ ] Noise/grain texture overlay is subtle but present
- [ ] Smooth scroll behavior works
