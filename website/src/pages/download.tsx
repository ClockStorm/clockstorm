import chromeWebStoreLogo from '@assets/images/chrome-web-store-logo.png'
import React from 'react'
import '../components/download.scss'

export const DownloadPage: React.FC = () => {
  return (
    <div id='page'>
      <p className='chrome-web-store-instructions'>
        Click the link below to visit the Chrome Web Store to download Clock Storm
      </p>
      <a href='https://chrome.google.com/webstore/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb'>
        <img className='chrome-web-store-logo' src={chromeWebStoreLogo} alt='Chrome Web Store' />
      </a>
    </div>
  )
}
