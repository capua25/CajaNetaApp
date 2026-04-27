import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svgPath = resolve(root, 'src/app/icon.svg')
const icoPath = resolve(root, 'src/app/favicon.ico')

const sizes = [16, 32, 48, 256]

async function buildIco() {
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(readFileSync(svgPath))
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  )

  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)           // reserved
  header.writeUInt16LE(1, 2)           // type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4) // image count

  // Directory entries: 16 bytes each
  const dirSize = sizes.length * 16
  const dataOffset = 6 + dirSize
  const directory = Buffer.alloc(dirSize)

  let offset = dataOffset
  sizes.forEach((size, i) => {
    const entry = directory.subarray(i * 16, i * 16 + 16)
    entry.writeUInt8(size === 256 ? 0 : size, 0) // width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2)                        // color count
    entry.writeUInt8(0, 3)                        // reserved
    entry.writeUInt16LE(1, 4)                     // color planes
    entry.writeUInt16LE(32, 6)                    // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8)  // image data size
    entry.writeUInt32LE(offset, 12)               // image data offset
    offset += pngBuffers[i].length
  })

  const ico = Buffer.concat([header, directory, ...pngBuffers])
  writeFileSync(icoPath, ico)
  console.log(`favicon.ico generado: ${ico.length} bytes (${sizes.join('x, ')}x)`)
}

buildIco().catch(err => { console.error(err); process.exit(1) })
