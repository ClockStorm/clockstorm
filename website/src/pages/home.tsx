import React from 'react'
import { Link } from 'react-router-dom'
import '../components/home.scss'

export const HomePage: React.FC = () => {
  return (
    <div id='page'>
      <p>The extension for Google Chrome that helps users remember to fill out their time cards.</p>
      <div id='download'>
        <Link to='/download'>Add to Chrome</Link>
      </div>
    </div>
  )
}
