type TimePickerChangeListener = (value: string) => void

interface GetTimePickerInputAPI {
  getValue: () => string
  setValue: (value: string) => void
  addChangeListener: (listener: TimePickerChangeListener) => void
}

export const createTimePicker = (container: HTMLElement): GetTimePickerInputAPI => {
  if ((container as any)['getTimePickerInputAPI']) {
    return (container as any)['getTimePickerInputAPI']
  }

  const hourSelectorElement = container.querySelector('.hour-selector') as HTMLInputElement
  const minuteSelectorElement = container.querySelector('.minute-selector') as HTMLInputElement
  const amPmSelectorElement = container.querySelector('.am-pm-selector') as HTMLDivElement
  const amPmButtonElements = amPmSelectorElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
  const listeners: TimePickerChangeListener[] = []

  const isValidValue = (value: string) => {
    return /^(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23):[0-5][0-9]$/.test(value)
  }

  const getValue = () => {
    const hour = hourSelectorElement.value
    const hourNumber = parseInt(hour, 10)
    const minute = minuteSelectorElement.value
    const amPm = amPmButtonElements[0].classList.contains('selected') ? 'am' : 'pm'

    let adjustedHour = hour

    if (amPm === 'am' && hourNumber === 12) {
      adjustedHour = '00'
    } else if (amPm === 'pm' && hourNumber !== 12) {
      adjustedHour = (hourNumber + 12).toString()
    }

    const value = `${adjustedHour}:${minute}`
    return value
  }

  const isValidHour = (hour: string) => {
    const hourNumber = parseInt(hour, 10)
    return !isNaN(hourNumber) && hourNumber >= 1 && hourNumber <= 12
  }

  const sanitizeHour = () => {
    const isValid = isValidHour(hourSelectorElement.value)

    if (!isValid) {
      hourSelectorElement.value = hourSelectorElement.getAttribute('data-default-value') as string
      onChange()
    }

    const hour = parseInt(hourSelectorElement.value, 10)
    hourSelectorElement.value = hour.toString().padStart(2, '0')
    onChange()
  }

  hourSelectorElement.addEventListener('blur', () => {
    sanitizeHour()
  })

  const onChange = () => {
    const value = getValue()

    if (!isValidValue(value)) {
      return
    }

    for (const listener of listeners) {
      listener(value)
    }
  }

  const isValidMinute = (minute: string) => {
    const minuteNumber = parseInt(minute, 10)
    return !isNaN(minuteNumber) && minuteNumber >= 0 && minuteNumber <= 59
  }

  const sanitizeMinute = () => {
    const isValid = isValidMinute(minuteSelectorElement.value)

    if (!isValid) {
      minuteSelectorElement.value = minuteSelectorElement.getAttribute('data-default-value') as string
      onChange()
    }

    const minute = parseInt(minuteSelectorElement.value, 10)
    minuteSelectorElement.value = minute.toString().padStart(2, '0')
    onChange()
  }

  minuteSelectorElement.addEventListener('blur', () => {
    sanitizeMinute()
  })

  sanitizeHour()
  sanitizeMinute()

  hourSelectorElement.addEventListener('change', onChange)
  minuteSelectorElement.addEventListener('change', onChange)

  for (const amPmButtonElement of amPmButtonElements) {
    amPmButtonElement.addEventListener('click', () => {
      for (const button of amPmButtonElements) {
        button.classList.remove('selected')
      }

      amPmButtonElement.classList.add('selected')
      onChange()
    })
  }

  const api = {
    getValue,
    setValue: (value: string) => {
      const [hour, minute] = value.split(':')
      const hourNumber = parseInt(hour, 10)

      let adjustedHour = hour

      if (hourNumber === 0) {
        adjustedHour = '12'
      } else if (hourNumber > 12) {
        adjustedHour = (hourNumber - 12).toString().padStart(2, '0')
      }

      hourSelectorElement.value = adjustedHour
      minuteSelectorElement.value = minute.padStart(2, '0')

      if (hourNumber >= 12) {
        amPmButtonElements[1].classList.add('selected')
        amPmButtonElements[0].classList.remove('selected')
      } else {
        amPmButtonElements[0].classList.add('selected')
        amPmButtonElements[1].classList.remove('selected')
      }
    },
    addChangeListener: (listener: TimePickerChangeListener) => {
      listeners.push(listener)
    },
  }

  ;(container as any)['getTimePickerInputAPI'] = api

  return api
}
