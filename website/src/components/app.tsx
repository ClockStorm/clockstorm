import { GuidePage } from '@src/pages/guide'
import { HomePage } from '@src/pages/home'
import { PrivacyPage } from '@src/pages/privacy'
import React from 'react'
import { Route } from 'react-router'
import { HashRouter, Link, Switch } from 'react-router-dom'
import './app.scss'

const Application: React.FC = () => {
  return (
    <HashRouter hashType='noslash'>
      <div id='container'>
        <header>
          <Link className='header-link' to='/'>
            <div id='logo'></div>
            <h1>Clock Storm</h1>
          </Link>
        </header>
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route path='/guide' component={GuidePage} />
          <Route path='/privacy' component={PrivacyPage} />
        </Switch>
        <footer>
          <p>
            Clock Storm is a{' '}
            <a href='https://github.com/clockstorm/clockstorm' target='_blank' rel='noopener noreferrer'>
              free and open source project
            </a>
            . It is not affiliated with SalesForce or FinancialForce.
          </p>
          <p>
            <Link to='/privacy'>Privacy Policy</Link>
          </p>
        </footer>
      </div>
    </HashRouter>
  )
}

export default Application
