// One-time import: reads ../portfolio.json + local /media files and pushes
// them into Sanity as real documents + uploaded assets. Safe to re-run —
// every document gets a deterministic _id, so re-running updates in place
// instead of duplicating.
import {createClient} from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_MIGRATE_TOKEN

if (!projectId || !token) {
  console.error(
    'Missing SANITY_STUDIO_PROJECT_ID or SANITY_MIGRATE_TOKEN.\n' +
      'Copy sanity/.env.example to sanity/.env and fill both in, then re-run `npm run migrate`.',
  )
  process.exit(1)
}

const client = createClient({projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false})

const portfolio = JSON.parse(fs.readFileSync(path.join(ROOT, 'portfolio.json'), 'utf8'))

const assetCache = new Map()

async function uploadAsset(relPath, kind) {
  if (!relPath) return null
  if (assetCache.has(relPath)) return assetCache.get(relPath)
  const absPath = path.join(ROOT, relPath)
  if (!fs.existsSync(absPath)) {
    console.warn(`  ⚠ media not found on disk, skipping: ${relPath}`)
    return null
  }
  const asset = await client.assets.upload(kind, fs.createReadStream(absPath), {
    filename: path.basename(absPath),
  })
  assetCache.set(relPath, asset)
  console.log(`  ↑ uploaded ${relPath}`)
  return asset
}

async function buildMedia(src, srcHint, srcType, caption) {
  const relPath = src || srcHint
  const mediaType = srcType || 'image'
  const kind = mediaType === 'video' ? 'file' : 'image'
  const asset = await uploadAsset(relPath, kind)
  const field = {_type: 'media', mediaType, caption: caption || undefined}
  if (!asset) return field
  if (kind === 'file') {
    field.video = {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}
  } else {
    field.image = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
  }
  return field
}

let keyCounter = 0
const key = () => `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`

async function buildBlocks(blocks = []) {
  const out = []
  for (const b of blocks) {
    const base = {_key: key(), wide: !!b.wide}
    switch (b.type) {
      case 'text':
        out.push({...base, _type: 'textBlock', heading: b.heading, paragraphs: b.paragraphs || []})
        break
      case 'image':
        out.push({...base, _type: 'imageBlock', media: await buildMedia(b.src, null, b.srcType, b.caption)})
        break
      case 'image-pair':
        out.push({
          ...base,
          _type: 'imagePairBlock',
          media1: await buildMedia(b.src1, null, b.src1Type, b.caption1),
          media2: await buildMedia(b.src2, null, b.src2Type, b.caption2),
        })
        break
      case 'video':
        out.push({...base, _type: 'videoBlock', videoUrl: b.src, caption: b.caption})
        break
      case 'pullquote':
        out.push({...base, _type: 'pullquoteBlock', text: b.text, source: b.source})
        break
      case 'stats':
        out.push({
          ...base,
          _type: 'statsBlock',
          stats: (b.stats || []).map((s) => ({_key: key(), value: s.value, label: s.label})),
        })
        break
      case 'divider':
        out.push({...base, _type: 'dividerBlock', label: b.label})
        break
      default:
        console.warn(`  ⚠ unknown block type "${b.type}", skipping`)
    }
  }
  return out
}

async function projectDoc(p, portfolioName, {isFeatured = false, badge} = {}) {
  console.log(`→ project: ${p.id}`)
  return {
    _id: `project-${p.id}`,
    _type: 'project',
    portfolio: portfolioName,
    title: p.title,
    slug: {_type: 'slug', current: p.id},
    latin: p.latin,
    cat: p.cat,
    year: p.year,
    hero: await buildMedia(p.src, p.srcHint, p.srcType, undefined),
    desc: p.desc,
    shortDesc: p.shortDesc,
    role: p.role,
    tools: p.tools || [],
    tags: p.tags || [],
    externalLink: p.link && !p.link.startsWith('project-template.html') ? p.link : undefined,
    blocks: await buildBlocks(p.blocks),
    status: p.status,
    statusLabel: p.statusLabel,
    visible: p.visible !== false,
    featuredHome: isFeatured ? true : !!p.featuredHome,
    isFeatured,
    badge: isFeatured ? badge : undefined,
  }
}

async function run() {
  const tx = client.transaction()

  // site settings (singleton)
  tx.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    systemsMeta: portfolio.systems.meta,
    graphicsMeta: portfolio.graphics.meta,
  })

  // wip items
  const wipItems = portfolio.wip || []
  for (let i = 0; i < wipItems.length; i++) {
    const w = wipItems[i]
    console.log(`→ wip: ${w.id}`)
    tx.createOrReplace({
      _id: `wip-${w.id}`,
      _type: 'wipItem',
      media: await buildMedia(w.src, null, w.type, w.caption),
      thumb: w.thumb ? (await buildMedia(w.thumb, null, 'image', undefined)).image : undefined,
      caption: w.caption,
      tag: w.tag,
      date: w.date,
      order: i,
    })
  }

  for (const portfolioName of ['systems', 'graphics']) {
    const section = portfolio[portfolioName]

    // featured / spotlight project
    if (section.featured) {
      tx.createOrReplace(
        await projectDoc(section.featured, portfolioName, {isFeatured: true, badge: section.featured.badge}),
      )
    }

    // groups + their projects
    const groups = section.groups || []
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi]
      for (const p of g.projects || []) {
        tx.createOrReplace(await projectDoc(p, portfolioName))
      }
      console.log(`→ group: ${portfolioName}/${g.id}`)
      tx.createOrReplace({
        _id: `projectGroup-${portfolioName}-${g.id}`,
        _type: 'projectGroup',
        portfolio: portfolioName,
        label: g.label,
        labelThai: g.labelThai,
        order: gi,
        projects: (g.projects || []).map((p) => ({
          _key: key(),
          _type: 'reference',
          _ref: `project-${p.id}`,
        })),
      })
    }
  }

  console.log('\nCommitting transaction…')
  await tx.commit()
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
