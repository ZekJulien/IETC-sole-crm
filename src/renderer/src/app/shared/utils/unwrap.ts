import { IpcResponse } from '@shared/types'

export function unwrap<T>(res: IpcResponse<T>): T {
  if (res.error) throw new Error(res.error.message)
  return res.data!
}
