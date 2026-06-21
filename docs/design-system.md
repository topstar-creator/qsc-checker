# QSC Checker Design System

## Brand

- **Primary**: Deep teal `#0D9488` — trust, cleanliness, professionalism
- **Accent**: Warm amber `#F59E0B` — alerts, improvement focus
- **Success**: `#22C55E` | **Warning**: `#EAB308` | **Destructive**: `#EF4444`

## Typography

- **Font**: System UI stack (`-apple-system`, `Segoe UI`, `Hiragino Sans`, sans-serif)
- **Page title**: 20px / semibold
- **Section title**: 16px / semibold
- **Body**: 14px / regular
- **Caption**: 12px / muted

## Spacing

- Base unit: 4px
- Page padding: 16px
- Card padding: 16px
- Section gap: 24px
- Bottom nav height: 64px + safe-area

## Components

| Component | Usage |
|-----------|-------|
| `StatusBadge` | Improvement case statuses |
| `ScoreBadge` | QSC scores (color by threshold) |
| `RankingTable` | Home rankings with sticky header |
| `FilterBar` | Type / period / group filters |
| `MediaUploader` | Photo/video on inspections |
| `TimelineItem` | Case status history |

## Score Colors

- 90+: green | 80–89: teal | 70–79: amber | <70: red

## Case Status Colors

- `pending`: gray | `in_progress`: blue | `reported`: purple
- `rejected`: red | `done`: green
