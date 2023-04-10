export const createTabs = () => {
  const tabs = document.getElementById('tabs') as HTMLDivElement
  const tabSections = Array.from(document.querySelectorAll('section')) as HTMLElement[]
  const tabLinks = Array.from(tabs.querySelectorAll('a')) as HTMLAnchorElement[]

  for (const tabLink of tabLinks) {
    tabLink.addEventListener('click', (event) => {
      event.preventDefault()

      const tabId = tabLink.getAttribute('data-tab') as string
      const tabSection = document.querySelector(`section[data-tab=${tabId}]`) as HTMLElement
      const tabLinkText = tabLink.querySelector('i') as HTMLElement

      for (const tabSectionSingle of tabSections) {
        tabSectionSingle.classList.add('hidden')
      }

      for (const tabLinkSingle of tabLinks) {
        const tabLinkTextSingle = tabLinkSingle.querySelector('i') as HTMLElement
        tabLinkTextSingle.classList.remove('fa-solid')
        tabLinkTextSingle.classList.add('fa-regular')
        tabLinkSingle.classList.remove('selected')
      }

      tabSection.classList.remove('hidden')
      tabLinkText.classList.add('fa-solid')
      tabLinkText.classList.remove('fa-regular')
      tabLink.classList.add('selected')
    })
  }
}
