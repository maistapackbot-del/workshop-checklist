# Workshop Einkaufsliste – Design-Spec

**Projekt:** Workshop Einkaufsliste mit Produktlinks & Tracking  
**Datum:** 2026-05-26  
**Status:** Design Phase

---

## 1. Übersicht

Ein visuelles Einkaufslisten-Dashboard zur Verwaltung der Werkstatt-Einrichtung. Benutzer können Produkte mit mehreren Links speichern, automatisch Produktbilder extrahieren, Einkäufe mit Tracking-Links dokumentieren und eine übersichtliche Gesamtliste mit Filter verwalten.

**Kernfeatures:**
- 3-Level-Hierarchie: Hauptpunkte → Kategorien → Produkte
- Karten-Grid-Ansicht (ähnlich Willhaben Scraper)
- Automatisches Produktbild-Scraping bei Link-Hinzufügen
- Mehrere Links pro Produkt mit Farbkodierung
- Gekaufte Produkte mit Tracking-Link-Verwaltung
- Filter zum Ausblenden gekaufter Items

---

## 2. Datenmodell (Hierarchisch-Flexibel)

### Tabelle: `checklist_items`
```sql
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  parent_id UUID REFERENCES checklist_items(id),  -- für Hierarchie
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,  -- 'main', 'category', 'product'
  price DECIMAL(10, 2),  -- nur für Produkte
  image_url TEXT,  -- Produktbild (auto-gescraped oder manuell)
  purchased_at TIMESTAMP,  -- NULL = nicht gekauft
  purchase_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  order_index INT  -- für Sortierung
)
```

**Hierarchie-Beispiel:**
```
Werkzeugregal (main, parent_id: NULL)
├─ Das Regal selbst (product, parent_id: werkzeugregal_id)
├─ Elektrowerkzeuge (category, parent_id: werkzeugregal_id)
│  ├─ Bosch Schleifen (product, parent_id: elektrowerkzeuge_id)
│  └─ Makita Alternative (product, parent_id: elektrowerkzeuge_id)
└─ Bits & Zubehör (category, parent_id: werkzeugregal_id)
   └─ Bits Set (product, parent_id: bits_id)
```

### Tabelle: `product_links`
```sql
CREATE TABLE product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  platform VARCHAR(100),  -- 'amazon', 'ebay', 'custom', etc.
  title TEXT,  -- auto-gescraped
  price DECIMAL(10, 2),  -- auto-gescraped
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Tabelle: `tracking_links`
```sql
CREATE TABLE tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  tracking_url VARCHAR(2048),
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),  -- 'DHL', 'DPD', 'GLS', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

## 3. UI/UX Design

### 3.1 Haupt-Layout

**Dark Theme** (ähnlich Willhaben Scraper):
- Background: `#1a1a1a`
- Cards: `#2a2a2a`
- Text: `white` / `#aaa`
- Accents: `#2196f3` (Links), `#4caf50` (Gekauft), `#ff9800` (Preis)

**Header:**
```
🛠️ Workshop Einkaufsliste          [+ Hauptpunkt ▼] [Gekaufte ☑]
123 Produkte • 45 gekauft • €2.450,50
```

**Dropdown "Hauptpunkt ▼":**
- ➕ Neuer Hauptpunkt
- ➕ Neue Kategorie (zu bestehendem)
- ➕ Einzelnes Produkt (zu bestehender Kategorie)

### 3.2 Hauptpunkt-Struktur

```
┌─────────────────────────────────────────────────┐
│ 🛠️ Werkzeugregal                    ↓ 18 Items │
├─────────────────────────────────────────────────┤
│ 📌 Elektrowerkzeuge | 📌 Bits & Zubehör | ...  │  ← Kategorie-Tabs
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  [Bild]  │  │  [Bild]  │  │  [Bild]  │     │
│  │  €89,99  │  │  €79,99  │  │  €0,00   │     │
│  │ Bosch... │  │ Makita.. │  │ DeWalt.. │     │
│  │ 2 Links  │  │ 1 Link   │  │ 0 Links  │     │
│  │[+ Link]  │  │[+ Link]  │  │[+ Link]  │     │
│  │[Gekauft] │  │[Gekauft] │  │[Gekauft] │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
│  [+ Produkt hinzufügen]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Karten-Details:**
- Oben: Produktbild (140px Höhe, auto-gescraped oder Placeholder)
- Oben rechts: Preis in Orange Badge
- Titel (2 Zeilen max)
- Anzahl Links
- Link-Buttons (farbig: Amazon blau, eBay orange, etc.)
- Action-Buttons: "+ Link", "Gekauft"

**Gekaufte Produkte:**
- Ausgegraut (opacity: 0.6)
- Grüner Checkmark überlagert
- Text durchgestrichen
- Kaufdatum statt "+ Link" Button
- "📦 Tracking" Button (wenn vorhanden)

### 3.3 Modals

#### Modal 1: Link hinzufügen
```
┌─────────────────────────────────┐
│ Link hinzufügen            [✕]  │
├─────────────────────────────────┤
│                                 │
│ URL eingeben:                   │
│ [https://amazon.de/...]         │
│                                 │
│ 🔄 Metadaten werden geladen... │
│                                 │
│ [Abbrechen] [Speichern]        │
│                                 │
└─────────────────────────────────┘
```

**Workflow:**
1. Benutzer gibt URL ein
2. Frontend versucht automatisch:
   - Produktbild zu extrahieren
   - Titel zu scrapen
   - Preis zu scrapen (falls möglich)
3. Vorschau anzeigen (optional)
4. "Speichern" → Link wird gespeichert, Bild angezeigt

**Fallback:** Wenn Scraping fehlschlägt → Manuelle Eingabe möglich

#### Modal 2A: Gekauft – Schritt 1 (Kaufbestätigung)
```
┌────────────────────────────────────┐
│ Gekauft – Bestätigung        [✕]   │
├────────────────────────────────────┤
│ Bosch Elektroschleifen 400W        │
│ Preis: €89,99                      │
│                                    │
│ Kaufdatum: [12.05.2026]            │
│ Notizen: [___________________]     │
│                                    │
│ [Abbrechen] [Weiter →]             │
│                                    │
└────────────────────────────────────┘
```

#### Modal 2B: Gekauft – Schritt 2 (Tracking)
```
┌────────────────────────────────────┐
│ Tracking-Link hinzufügen     [✕]   │
├────────────────────────────────────┤
│ Bosch Elektroschleifen 400W        │
│ Gekauft: 12.05.2026                │
│                                    │
│ Tracking-Link (optional):          │
│ [https://dhl.de/tracking?...]      │
│                                    │
│ Tracking-Nummer:                   │
│ [1234567890]                       │
│                                    │
│ Versand-Anbieter:                  │
│ [DHL ▼]                            │
│                                    │
│ [Zurück] [Fertig]                  │
│                                    │
└────────────────────────────────────┘
```

---

## 4. Features (Detailliert)

### 4.1 Produktbild-Scraping
- **Automatisch beim Link-Hinzufügen:**
  - URL wird validiert
  - Open Graph Meta-Tags gescraped (og:image)
  - Fallback: First Image im HTML
  - Cropped/Resized auf 220px × 140px
  
- **Speicherung:** Image-URL wird in DB gespeichert (nicht als Base64, um Speicherplatz zu sparen)

- **Fehlerfall:** Placeholder-Bild anzeigen (z.B. 📦 Icon)

### 4.2 Mehrere Links pro Produkt
- Jedes Produkt kann mehrere Links haben
- Farbkodierung pro Platform:
  - Amazon: Blau (#1976d2)
  - eBay: Orange (#f57c00)
  - Weitere: Grau
- Links sind klickbar (öffnen in neuem Tab)

### 4.3 Gekauft-Management
- "Gekauft"-Button initiiert Doppel-Modal:
  1. Kaufdatum + Notizen
  2. Optional: Tracking-Link
- Gekaufte Produkte rutschen nach unten
- Filter "Gekaufte anzeigen" schaltet visibility

### 4.4 Filter & Übersicht
- Hauptheader zeigt:
  - Gesamtanzahl Produkte
  - Anzahl gekaufter Produkte
  - Gesamtbudget (Summe aller Preise)
- Filter-Checkbox: "Gekaufte anzeigen/ausblenden"

### 4.5 Hierarchie-Verwaltung
- **Hauptpunkte hinzufügen:** Top-Level "+ Hauptpunkt" Dropdown
- **Kategorien hinzufügen:** Im Dropdown oder per Kontextmenü
- **Produkte hinzufügen:** Inline "+ Produkt" Button unter jeder Kategorie
- **Drag & Drop (optional):** Später, um Sortierung zu ermöglichen

---

## 5. Technischer Stack

| Komponente | Technologie | Begründung |
|-----------|-------------|-----------|
| Frontend | React 19 + Vite | Schnell, modern, component-based |
| Hosting | Vercel | Kostenlos, einfach Deploy |
| Database | Supabase (PostgreSQL) | Kostenlos, Realtime, RLS |
| Auth | Supabase Auth | Email/Passwort, einfach |
| Scraping | Cheerio (Node.js) oder Browser API | Produktmetadaten extrahieren |
| Styling | CSS (keine externe Library) | Einfach, keine Dependencies |
| Image Hosting | Supabase Storage (optional) | Images speichern, oder externe URLs |

---

## 6. Workflows

### Workflow 1: Neues Produkt mit Links
```
User klickt "+ Hauptpunkt ▼" → "Einzelnes Produkt"
  ↓
Modal: Produktname eingeben
  ↓
Produkt erscheint in Grid
  ↓
User klickt "+ Link"
  ↓
Link-Modal: URL eingeben
  ↓
Metadaten auto-gescraped, Bild angezeigt
  ↓
Speichern → Link in DB, Bild angezeigt
```

### Workflow 2: Produkt als gekauft markieren
```
User klickt "Gekauft"
  ↓
Modal 1: Kaufdatum + Notizen → "Weiter"
  ↓
Modal 2: Tracking-Link (optional) → "Fertig"
  ↓
Produkt wird ausgegraut, rutscht nach unten
  ↓
Kaufdatum angezeigt, "📦 Tracking" Button sichtbar
```

### Workflow 3: Filter gekaufte Produkte
```
User checkt "Gekaufte anzeigen"
  ↓
Gekaufte Produkte werden sichtbar/unsichtbar
  ↓
Gesamtübersicht oben passt sich an
```

---

## 7. Implementierungs-Reihenfolge

1. **Phase 1:** Projekt-Setup (React + Vite + Supabase)
2. **Phase 2:** Authentifizierung (Login/Signup)
3. **Phase 3:** Datenmodell + RLS-Policies
4. **Phase 4:** Haupt-Dashboard UI (Layout, Karten, Grid)
5. **Phase 5:** CRUD für Hierarchie (Hauptpunkte, Kategorien, Produkte)
6. **Phase 6:** Link-Management + Bild-Scraping
7. **Phase 7:** Gekauft-Flow (Modals, Tracking)
8. **Phase 8:** Filter + Gesamtübersicht
9. **Phase 9:** Realtime Updates (Supabase Realtime)
10. **Phase 10:** Polish + Deployment

---

## 8. Success Criteria

- ✅ Dashboard zeigt 3-Level-Hierarchie korrekt
- ✅ Produktbilder werden automatisch gescraped
- ✅ Mehrere Links pro Produkt möglich
- ✅ Gekaufte Produkte werden korrekt angezeigt/ausgeblendet
- ✅ Tracking-Links können gespeichert werden
- ✅ Gesamtübersicht mit Statistiken funktioniert
- ✅ RLS: Jeder User sieht nur eigene Listen
- ✅ Responsive Design (Mobile-Optimiert)
- ✅ Kostenlos hosten (Supabase + Vercel)
- ✅ Performance: Schnelles Laden auch mit vielen Produkten

---

**Nächster Schritt:** Implementation Plan (writing-plans skill)
