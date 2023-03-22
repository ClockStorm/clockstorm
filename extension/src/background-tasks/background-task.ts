import { waitFor } from '../utils/utils'

export interface DelayBackgroundTaskState {
  type: 'delay'
  delay: number
}

export interface DoneBackgroundTaskState {
  type: 'done'
}

export type BackgroundTaskState = DelayBackgroundTaskState | DoneBackgroundTaskState

export interface BackgroundTask<TState extends BackgroundTaskState> {
  createInitialState: () => Promise<TState & DelayBackgroundTaskState>
  execute: (state: TState & DelayBackgroundTaskState) => Promise<TState>
}

const isBackgroundTaskState = (state: any): state is BackgroundTaskState => {
  return state !== null && typeof state.type === 'string' && (state.type === 'delay' || state.type === 'done')
}

export type CheckIsRunningFn = () => boolean

interface BackgroundTaskExecutionProperties<TState extends BackgroundTaskState> {
  task: BackgroundTask<TState>
  checkCancellationFunction: () => boolean
  onDoneFunction: () => void
}

export const executeBackgroundTask = <TState extends BackgroundTaskState>(
  properties: BackgroundTaskExecutionProperties<TState>,
): CheckIsRunningFn => {
  let isRunning = true

  const { task, checkCancellationFunction, onDoneFunction } = properties

  setTimeout(async () => {
    let state: TState = await task.createInitialState()

    while (!checkCancellationFunction()) {
      if (!isBackgroundTaskState(state)) {
        throw new Error('createInitialState() must return a BackgroundTaskState')
      }

      if (state.type === 'done') {
        break
      }

      await waitFor(state.delay)
      state = await task.execute(state)
    }

    onDoneFunction()
    isRunning = false
  }, 0)

  return () => isRunning
}
