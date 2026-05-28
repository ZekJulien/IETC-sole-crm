export function formatClientName(client: { firstName?: string | null; name: string }): string {
  return [client.firstName, client.name].filter(Boolean).join(' ') || client.name
}
