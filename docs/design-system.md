# AURELIN & CO. — Design System & Visual Guidelines

## 1. Brand Philosophy: Quiet Luxury & Modern Gentleman
AURELIN & CO. embodies old-money understatement, refined tailoring, and editorial calm. The visual direction avoids aggressive colors, harsh neon gradients, glassmorphism, or noisy animations.

---

## 2. Colour Palette

| Token | Hex Code | HSL / Usage | Description |
|---|---|---|---|
| `--color-navy` / `navy` | `#172744` | `hsl(219, 49%, 18%)` | Primary brand tone for headings, primary buttons, hero text, and structure |
| `--color-deep-navy` | `#101C32` | `hsl(220, 52%, 13%)` | Secondary deep tone for footer, admin sidebar, and dark contrast sections |
| `--color-ivory` / `ivory` | `#F8F6F0` | `hsl(45, 33%, 96%)` | Background tone across storefront, product cards, and modal backdrops |
| `--color-beige` / `beige` | `#D8C8AF` | `hsl(37, 36%, 77%)` | Subtle borders, divider rules, and placeholder backdrops |
| `--color-champagne` | `#B9A77A` | `hsl(43, 31%, 60%)` | Refined accent for decorative lines, eyebrow labels, and subtle highlights |
| `--color-charcoal` | `#242424` | `hsl(0, 0%, 14%)` | Body copy, secondary text, and icons |
| `--color-white` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Clean card panels, form inputs, and highlights |

---

## 3. Typography Hierarchy

### Headings: *Cormorant Garamond*
- H1 (Hero Title): `clamp(2.75rem, 6vw, 4.5rem)`, weight `400`, letter-spacing `-0.01em`
- H2 (Section Title): `clamp(1.75rem, 4vw, 3rem)`, weight `400`, letter-spacing `0.04em`
- H3 (Card / Subsection): `clamp(1rem, 2.5vw, 1.375rem)`, weight `400`

### UI & Body: *Inter*
- Eyebrow Labels: `0.625rem` (10px) to `0.6875rem` (11px), uppercase, letter-spacing `0.18em` to `0.22em`
- Body Standard: `0.875rem` (14px) to `0.9375rem` (15px), weight `300`, line-height `1.8`
- Button CTA Text: `0.6875rem` (11px), uppercase, weight `500`, letter-spacing `0.18em`
- Price Tags: `0.875rem` (14px) to `1.125rem` (18px), weight `400` to `500`

---

## 4. Key Interactive Components

1. **Product Card**:
   - Aspect ratio: `3:4` portrait
   - Hover transition: 500ms opacity crossfade between primary image and secondary angle
   - Wishlist button: Circular floating control with filled state toggle
   - Swatches: Small circular colour pills with exact hexadecimal values

2. **Cart Drawer**:
   - Slide-in panel from the right with smooth cubic-bezier easing (`0.25, 0.46, 0.45, 0.94`)
   - Subtle frosted backdrop (`backdrop-blur-sm bg-charcoal/30`)
   - Direct item quantity increment/decrement with minimum boundary validation

3. **Search Dialog**:
   - Centered overlay modal with live debounced Supabase full-text search
   - Thumbnail previews, live pricing, and quick-filter category pills

4. **Hero Section**:
   - Viewport height: `clamp(520px, 82vh, 900px)`
   - IntersectionObserver lazy video loading with poster image fallback
   - Play/pause and mute/unmute floating controls with animated timeline indicators
