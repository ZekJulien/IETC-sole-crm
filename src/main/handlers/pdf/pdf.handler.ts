import { dialog, shell, BrowserWindow, SaveDialogOptions } from 'electron'
import { promises as fs } from 'node:fs'
import { PDF_CHANNELS } from '@shared/channels/pdf'
import { ExportPdfSchema } from '@shared/dtos/pdf'
import { ipcHandleNoTx } from '../../core/ipc.handle'
import { PdfService, PdfResult } from '../../services/pdf'

export function registerPdfHandlers(service: PdfService): void {
  ipcHandleNoTx(PDF_CHANNELS.EXPORT_INVOICE, ExportPdfSchema, (data) => exportPdf(() => service.invoicePdf(data)))
  ipcHandleNoTx(PDF_CHANNELS.EXPORT_QUOTE,   ExportPdfSchema, (data) => exportPdf(() => service.quotePdf(data)))
}

async function exportPdf(build: () => Promise<PdfResult>): Promise<string | null> {
  const { buffer, filename } = await build()
  const target = await promptSavePath(filename)
  if (!target) return null
  await fs.writeFile(target, buffer)
  void shell.openPath(target)
  return target
}

async function promptSavePath(filename: string): Promise<string | null> {
  const options: SaveDialogOptions = {
    defaultPath: filename,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  }
  const win = BrowserWindow.getFocusedWindow()
  const result = win
    ? await dialog.showSaveDialog(win, options)
    : await dialog.showSaveDialog(options)
  return result.canceled || !result.filePath ? null : result.filePath
}
