import {
  GIF,
  GIFAppExt,
  GIFBlock,
  GIFColorTable,
  GIFComExt,
  GIFExtBlock,
  GIFFrameData,
  GIFGCExt,
  GIFHeader,
  GIFImgBlock,
  GIFNetscapeExt,
  GIFPTExt,
  GIFUnknownAppExt,
  GIFUnknownExt,
} from '../types/gifs'

export const bitsToNumber = (bits: number[]): number => {
  return bits.reduce((bitIndex, bit) => {
    return bitIndex * 2 + bit
  }, 0)
}

const byteToBitArray = (byte: number): number[] => {
  const bitArray = []
  for (let bitIndex = 7; bitIndex >= 0; bitIndex--) {
    bitArray.push(byte & (1 << bitIndex) ? 1 : 0)
  }
  return bitArray
}

export class GIFStream {
  private readonly data: Uint8Array
  private pos: number

  constructor(data: Uint8Array) {
    this.data = data
    this.pos = 0
  }

  readByte() {
    if (this.pos >= this.data.byteLength) {
      throw new Error('Attempted to read past end of stream.')
    }
    return this.data[this.pos++]
  }

  read(numberOfBytes: number) {
    const result = new Uint8Array(numberOfBytes)
    for (let byteIndex = 0; byteIndex < numberOfBytes; byteIndex++) {
      result[byteIndex] = this.readByte()
    }
    return result
  }

  readUnsigned() {
    // Little-endian.
    const a = this.read(2)
    const result = new Uint8Array(2)
    result[0] = a[1]
    result[1] = a[0]
    return result
  }
}

const lzwDecode = (minCodeSize: number, data: Uint8Array): Uint8Array => {
  let pos = 0

  const readCode = (size: number) => {
    let code = 0
    for (let i = 0; i < size; i++) {
      if (data[pos >> 3] & (1 << (pos & 7))) {
        code |= 1 << i
      }
      pos++
    }
    return code
  }

  const outputBytes: number[] = []

  const clearCode = 1 << minCodeSize
  const eoiCode = clearCode + 1

  let codeSize = minCodeSize + 1

  let dict: number[][] = []

  const clear = function () {
    dict = []
    codeSize = minCodeSize + 1
    for (let i = 0; i < clearCode; i++) {
      dict[i] = [i]
    }
    dict[clearCode] = []
    dict[eoiCode] = []
  }

  let code = 0
  let last = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    last = code
    code = readCode(codeSize)

    if (code === clearCode) {
      clear()
      continue
    }
    if (code === eoiCode) break

    if (code < dict.length) {
      if (last !== clearCode) {
        dict.push(dict[last].concat(dict[code][0]))
      }
    } else {
      if (code !== dict.length) throw new Error('Invalid LZW code.')
      dict.push(dict[last].concat(dict[last][0]))
    }

    if (dict[code] !== null) {
      const dictAt = dict[code]
      outputBytes.push(...dictAt)
    }

    if (dict.length === 1 << codeSize && codeSize < 12) {
      // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
      codeSize++
    }
  }

  // I don't know if this is technically an error, but some GIFs do it.
  //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
  return new Uint8Array(outputBytes)
}

const parseColorTable = (gifStream: GIFStream, entriesCount: number): GIFColorTable => {
  const colorTable: GIFColorTable = []
  for (let i = 0; i < entriesCount; i++) {
    const colorBytes = gifStream.read(3)
    colorTable.push({
      red: colorBytes[0],
      green: colorBytes[1],
      blue: colorBytes[2],
    })
  }
  return colorTable
}

const uint8ArrayToString = (input: Uint8Array): string => {
  return new TextDecoder().decode(input)
}

const uint8ArrayToNumber = (input: Uint8Array): number => {
  let output = 0
  for (let i = 0; i < input.byteLength; i++) {
    output += input[i] << (8 * (input.byteLength - i - 1))
  }
  return output
}

const parseHeader = function (st: GIFStream): GIFHeader {
  const sig = st.read(3)
  const ver = st.read(3)

  const sigAsString = new TextDecoder().decode(sig)

  if (sigAsString !== 'GIF') {
    throw new Error('Not a GIF file.')
  }

  const width = uint8ArrayToNumber(st.readUnsigned())
  const height = uint8ArrayToNumber(st.readUnsigned())

  const bits = byteToBitArray(st.readByte())
  const globalColorTableFlag = bits.shift() || 0
  const colorRes = bitsToNumber(bits.splice(0, 3))
  const sorted = bits.shift() || 0
  const globalColorTableSize = bitsToNumber(bits.splice(0, 3))

  const bgColor = st.readByte()
  const pixelAspectRatio = st.readByte() // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

  let globalColorTable: GIFColorTable = []

  if (globalColorTableFlag) {
    globalColorTable = parseColorTable(st, 1 << (globalColorTableSize + 1))
  }

  return {
    sig,
    ver,
    bgColor,
    colorRes,
    globalColorTable,
    globalColorTableFlag,
    globalColorTableSize,
    height,
    pixelAspectRatio,
    sorted,
    width,
  }
}

const parseBlock = (st: GIFStream): GIFBlock => {
  const sentinel = st.readByte()

  switch (
    String.fromCharCode(sentinel) // For ease of matching
  ) {
    case '!':
      return parseExt(st)
    case ',':
      return parseImg(st)
    case ';':
      return {
        type: 'eof',
      }
    default:
      throw new Error('Unknown block: 0x' + sentinel.toString(16)) // TODO: Pad this with a 0.
  }
}

const readSubBlocks = (st: GIFStream): Uint8Array => {
  let size
  const bytes: number[] = []
  do {
    size = st.readByte()
    bytes.push(...st.read(size))
  } while (size !== 0)
  return new Uint8Array(bytes)
}

const parseNetscapeExt = function (st: GIFStream): GIFNetscapeExt {
  const blockSize = st.readByte() // Always 3
  const unknown = st.readByte() // ??? Always 1? What is this?
  const iterations = st.readUnsigned()
  const terminator = st.readByte()
  return {
    type: 'netscape',
    iterations,
    terminator,
    unknown,
  }
}

const parseUnknownAppExt = (st: GIFStream): GIFUnknownAppExt => {
  const appData = readSubBlocks(st)

  return {
    type: 'unknown-app',
    appData,
  }
}

const parseAppExt = function (st: GIFStream): GIFAppExt {
  const blockSize = st.readByte() // Always 11
  const identifier = st.read(8)
  const authCode = st.read(3)
  switch (uint8ArrayToString(identifier)) {
    case 'NETSCAPE':
      return parseNetscapeExt(st)
    default:
      return parseUnknownAppExt(st)
  }
}

const parseUnknownExt = (st: GIFStream): GIFUnknownExt => {
  const data = readSubBlocks(st)

  return {
    type: 'unknown',
    data,
  }
}

const parsePTExt = (st: GIFStream): GIFPTExt => {
  // No one *ever* uses this. If you use it, deal with parsing it yourself.
  const blockSize = st.readByte() // Always 12
  const ptHeader = st.read(12)
  const ptData = readSubBlocks(st)

  return {
    type: 'pt',
    ptHeader,
    ptData,
  }
}

const deinterlace = (pixels: Uint8Array, width: number): Uint8Array => {
  // Of course this defeats the purpose of interlacing. And it's *probably*
  // the least efficient way it's ever been implemented. But nevertheless...
  const newPixels: number[] = []
  const rows = pixels.length / width
  const cpRow = (toRow: number, fromRow: number) => {
    const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width)
    newPixels.splice(toRow * width, width, ...fromPixels)
  }

  // See appendix E.
  const offsets = [0, 4, 2, 1]
  const steps = [8, 8, 4, 2]

  let fromRow = 0
  for (let pass = 0; pass < 4; pass++) {
    for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
      cpRow(toRow, fromRow)
      fromRow++
    }
  }

  return new Uint8Array(newPixels)
}

const parseGCExt = function (st: GIFStream): GIFGCExt {
  const blockSize = st.readByte() // Always 4

  const bits = byteToBitArray(st.readByte())
  const reserved = new Uint8Array([bitsToNumber(bits.splice(0, 3))]) // Reserved; should be 000.
  const disposalMethod = bitsToNumber(bits.splice(0, 3))
  const userInput = bits.shift() || 0
  const transparencyGiven = bits.shift() || 0
  const delayTime = uint8ArrayToNumber(st.readUnsigned())
  const transparencyIndex = st.readByte()
  const terminator = st.readByte()

  return {
    type: 'gce',
    reserved,
    disposalMethod,
    userInput,
    transparencyGiven,
    delayTime,
    transparencyIndex,
    terminator,
  }
}

const parseComExt = function (st: GIFStream): GIFComExt {
  const comment = readSubBlocks(st)

  return {
    type: 'com',
    comment,
  }
}

const parseExt = (st: GIFStream): GIFExtBlock => {
  const label = st.readByte()
  switch (label) {
    case 0xf9:
      return parseGCExt(st)
    case 0xfe:
      return parseComExt(st)
    case 0x01:
      return parsePTExt(st)
    case 0xff:
      return parseAppExt(st)
    default:
      return parseUnknownExt(st)
  }
}

const parseImg = function (st: GIFStream): GIFImgBlock {
  const leftPos = uint8ArrayToNumber(st.readUnsigned())
  const topPos = uint8ArrayToNumber(st.readUnsigned())
  const width = uint8ArrayToNumber(st.readUnsigned())
  const height = uint8ArrayToNumber(st.readUnsigned())

  const bits = byteToBitArray(st.readByte())
  const localColorTableFlag = bits.shift() || 0
  const interlaced = bits.shift() || 0
  const sorted = bits.shift() || 0
  const reserved = new Uint8Array([bitsToNumber(bits.splice(0, 2))])
  const localColorTableSize = bitsToNumber(bits.splice(0, 3))

  let localColorTable: GIFColorTable = []

  if (localColorTableFlag) {
    localColorTable = parseColorTable(st, 1 << (localColorTableSize + 1))
  }

  const lzwMinCodeSize = st.readByte()
  const lzwData = readSubBlocks(st)

  let pixels = lzwDecode(lzwMinCodeSize, lzwData)

  if (interlaced) {
    pixels = deinterlace(pixels, width)
  }

  return {
    type: 'img',
    leftPos,
    topPos,
    width,
    height,
    localColorTableFlag,
    interlaced,
    sorted,
    reserved,
    localColorTableSize,
    localColorTable,
    lzwMinCodeSize,
    lzwData,
    pixels,
  }
}

export const parseGIF = (st: GIFStream): GIF => {
  const header = parseHeader(st)
  const blocks: GIFBlock[] = []
  const frameData: GIFFrameData[] = []
  const offscreenCanvas = new OffscreenCanvas(header.width, header.height)

  let frame: OffscreenCanvasRenderingContext2D | null = null
  let transparency: number | null = null
  let delay = 0
  let disposalMethod = null
  let lastDisposalMethod = null

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const block = parseBlock(st)
    blocks.push(block)

    if (block.type === 'gce') {
      if (frame) {
        frameData.push({
          image: frame.getImageData(0, 0, header.width, header.height),
          delay,
        })
      }

      transparency = block.transparencyGiven ? block.transparencyIndex : null
      delay = block.delayTime
      lastDisposalMethod = disposalMethod
      disposalMethod = block.disposalMethod
      frame = null
    }

    if (block.type === 'img') {
      if (!frame) {
        frame = offscreenCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D

        if (frame === null) {
          throw new Error('Unable to get canvas 2d context')
        }
      }

      const colorTable = block.localColorTableFlag ? block.localColorTable : header.globalColorTable
      const currentData = frame.getImageData(block.leftPos, block.topPos, block.width, block.height)

      for (let i = 0; i < block.pixels.length; i++) {
        const pixel = block.pixels[i]

        if (transparency !== pixel) {
          // This includes null, if no transparency was defined.
          currentData.data[i * 4 + 0] = colorTable[pixel].red
          currentData.data[i * 4 + 1] = colorTable[pixel].green
          currentData.data[i * 4 + 2] = colorTable[pixel].blue
          currentData.data[i * 4 + 3] = 255 // Opaque.
        } else if (lastDisposalMethod === 2 || lastDisposalMethod === 3) {
          currentData.data[i * 4 + 3] = 0
        }
      }

      frame.putImageData(currentData, block.leftPos, block.topPos)
    }

    if (block.type === 'eof') {
      if (frame) {
        frameData.push({
          image: frame.getImageData(0, 0, header.width, header.height),
          delay,
        })
      }

      break
    }
  }

  return {
    header,
    blocks,
    frameData,
  }
}
