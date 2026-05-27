import { IpcResponse } from '../../types'
import { ExportPdfDto } from '../../dtos/pdf'

export interface PdfAPI {
  exportInvoice: (data: ExportPdfDto) => Promise<IpcResponse<string | null>>
  exportQuote:   (data: ExportPdfDto) => Promise<IpcResponse<string | null>>
}
