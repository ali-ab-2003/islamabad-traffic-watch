import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val.length) process.env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

const areas = [
  // F SECTORS
  { name_en: 'F-5',         name_ur: 'ایف-5',         type: 'sector',   lat: 33.7294, lng: 73.0831 },
  { name_en: 'F-6',         name_ur: 'ایف-6',         type: 'sector',   lat: 33.7294, lng: 73.0931 },
  { name_en: 'F-6/1',       name_ur: 'ایف-6/1',       type: 'sector',   lat: 33.7310, lng: 73.0950 },
  { name_en: 'F-6/2',       name_ur: 'ایف-6/2',       type: 'sector',   lat: 33.7290, lng: 73.0970 },
  { name_en: 'F-6/3',       name_ur: 'ایف-6/3',       type: 'sector',   lat: 33.7270, lng: 73.0940 },
  { name_en: 'F-6/4',       name_ur: 'ایف-6/4',       type: 'sector',   lat: 33.7250, lng: 73.0920 },
  { name_en: 'F-7',         name_ur: 'ایف-7',         type: 'sector',   lat: 33.7215, lng: 73.0551 },
  { name_en: 'F-7/1',       name_ur: 'ایف-7/1',       type: 'sector',   lat: 33.7230, lng: 73.0570 },
  { name_en: 'F-7/2',       name_ur: 'ایف-7/2',       type: 'sector',   lat: 33.7210, lng: 73.0590 },
  { name_en: 'F-7/3',       name_ur: 'ایف-7/3',       type: 'sector',   lat: 33.7190, lng: 73.0560 },
  { name_en: 'F-7/4',       name_ur: 'ایف-7/4',       type: 'sector',   lat: 33.7170, lng: 73.0540 },
  { name_en: 'F-8',         name_ur: 'ایف-8',         type: 'sector',   lat: 33.7140, lng: 73.0310 },
  { name_en: 'F-8/1',       name_ur: 'ایف-8/1',       type: 'sector',   lat: 33.7155, lng: 73.0330 },
  { name_en: 'F-8/2',       name_ur: 'ایف-8/2',       type: 'sector',   lat: 33.7135, lng: 73.0350 },
  { name_en: 'F-8/3',       name_ur: 'ایف-8/3',       type: 'sector',   lat: 33.7115, lng: 73.0320 },
  { name_en: 'F-8/4',       name_ur: 'ایف-8/4',       type: 'sector',   lat: 33.7095, lng: 73.0300 },
  { name_en: 'F-9',         name_ur: 'ایف-9',         type: 'sector',   lat: 33.7050, lng: 73.0181 },
  { name_en: 'F-10',        name_ur: 'ایف-10',        type: 'sector',   lat: 33.6938, lng: 72.9987 },
  { name_en: 'F-10/1',      name_ur: 'ایف-10/1',      type: 'sector',   lat: 33.6955, lng: 73.0010 },
  { name_en: 'F-10/2',      name_ur: 'ایف-10/2',      type: 'sector',   lat: 33.6935, lng: 73.0030 },
  { name_en: 'F-10/3',      name_ur: 'ایف-10/3',      type: 'sector',   lat: 33.6915, lng: 73.0000 },
  { name_en: 'F-10/4',      name_ur: 'ایف-10/4',      type: 'sector',   lat: 33.6895, lng: 72.9980 },
  { name_en: 'F-10 Markaz', name_ur: 'ایف-10 مرکز',   type: 'landmark', lat: 33.6938, lng: 72.9987 },
  { name_en: 'F-11',        name_ur: 'ایف-11',        type: 'sector',   lat: 33.6850, lng: 72.9768 },
  { name_en: 'F-11/1',      name_ur: 'ایف-11/1',      type: 'sector',   lat: 33.6870, lng: 72.9790 },
  { name_en: 'F-11/2',      name_ur: 'ایف-11/2',      type: 'sector',   lat: 33.6850, lng: 72.9810 },
  { name_en: 'F-11/3',      name_ur: 'ایف-11/3',      type: 'sector',   lat: 33.6830, lng: 72.9780 },
  { name_en: 'F-11/4',      name_ur: 'ایف-11/4',      type: 'sector',   lat: 33.6810, lng: 72.9760 },
  { name_en: 'F-11 Markaz', name_ur: 'ایف-11 مرکز',   type: 'landmark', lat: 33.6850, lng: 72.9768 },
  // G SECTORS
  { name_en: 'G-5',         name_ur: 'جی-5',          type: 'sector',   lat: 33.7200, lng: 73.1000 },
  { name_en: 'G-6',         name_ur: 'جی-6',          type: 'sector',   lat: 33.7180, lng: 73.0931 },
  { name_en: 'G-6/1',       name_ur: 'جی-6/1',        type: 'sector',   lat: 33.7195, lng: 73.0950 },
  { name_en: 'G-6/2',       name_ur: 'جی-6/2',        type: 'sector',   lat: 33.7175, lng: 73.0970 },
  { name_en: 'G-6/3',       name_ur: 'جی-6/3',        type: 'sector',   lat: 33.7155, lng: 73.0940 },
  { name_en: 'G-6/4',       name_ur: 'جی-6/4',        type: 'sector',   lat: 33.7135, lng: 73.0920 },
  { name_en: 'G-7',         name_ur: 'جی-7',          type: 'sector',   lat: 33.7100, lng: 73.0700 },
  { name_en: 'G-7/1',       name_ur: 'جی-7/1',        type: 'sector',   lat: 33.7115, lng: 73.0720 },
  { name_en: 'G-7/2',       name_ur: 'جی-7/2',        type: 'sector',   lat: 33.7095, lng: 73.0740 },
  { name_en: 'G-7/3',       name_ur: 'جی-7/3',        type: 'sector',   lat: 33.7075, lng: 73.0710 },
  { name_en: 'G-7/4',       name_ur: 'جی-7/4',        type: 'sector',   lat: 33.7055, lng: 73.0690 },
  { name_en: 'G-8',         name_ur: 'جی-8',          type: 'sector',   lat: 33.7020, lng: 73.0550 },
  { name_en: 'G-8/1',       name_ur: 'جی-8/1',        type: 'sector',   lat: 33.7035, lng: 73.0570 },
  { name_en: 'G-8/2',       name_ur: 'جی-8/2',        type: 'sector',   lat: 33.7015, lng: 73.0590 },
  { name_en: 'G-8/3',       name_ur: 'جی-8/3',        type: 'sector',   lat: 33.6995, lng: 73.0560 },
  { name_en: 'G-8/4',       name_ur: 'جی-8/4',        type: 'sector',   lat: 33.6975, lng: 73.0540 },
  { name_en: 'G-9',         name_ur: 'جی-9',          type: 'sector',   lat: 33.6940, lng: 73.0381 },
  { name_en: 'G-9/1',       name_ur: 'جی-9/1',        type: 'sector',   lat: 33.6955, lng: 73.0400 },
  { name_en: 'G-9/2',       name_ur: 'جی-9/2',        type: 'sector',   lat: 33.6935, lng: 73.0420 },
  { name_en: 'G-9/3',       name_ur: 'جی-9/3',        type: 'sector',   lat: 33.6915, lng: 73.0390 },
  { name_en: 'G-9/4',       name_ur: 'جی-9/4',        type: 'sector',   lat: 33.6895, lng: 73.0370 },
  { name_en: 'G-10',        name_ur: 'جی-10',         type: 'sector',   lat: 33.6860, lng: 73.0150 },
  { name_en: 'G-10/1',      name_ur: 'جی-10/1',       type: 'sector',   lat: 33.6875, lng: 73.0170 },
  { name_en: 'G-10/2',      name_ur: 'جی-10/2',       type: 'sector',   lat: 33.6855, lng: 73.0190 },
  { name_en: 'G-10/3',      name_ur: 'جی-10/3',       type: 'sector',   lat: 33.6835, lng: 73.0160 },
  { name_en: 'G-10/4',      name_ur: 'جی-10/4',       type: 'sector',   lat: 33.6815, lng: 73.0140 },
  { name_en: 'G-10 Markaz', name_ur: 'جی-10 مرکز',    type: 'landmark', lat: 33.6860, lng: 73.0150 },
  { name_en: 'G-11',        name_ur: 'جی-11',         type: 'sector',   lat: 33.6780, lng: 72.9930 },
  { name_en: 'G-11/1',      name_ur: 'جی-11/1',       type: 'sector',   lat: 33.6795, lng: 72.9950 },
  { name_en: 'G-11/2',      name_ur: 'جی-11/2',       type: 'sector',   lat: 33.6775, lng: 72.9970 },
  { name_en: 'G-11/3',      name_ur: 'جی-11/3',       type: 'sector',   lat: 33.6755, lng: 72.9940 },
  { name_en: 'G-11/4',      name_ur: 'جی-11/4',       type: 'sector',   lat: 33.6735, lng: 72.9920 },
  { name_en: 'G-12',        name_ur: 'جی-12',         type: 'sector',   lat: 33.6700, lng: 72.9750 },
  { name_en: 'G-13',        name_ur: 'جی-13',         type: 'sector',   lat: 33.6620, lng: 72.9610 },
  { name_en: 'G-13/1',      name_ur: 'جی-13/1',       type: 'sector',   lat: 33.6635, lng: 72.9630 },
  { name_en: 'G-13/2',      name_ur: 'جی-13/2',       type: 'sector',   lat: 33.6615, lng: 72.9650 },
  { name_en: 'G-13/3',      name_ur: 'جی-13/3',       type: 'sector',   lat: 33.6595, lng: 72.9620 },
  { name_en: 'G-13/4',      name_ur: 'جی-13/4',       type: 'sector',   lat: 33.6575, lng: 72.9600 },
  { name_en: 'G-14',        name_ur: 'جی-14',         type: 'sector',   lat: 33.6540, lng: 72.9430 },
  { name_en: 'G-14/1',      name_ur: 'جی-14/1',       type: 'sector',   lat: 33.6555, lng: 72.9450 },
  { name_en: 'G-14/2',      name_ur: 'جی-14/2',       type: 'sector',   lat: 33.6535, lng: 72.9470 },
  { name_en: 'G-14/3',      name_ur: 'جی-14/3',       type: 'sector',   lat: 33.6515, lng: 72.9440 },
  { name_en: 'G-14/4',      name_ur: 'جی-14/4',       type: 'sector',   lat: 33.6495, lng: 72.9420 },
  { name_en: 'G-15',        name_ur: 'جی-15',         type: 'sector',   lat: 33.6460, lng: 72.9250 },
  // I SECTORS
  { name_en: 'I-8',         name_ur: 'آئی-8',         type: 'sector',   lat: 33.6780, lng: 73.0700 },
  { name_en: 'I-8/1',       name_ur: 'آئی-8/1',       type: 'sector',   lat: 33.6795, lng: 73.0720 },
  { name_en: 'I-8/2',       name_ur: 'آئی-8/2',       type: 'sector',   lat: 33.6775, lng: 73.0740 },
  { name_en: 'I-8/3',       name_ur: 'آئی-8/3',       type: 'sector',   lat: 33.6755, lng: 73.0710 },
  { name_en: 'I-8/4',       name_ur: 'آئی-8/4',       type: 'sector',   lat: 33.6735, lng: 73.0690 },
  { name_en: 'I-8 Markaz',  name_ur: 'آئی-8 مرکز',    type: 'landmark', lat: 33.6780, lng: 73.0700 },
  { name_en: 'I-9',         name_ur: 'آئی-9',         type: 'sector',   lat: 33.6700, lng: 73.0550 },
  { name_en: 'I-9/1',       name_ur: 'آئی-9/1',       type: 'sector',   lat: 33.6715, lng: 73.0570 },
  { name_en: 'I-9/2',       name_ur: 'آئی-9/2',       type: 'sector',   lat: 33.6695, lng: 73.0590 },
  { name_en: 'I-9/3',       name_ur: 'آئی-9/3',       type: 'sector',   lat: 33.6675, lng: 73.0560 },
  { name_en: 'I-9/4',       name_ur: 'آئی-9/4',       type: 'sector',   lat: 33.6655, lng: 73.0540 },
  { name_en: 'I-10',        name_ur: 'آئی-10',        type: 'sector',   lat: 33.6620, lng: 73.0381 },
  { name_en: 'I-10/1',      name_ur: 'آئی-10/1',      type: 'sector',   lat: 33.6635, lng: 73.0400 },
  { name_en: 'I-10/2',      name_ur: 'آئی-10/2',      type: 'sector',   lat: 33.6615, lng: 73.0420 },
  { name_en: 'I-10/3',      name_ur: 'آئی-10/3',      type: 'sector',   lat: 33.6595, lng: 73.0390 },
  { name_en: 'I-10/4',      name_ur: 'آئی-10/4',      type: 'sector',   lat: 33.6575, lng: 73.0370 },
  { name_en: 'I-10 Markaz', name_ur: 'آئی-10 مرکز',   type: 'landmark', lat: 33.6620, lng: 73.0381 },
  { name_en: 'I-11',        name_ur: 'آئی-11',        type: 'sector',   lat: 33.6540, lng: 73.0200 },
  { name_en: 'I-14',        name_ur: 'آئی-14',        type: 'sector',   lat: 33.6300, lng: 72.9800 },
  { name_en: 'I-15',        name_ur: 'آئی-15',        type: 'sector',   lat: 33.6200, lng: 72.9600 },
  { name_en: 'I-16',        name_ur: 'آئی-16',        type: 'sector',   lat: 33.6100, lng: 72.9400 },
  // E SECTORS
  { name_en: 'E-7',         name_ur: 'ای-7',          type: 'sector',   lat: 33.7300, lng: 73.0600 },
  { name_en: 'E-8',         name_ur: 'ای-8',          type: 'sector',   lat: 33.7200, lng: 73.0400 },
  { name_en: 'E-9',         name_ur: 'ای-9',          type: 'sector',   lat: 33.7100, lng: 73.0200 },
  { name_en: 'E-11',        name_ur: 'ای-11',         type: 'sector',   lat: 33.7050, lng: 72.9800 },
  // H SECTORS
  { name_en: 'H-8',         name_ur: 'ایچ-8',         type: 'sector',   lat: 33.6900, lng: 73.0600 },
  { name_en: 'H-9',         name_ur: 'ایچ-9',         type: 'sector',   lat: 33.6820, lng: 73.0450 },
  { name_en: 'H-11',        name_ur: 'ایچ-11',        type: 'sector',   lat: 33.6660, lng: 73.0150 },
  { name_en: 'H-12',        name_ur: 'ایچ-12',        type: 'sector',   lat: 33.6580, lng: 72.9980 },
  { name_en: 'H-13',        name_ur: 'ایچ-13',        type: 'sector',   lat: 33.6500, lng: 72.9800 },
  // ADDITIONAL LANDMARKS (not already in DB from previous run)
  { name_en: 'T Chowk',              name_ur: 'ٹی چوک',                type: 'landmark', lat: 33.7000, lng: 73.0500 },
  { name_en: 'Presidency',           name_ur: 'ایوان صدر',              type: 'landmark', lat: 33.7350, lng: 73.0981 },
  { name_en: 'PM House',             name_ur: 'وزیر اعظم ہاؤس',         type: 'landmark', lat: 33.7320, lng: 73.0951 },
  { name_en: 'Polyclinic Hospital',  name_ur: 'پولی کلینک ہسپتال',       type: 'landmark', lat: 33.7150, lng: 73.0650 },
  { name_en: 'Serena Hotel',         name_ur: 'سرینا ہوٹل',             type: 'landmark', lat: 33.7094, lng: 73.0494 },
  { name_en: 'Marriott Hotel',       name_ur: 'میریٹ ہوٹل',             type: 'landmark', lat: 33.7220, lng: 73.0900 },
  { name_en: 'Margalla Hills',       name_ur: 'مارگلہ پہاڑیاں',          type: 'landmark', lat: 33.7600, lng: 73.0500 },
  { name_en: 'Rawat',                name_ur: 'راوت',                   type: 'landmark', lat: 33.6100, lng: 73.1500 },
  { name_en: 'Bhara Kahu',           name_ur: 'بھارہ کہو',              type: 'landmark', lat: 33.7200, lng: 73.2000 },
  { name_en: 'Tarnol',               name_ur: 'ترنول',                  type: 'landmark', lat: 33.6700, lng: 72.9200 },
  { name_en: 'Nilore',               name_ur: 'نیلور',                  type: 'landmark', lat: 33.6400, lng: 73.2000 },
  // TOWNS & HOUSING SOCIETIES
  { name_en: 'Bahria Town Phase 1',  name_ur: 'بحریہ ٹاؤن فیز 1',       type: 'town',     lat: 33.5450, lng: 72.9687 },
  { name_en: 'Bahria Town Phase 2',  name_ur: 'بحریہ ٹاؤن فیز 2',       type: 'town',     lat: 33.5380, lng: 72.9600 },
  { name_en: 'Bahria Town Phase 3',  name_ur: 'بحریہ ٹاؤن فیز 3',       type: 'town',     lat: 33.5300, lng: 72.9500 },
  { name_en: 'Bahria Town Phase 4',  name_ur: 'بحریہ ٹاؤن فیز 4',       type: 'town',     lat: 33.5200, lng: 72.9400 },
  { name_en: 'Bahria Town Phase 7',  name_ur: 'بحریہ ٹاؤن فیز 7',       type: 'town',     lat: 33.5100, lng: 72.9300 },
  { name_en: 'DHA Phase 1',          name_ur: 'ڈی ایچ اے فیز 1',        type: 'town',     lat: 33.5800, lng: 73.1200 },
  { name_en: 'DHA Phase 2',          name_ur: 'ڈی ایچ اے فیز 2',        type: 'town',     lat: 33.5700, lng: 73.1300 },
  { name_en: 'PWD Colony',           name_ur: 'پی ڈبلیو ڈی کالونی',      type: 'town',     lat: 33.6500, lng: 73.1050 },
  { name_en: 'Gulberg Greens',       name_ur: 'گلبرگ گرینز',             type: 'town',     lat: 33.5600, lng: 72.9800 },
  { name_en: 'Gulberg Residencia',   name_ur: 'گلبرگ ریزیڈینشیا',        type: 'town',     lat: 33.5650, lng: 72.9750 },
  { name_en: 'Media Town',           name_ur: 'میڈیا ٹاؤن',              type: 'town',     lat: 33.6800, lng: 72.9600 },
  { name_en: 'Naval Anchorage',      name_ur: 'نیول اینکریج',            type: 'town',     lat: 33.5900, lng: 72.9700 },
  { name_en: 'Faisal Town',          name_ur: 'فیصل ٹاؤن',              type: 'town',     lat: 33.6600, lng: 73.0200 },
  { name_en: 'Humak',                name_ur: 'ہوماک',                   type: 'town',     lat: 33.6200, lng: 73.1800 },
  { name_en: 'Tarlai',               name_ur: 'ترلائی',                  type: 'town',     lat: 33.6600, lng: 73.1600 },
  { name_en: 'Soan Garden',          name_ur: 'سون گارڈن',               type: 'town',     lat: 33.6400, lng: 73.1100 },
  { name_en: 'Ghauri Town',          name_ur: 'غوری ٹاؤن',               type: 'town',     lat: 33.6300, lng: 73.1300 },
  { name_en: 'Khanna Pul',           name_ur: 'خانہ پل',                type: 'town',     lat: 33.6500, lng: 73.1400 },
  { name_en: 'Rawalpindi',           name_ur: 'راولپنڈی',                type: 'town',     lat: 33.6007, lng: 73.0679 },
  { name_en: 'Saddar Rawalpindi',    name_ur: 'سدر راولپنڈی',            type: 'town',     lat: 33.5973, lng: 73.0479 },
  { name_en: 'Chaklala',             name_ur: 'چکلالہ',                  type: 'town',     lat: 33.6100, lng: 73.0800 },
  { name_en: 'Westridge',            name_ur: 'ویسٹ رج',                 type: 'town',     lat: 33.5900, lng: 73.0400 },
]

// ─── PROXIMITY BASED ROAD-AREA LINKS ─────────────────────────────────────────
async function buildLinksViaProximity(insertedAreas) {
  console.log('\n━━━ Fetching road geometries to build links...')

  const bbox = '33.45,72.75,33.85,73.35'
  const { data: roads } = await supabase.from('roads').select('id, name_en')
  if (!roads?.length) { console.error('No roads found'); return [] }

  console.log(`  Building links for ${roads.length} roads...`)
  const links = []

  for (let i = 0; i < roads.length; i++) {
    const road = roads[i]
    await sleep(1200)

    const query = `
      [out:json][timeout:25];
      way["name"="${road.name_en.replace(/"/g, '')}"]["highway"](${bbox});
      out center;
    `

    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      })

      // Handle rate limiting
      if (res.status === 429) {
        console.log(`  ⚠️  Rate limited, waiting 30s...`)
        await sleep(30000)
        i-- // retry same road
        continue
      }
      if (res.status === 504) {
        console.log(`  ⚠️  Timeout on "${road.name_en}", skipping`)
        continue
      }
      if (!res.ok) continue

      const data = await res.json()
      const ways = data.elements?.filter(w => w.center) || []
      if (!ways.length) continue

      const centers = ways.map(w => ({ lat: w.center.lat, lng: w.center.lon }))
      const matched = new Map()

      for (const center of centers) {
        for (const area of insertedAreas) {
          if (!area.lat || !area.lng) continue
          const distKm = Math.sqrt(
            Math.pow((area.lat - center.lat) * 111, 2) +
            Math.pow((area.lng - center.lng) * 95, 2)
          )
          if (distKm < 2.5 && (!matched.has(area.id) || matched.get(area.id) > distKm)) {
            matched.set(area.id, distKm)
          }
        }
      }

      const sorted = [...matched.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([areaId], idx) => ({
          road_id: road.id,
          area_id: areaId,
          sequence_order: idx + 1
        }))

      links.push(...sorted)
      process.stdout.write(`  ${i + 1}/${roads.length} roads processed (${links.length} links so far)\r`)

    } catch {
      // silently skip failed roads
    }
  }

  console.log(`\n  ✅ Built ${links.length} road-area links`)
  return links
}

async function main() {
  console.log('╔══════════════════════════════════════════╗')
  console.log('║     Islamabad Traffic — Areas Seeder    ║')
  console.log('╚══════════════════════════════════════════╝')

  // 1. Insert areas
  console.log(`\n━━━ Inserting ${areas.length} areas...`)
  const insertedAreas = []
  for (let i = 0; i < areas.length; i += 50) {
    const batch = areas.slice(i, i + 50)
    const { data, error } = await supabase.from('areas').insert(batch).select()
    if (error) console.error('  ❌ Batch error:', error.message)
    else {
      insertedAreas.push(...data)
      process.stdout.write(`  ${insertedAreas.length}/${areas.length} inserted\r`)
    }
  }
  console.log(`\n  ✅ ${insertedAreas.length} areas in database`)

  await sleep(2000)

  // 2. Build road-area links using proximity
  const links = await buildLinksViaProximity(insertedAreas)

  // 3. Insert links in batches
  console.log('\n━━━ Inserting road-area links...')
  for (let i = 0; i < links.length; i += 50) {
    const batch = links.slice(i, i + 50)
    const { error } = await supabase.from('road_areas').insert(batch)
    if (error) console.error('  ❌ Links batch error:', error.message)
  }

  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║              SEED COMPLETE ✅            ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Areas:  ${String(insertedAreas.length).padEnd(32)}║`)
  console.log(`║  Roads:  232 (already in DB)             ║`)
  console.log(`║  Links:  ${String(links.length).padEnd(32)}║`)
  console.log('╚══════════════════════════════════════════╝')
}

main().catch(console.error)