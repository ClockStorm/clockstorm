export interface GIFEOFBlock {
  type: 'eof'
}

export interface GIFImgBlock {
  type: 'img'
  leftPos: number
  topPos: number
  width: number
  height: number
  localColorTableFlag: number
  interlaced: number
  sorted: number
  reserved: Uint8Array
  localColorTableSize: number
  localColorTable: GIFColorTable
  lzwMinCodeSize: number
  lzwData: Uint8Array
  pixels: Uint8Array
}

export type GIFBlock = GIFExtBlock | GIFImgBlock | GIFEOFBlock

export interface GIFNetscapeExt {
  type: 'netscape'
  unknown: number
  iterations: Uint8Array
  terminator: number
}

export interface GIFUnknownAppExt {
  type: 'unknown-app'
  appData: Uint8Array
}

export type GIFAppExt = GIFNetscapeExt | GIFUnknownAppExt

export interface GIFUnknownExt {
  type: 'unknown'
  data: Uint8Array
}

export interface GIFPTExt {
  type: 'pt'
  ptHeader: Uint8Array
  ptData: Uint8Array
}

export interface GIFGCExt {
  type: 'gce'
  reserved: Uint8Array
  disposalMethod: number
  userInput: number
  transparencyGiven: number
  delayTime: number
  transparencyIndex: number
  terminator: number
}

export interface GIFComExt {
  type: 'com'
  comment: Uint8Array
}

export type GIFExtBlock = GIFAppExt | GIFGCExt | GIFComExt | GIFPTExt | GIFUnknownExt

export interface GIF {
  header: GIFHeader
  blocks: GIFBlock[]
  frameData: GIFFrameData[]
}

export interface GIFHeader {
  sig: Uint8Array
  ver: Uint8Array
  width: number
  height: number
  globalColorTableFlag: number
  colorRes: number
  sorted: number
  globalColorTableSize: number
  bgColor: number
  pixelAspectRatio: number
  globalColorTable: GIFColorTable
}

export interface GIFColor {
  red: number
  green: number
  blue: number
}

export type GIFColorTable = GIFColor[]

export interface GIFFrameData {
  image: ImageData
  delay: number
}
