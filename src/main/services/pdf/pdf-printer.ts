import type { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces'

type PdfKitDoc = NodeJS.ReadableStream & { end(): void }
type PdfPrinterCtor = new (fonts: TFontDictionary) => {
  createPdfKitDocument(doc: TDocumentDefinitions): PdfKitDoc
}

const PdfPrinter = require('pdfmake') as PdfPrinterCtor

const FONTS: TFontDictionary = {
  Helvetica: {
    normal:      'Helvetica',
    bold:        'Helvetica-Bold',
    italics:     'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
}

let printer: InstanceType<PdfPrinterCtor> | null = null

export function renderToBuffer(definition: TDocumentDefinitions): Promise<Buffer> {
  if (!printer) printer = new PdfPrinter(FONTS)
  const pdf = printer.createPdfKitDocument(definition)
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    pdf.on('data', (chunk: Buffer) => chunks.push(chunk))
    pdf.on('end', () => resolve(Buffer.concat(chunks)))
    pdf.on('error', reject)
    pdf.end()
  })
}
