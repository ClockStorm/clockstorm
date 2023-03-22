import { GIF } from '../types/gifs'
import { BackgroundTask, DelayBackgroundTaskState, DoneBackgroundTaskState } from './background-task'

interface PlayingAnimatedIconState extends DelayBackgroundTaskState {
  frameNumber: number
}

type AnimatedIconState = PlayingAnimatedIconState | DoneBackgroundTaskState

export const animatedIcon = (gif: GIF): BackgroundTask<AnimatedIconState> => {
  return {
    createInitialState: async () => {
      return {
        type: 'delay',
        delay: 0,
        frameNumber: 0,
      }
    },
    execute: async (state) => {
      await chrome.action.setIcon({
        imageData: gif.frameData[state.frameNumber].image,
      })

      return {
        type: 'delay',
        delay: gif.frameData[state.frameNumber].delay * 10,
        frameNumber: (state.frameNumber + 1) % gif.frameData.length,
      }
    },
  }
}
