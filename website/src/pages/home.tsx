import React from 'react'
import { Link } from 'react-router-dom'
import '../components/home.scss'

export const HomePage: React.FC = () => {
  return (
    <div id='page'>
      <p>The extension for Google Chrome that helps users remember to fill out their time cards.</p>
      <div id='links'>
        <a
          href='https://chrome.google.com/webstore/detail/clockstorm/jhkmhbncjplkgpdfkjjdjimhooffjbpl'
          className='download'
        >
          Add to Chrome
        </a>
        <Link to='/guide' className='user-guide'>
          User Guide
        </Link>
      </div>
    </div>
  )
}
