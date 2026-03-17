

## Light Tech Color Scheme

Shift from dark mode to a **bright, clean tech aesthetic** that harmonizes with the cherry blossom portrait. Think: Apple-like light tech feel with frosted glass on white.

### New Color Tokens (`src/index.css`)

| Token | New Value | Description |
|-------|-----------|-------------|
| `--background` | `220 20% 97%` | Light warm gray |
| `--foreground` | `220 20% 12%` | Near-black text |
| `--card` | `0 0% 100%` | White cards |
| `--card-foreground` | `220 20% 12%` | Dark text |
| `--primary` | `340 55% 55%` | Soft rose — complements cherry blossoms |
| `--primary-foreground` | `0 0% 100%` | White on primary |
| `--secondary` | `220 15% 92%` | Light gray |
| `--secondary-foreground` | `220 15% 30%` | Medium dark |
| `--muted` | `220 15% 94%` | Very light gray |
| `--muted-foreground` | `220 10% 45%` | Medium gray text |
| `--accent` | `152 55% 42%` | Keep green for status |
| `--border` | `220 15% 88%` | Light border |
| `--input` | `220 15% 88%` | Light input border |
| `--ring` | `340 55% 55%` | Rose ring |
| `--glass-bg` | `0 0% 100% / 0.65` | White frosted glass |
| `--glass-border` | `220 15% 85% / 0.5` | Light glass border |
| `--glass-highlight` | `0 0% 100% / 0.8` | White highlight |

### Utility Updates (`src/index.css`)

- `.glass-strong` → white-based `hsla(0, 0%, 100%, 0.85)` with blur
- `.glow-blue` → `.glow-primary` with rose-tinted soft shadow
- `.text-gradient` → dark charcoal to rose gradient (readable on light bg)
- `.glow-green` stays as-is

### Layout (`src/components/Layout.tsx`)

- Reduce tech-bg opacity or add a light overlay so the background texture works on a light page
- Alternatively invert/lighten the background effect

### Files to Update (class references)

Replace `glow-blue` → `glow-primary` across:
- `src/components/Navbar.tsx` (3 instances)
- `src/pages/Index.tsx` (avatar, button)
- `src/pages/About.tsx` (timeline cards, building cards)
- `src/pages/Experience.tsx` (timeline hover)
- `src/pages/Projects.tsx` (project cards)
- `src/pages/Contact.tsx` (contact method cards)
- `src/components/StatusBubble.tsx` (keep green glow)

### Additional Adjustments

- **Inputs** in Contact form: update `bg-background/50` will naturally become light
- **Tags/badges** (`bg-primary/10 text-primary`): will auto-adapt to rose tones
- **Timeline dots/lines** in Experience/About: `border-primary` and `bg-primary` will shift to rose
- **Sidebar vars**: update to match light scheme

The result: a bright, frosted-glass tech aesthetic with rose accents that naturally complement the cherry blossom portrait, while retaining the glassmorphism language and modern feel.

