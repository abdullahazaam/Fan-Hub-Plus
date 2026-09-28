import type { ContentItem } from '../types'
import chronicleArtworkJson from './chronicleArtwork.json'

const artworkMap = chronicleArtworkJson as Record<string, string>

const topicFallbacks: [RegExp, string][] = [
  [/berserk/, '/editorial/berserk.jpg'],
  [/watchmen/, '/editorial/watchmen.jpg'],
  [/\bbts\b|hwayangyeonhwa/, '/editorial/bts-hyyh.jpg'],
  [/shōgun|shogun/, '/editorial/shogun.jpg'],
  [/witcher.?4/, '/chronicles/witcher4.jpg'],
  [/demon slayer/, '/chronicles/demonslayer.jpg'],
  [/attack on titan/, '/chronicles/aot_legacy.jpg'],
  [/blackpink/, '/chronicles/blackpink.jpg'],
  [/secret wars/, '/chronicles/secretwars.jpg'],
]

export function resolveChronicleArtwork(item: ContentItem): string {
  const curated = artworkMap[String(item.id)]
  if (curated) return curated

  const topic = `${item.title} ${item.fandomUniverse}`.toLowerCase()
  const matched = topicFallbacks.find(([pattern]) => pattern.test(topic))
  if (matched) return matched[1]

  if (item.mediaUrl && /\.(avif|webp|png|jpe?g)(?:[?#]|$)/i.test(item.mediaUrl)) {
    return item.mediaUrl
  }
  return item.thumbnailUrl || ''
}
