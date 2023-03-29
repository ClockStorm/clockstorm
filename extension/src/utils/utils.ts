export const waitFor = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const doIf = (action: () => Promise<void>, condition: () => Promise<boolean>): Promise<boolean> => new Promise((resolve) => {
  return condition().then((doIt) => {
    if (doIt) {
      return action().then(() => resolve(true))
    }

    return resolve(false)
  })
})

export const doWhile = async (action: () => Promise<void>, condition: () => Promise<boolean>, after: () => Promise<void>) => {
  let shouldContinue = true
  while (shouldContinue) {
    shouldContinue = await doIf(action, condition)
    await after()
  }
}

export const forever = async () => true
