import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env variables from .env.local
const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val.length) process.env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// ─── HELPER: query Overpass API ──────────────────────────────────────────────
async function queryOverpass(query) {
  console.log('Querying Overpass API...')
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  })
  if (!response.ok) throw new Error(`Overpass error: ${response.status}`)
  return response.json()
}

// ─── HELPER: sleep to be polite to Overpass servers ──────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// ─── STEP 1: Fetch all named areas (sectors, suburbs, towns, landmarks) ──────
async function fetchAreas() {
  console.log('\n━━━ Fetching areas from OpenStreetMap...')

  const query = `
    [out:json][timeout:60];
    area["name"="Islamabad"]["admin_level"="6"]->.isb;
    (
      node["place"~"suburb|neighbourhood|town|village|quarter"](area.isb);
      node["amenity"~"hospital|university|school"](area.isb)["name"];
      node["tourism"~"attraction|viewpoint"](area.isb)["name"];
      node["landuse"="residential"](area.isb)["name"];
    );
    out body;
  `

  const data = await queryOverpass(query)
  const elements = data.elements || []
  console.log(`  Raw results from OSM: ${elements.length} nodes`)

  const areas = []
  const seen = new Set()

  for (const el of elements) {
    const nameEn = el.tags?.name || el.tags?.['name:en']
    if (!nameEn || seen.has(nameEn.toLowerCase())) continue
    seen.add(nameEn.toLowerCase())

    // Determine type
    let type = 'landmark'
    const place = el.tags?.place
    if (place === 'suburb' || place === 'neighbourhood' || place === 'quarter') {
      type = 'sector'
    } else if (place === 'town' || place === 'village') {
      type = 'town'
    }

    areas.push({
      name_en: nameEn,
      name_ur: el.tags?.['name:ur'] || null,
      type,
      lat: el.lat,
      lng: el.lon,
    })
  }

  console.log(`  Cleaned unique areas: ${areas.length}`)
  return areas
}

// ─── STEP 2: Fetch all major roads ───────────────────────────────────────────
async function fetchRoads() {
  console.log('\n━━━ Fetching roads from OpenStreetMap...')

  // Islamabad bounding box: south, west, north, east
  const bbox = '33.55,72.85,33.80,73.25'

  const query = `
    [out:json][timeout:60];
    (
      way["highway"~"motorway|trunk|primary|secondary"]["name"](${bbox});
    );
    out body;
  `

  const data = await queryOverpass(query)
  const elements = data.elements || []
  console.log(`  Raw road ways from OSM: ${elements.length}`)

  const roads = []
  const seen = new Set()

  for (const el of elements) {
    const nameEn = el.tags?.name || el.tags?.['name:en']
    if (!nameEn || seen.has(nameEn.toLowerCase())) continue
    seen.add(nameEn.toLowerCase())

    // Map OSM highway type to our road_type
    const hw = el.tags?.highway
    let roadType = 'road'
    if (hw === 'motorway' || hw === 'trunk') roadType = 'highway'
    else if (nameEn.toLowerCase().includes('avenue')) roadType = 'avenue'
    else if (nameEn.toLowerCase().includes('highway')) roadType = 'highway'

    roads.push({
      name_en: nameEn,
      name_ur: el.tags?.['name:ur'] || null,
      road_type: roadType,
    })
  }

  console.log(`  Cleaned unique roads: ${roads.length}`)
  return roads
}

// ─── STEP 3: Fetch which areas each road passes through ──────────────────────
async function fetchRoadAreaLinks(roads, areaMap) {
  console.log('\n━━━ Building road-area relationships...')

  const bbox = '33.55,72.85,33.80,73.25'
  const links = []

  // For each road, find nodes along it and match to nearest area
  // We use a simpler approach: fetch road geometry + nearby named places
  for (const road of roads) {
    await sleep(1100) // Respect Overpass rate limits (1 req/sec)

    const query = `
      [out:json][timeout:30];
      (
        way["name"="${road.name_en}"]["highway"](${bbox});
      );
      out center;
    `

    try {
      const data = await queryOverpass(query)
      const ways = data.elements || []

      if (ways.length === 0) continue

      // Get all center points of way segments along this road
      const centers = ways
        .filter(w => w.center)
        .map(w => ({ lat: w.center.lat, lng: w.center.lon }))

      if (centers.length === 0) continue

      // For each center point, find the closest area in our DB
      const matchedAreaIds = new Set()
      const orderedMatches = []

      for (const center of centers) {
        const closest = findClosestArea(center, areaMap)
        if (closest && !matchedAreaIds.has(closest.id)) {
          matchedAreaIds.add(closest.id)
          orderedMatches.push(closest)
        }
      }

      // Add links with sequence order
      orderedMatches.forEach((area, index) => {
        links.push({
          road_name: road.name_en,
          area_id: area.id,
          sequence_order: index + 1,
        })
      })

      console.log(`  ✅ ${road.name_en}: linked to ${orderedMatches.length} areas`)
    } catch (err) {
      console.warn(`  ⚠️  Skipped ${road.name_en}: ${err.message}`)
    }
  }

  return links
}

// ─── HELPER: find closest area to a lat/lng point ────────────────────────────
function findClosestArea(point, areaMap) {
  let closest = null
  let minDist = Infinity

  for (const area of areaMap) {
    if (!area.lat || !area.lng) continue
    const dist = Math.sqrt(
      Math.pow(area.lat - point.lat, 2) +
      Math.pow(area.lng - point.lng, 2)
    )
    if (dist < minDist && dist < 0.05) { // within ~5km
      minDist = dist
      closest = area
    }
  }

  return closest
}

// ─── STEP 4: Also add our curated key landmarks OSM might miss ───────────────
const criticalLandmarks = [
  { name_en: 'Zero Point', name_ur: 'زیرو پوائنٹ', type: 'landmark', lat: 33.7050, lng: 73.0481 },
  { name_en: 'Faizabad', name_ur: 'فیض آباد', type: 'landmark', lat: 33.6900, lng: 73.0681 },
  { name_en: 'Koral Chowk', name_ur: 'کورال چوک', type: 'landmark', lat: 33.6600, lng: 73.1200 },
  { name_en: 'Peshawar Morr', name_ur: 'پشاور موڑ', type: 'landmark', lat: 33.6650, lng: 73.0050 },
  { name_en: 'Faizabad Interchange', name_ur: 'فیض آباد انٹرچینج', type: 'landmark', lat: 33.6895, lng: 73.0690 },
  { name_en: 'Noon Bridge', name_ur: 'نون برج', type: 'landmark', lat: 33.6750, lng: 73.0800 },
  { name_en: 'Expressway Toll Plaza', name_ur: 'ایکسپریس وے ٹول پلازہ', type: 'landmark', lat: 33.6350, lng: 73.1350 },
  { name_en: 'F-10 Markaz', name_ur: 'ایف-10 مرکز', type: 'landmark', lat: 33.6938, lng: 72.9987 },
  { name_en: 'G-10 Markaz', name_ur: 'جی-10 مرکز', type: 'landmark', lat: 33.6860, lng: 73.0150 },
  { name_en: 'I-8 Markaz', name_ur: 'آئی-8 مرکز', type: 'landmark', lat: 33.6780, lng: 73.0700 },
  { name_en: 'I-10 Markaz', name_ur: 'آئی-10 مرکز', type: 'landmark', lat: 33.6620, lng: 73.0381 },
  { name_en: 'F-11 Markaz', name_ur: 'ایف-11 مرکز', type: 'landmark', lat: 33.6850, lng: 72.9768 },
  { name_en: 'Parliament House', name_ur: 'پارلیمنٹ ہاؤس', type: 'landmark', lat: 33.7294, lng: 73.0931 },
  { name_en: 'Pak Secretariat', name_ur: 'پاک سیکریٹریٹ', type: 'landmark', lat: 33.7274, lng: 73.0931 },
  { name_en: 'Supreme Court', name_ur: 'سپریم کورٹ', type: 'landmark', lat: 33.7260, lng: 73.0900 },
  { name_en: 'Centaurus Mall', name_ur: 'سینٹارس مال', type: 'landmark', lat: 33.7095, lng: 73.0481 },
  { name_en: 'PIMS Hospital', name_ur: 'پمز ہسپتال', type: 'landmark', lat: 33.7100, lng: 73.0600 },
  { name_en: 'Islamabad Airport', name_ur: 'اسلام آباد ایئرپورٹ', type: 'landmark', lat: 33.6167, lng: 73.0997 },
  { name_en: 'New Islamabad Airport', name_ur: 'نیا اسلام آباد ایئرپورٹ', type: 'landmark', lat: 33.5497, lng: 72.8259 },
  { name_en: 'Daman-e-Koh', name_ur: 'دامن کوہ', type: 'landmark', lat: 33.7500, lng: 73.0600 },
  { name_en: 'Shakarparian', name_ur: 'شکرپڑیاں', type: 'landmark', lat: 33.6900, lng: 73.0281 },
  { name_en: 'F-9 Park', name_ur: 'ایف-9 پارک', type: 'landmark', lat: 33.7050, lng: 73.0181 },
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   Islamabad Traffic — OSM Data Fetcher  ║')
  console.log('╚══════════════════════════════════════════╝\n')

  // 1. Fetch areas from OSM
  let areas = await fetchAreas()
  await sleep(2000) // polite pause between queries

  // 2. Merge with critical landmarks (add if not already present)
  const existingNames = new Set(areas.map(a => a.name_en.toLowerCase()))
  for (const landmark of criticalLandmarks) {
    if (!existingNames.has(landmark.name_en.toLowerCase())) {
      areas.push(landmark)
    }
  }
  console.log(`\n  Total areas after merging landmarks: ${areas.length}`)

  // 3. Insert areas into Supabase
  console.log('\n━━━ Inserting areas into Supabase...')
  const batchSize = 50
  const insertedAreas = []

  for (let i = 0; i < areas.length; i += batchSize) {
    const batch = areas.slice(i, i + batchSize)
    const { data, error } = await supabase.from('areas').insert(batch).select()
    if (error) {
      console.error(`  ❌ Batch error:`, error.message)
    } else {
      insertedAreas.push(...data)
      console.log(`  ✅ Areas batch ${Math.ceil((i + 1) / batchSize)}: ${batch.length} inserted`)
    }
  }

  await sleep(2000)

  // 4. Fetch roads from OSM
  const roads = await fetchRoads()
  await sleep(2000)

  // 5. Insert roads into Supabase
  console.log('\n━━━ Inserting roads into Supabase...')
  const { data: insertedRoads, error: roadsError } = await supabase
    .from('roads')
    .insert(roads)
    .select()

  if (roadsError) {
    console.error('  ❌ Roads error:', roadsError.message)
    process.exit(1)
  }
  console.log(`  ✅ ${insertedRoads.length} roads inserted`)

  await sleep(2000)

  // 6. Build road-area links
  const links = await fetchRoadAreaLinks(insertedRoads, insertedAreas)

  // 7. Insert road-area links
  console.log('\n━━━ Inserting road-area links into Supabase...')
  if (links.length > 0) {
    // Replace road_name with actual road_id
    const roadIdMap = {}
    insertedRoads.forEach(r => { roadIdMap[r.name_en] = r.id })

    const linkRows = links.map(l => ({
      road_id: roadIdMap[l.road_name],
      area_id: l.area_id,
      sequence_order: l.sequence_order,
    })).filter(l => l.road_id && l.area_id)

    for (let i = 0; i < linkRows.length; i += batchSize) {
      const batch = linkRows.slice(i, i + batchSize)
      const { error } = await supabase.from('road_areas').insert(batch)
      if (error) console.error('  ❌ Link batch error:', error.message)
      else console.log(`  ✅ Links batch ${Math.ceil((i + 1) / batchSize)}: ${batch.length} inserted`)
    }
  }

  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║              SEED COMPLETE ✅            ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Areas:     ${String(insertedAreas.length).padEnd(29)}║`)
  console.log(`║  Roads:     ${String(insertedRoads.length).padEnd(29)}║`)
  console.log(`║  Links:     ${String(links.length).padEnd(29)}║`)
  console.log('╚══════════════════════════════════════════╝')
}

main().catch(console.error)