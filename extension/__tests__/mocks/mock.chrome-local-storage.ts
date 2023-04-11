type GetResult = { [key: string]: any }
type MockLocalStorage = {
  get: (keys: string | string[] | null) => Promise<GetResult>
  set: (items: { [key: string]: any }) => Promise<void>
  clear: () => Promise<void>
}

export const createMockLocalStorage = (): MockLocalStorage => {
  const store: { [key: string]: any } = {}

  const get = async (keys: string[]): Promise<GetResult> => {
    let anyFound = false
    const result: GetResult = {}

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        anyFound = true
        result[key] = store[key]
      }
    }

    if (anyFound) {
      return result
    }

    return {}
  }

  const set = async (items: { [key: string]: any }): Promise<void> => {
    for (const key of Object.keys(items)) {
      store[key] = items[key]
    }
  }

  const clear = async (): Promise<void> => {
    for (const key of Object.keys(store)) {
      delete store[key]
    }
  }

  return {
    get,
    set,
    clear,
  }
}

export const installMockLocalStorage = (mockLocalStorage: MockLocalStorage) => {
  const a = globalThis as any
  a.chrome = {
    storage: {
      local: mockLocalStorage,
    },
  }
}
