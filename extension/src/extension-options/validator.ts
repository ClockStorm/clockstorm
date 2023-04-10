export type ValidatorElement = 'daily-reminder-days' | 'end-of-week-reminder-times' | 'end-of-month-reminder-times'

const elements: Record<ValidatorElement, boolean> = {
  'end-of-week-reminder-times': true,
  'daily-reminder-days': true,
  'end-of-month-reminder-times': true,
}

export interface Validator {
  setValid: (element: ValidatorElement, isValid: boolean) => void
  isValid: () => boolean
}

const onChange = () => {
  const saveButton = document.getElementById('save') as HTMLButtonElement
  saveButton.disabled = !validator.isValid()
}

export const validator: Validator = {
  setValid: (element: ValidatorElement, isValid: boolean) => {
    elements[element] = isValid
    onChange()
  },
  isValid: () => {
    return Object.values(elements).every((isValid) => isValid)
  },
}
