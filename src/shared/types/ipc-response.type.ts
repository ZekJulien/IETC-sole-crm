export interface IpcResponse<T> {
  data:  T | null
  error: { message: string } | null
}
