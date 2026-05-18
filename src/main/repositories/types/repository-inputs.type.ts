type ManagedFields = 'id' | 'createdAt' | 'updatedAt'

export type CreateInput<T> = Omit<T, ManagedFields>
export type UpdateInput<T> = Partial<Omit<T, ManagedFields>> & { id: number }
