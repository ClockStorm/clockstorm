import React from 'react'
import extensionOptionsImage from '../../assets/images/extension-options.jpg'
import '../components/guide.scss'

export const GuidePage: React.FC = () => {
  return (
    <div id='page'>
      <div id='install-status'>
        <div className='no-install-detected'>
          <p>It looks like you have not installed and enabled the extension yet!</p>
          <a href='https://chrome.google.com/webstore/detail/clockstorm/jhkmhbncjplkgpdfkjjdjimhooffjbpl'>
            Install Clock Storm
          </a>
        </div>
        <div className='install-detected'>
          <p>Your extension is installed and enabled. 😎</p>
        </div>
      </div>
      <div id='guide'>
        <h2>User Guide</h2>
        <p>
          Welcome to the Clock Storm User Guide! Clock Storm is a Google Chrome extension designed to help employees
          remember to fill out and submit their time cards on schedule. With customizable GIF and sound notifications,
          Clock Storm ensures you never miss a deadline.
        </p>

        <p className='headline'>Features:</p>

        <div id='split'>
          <div className='left'>
            <ol>
              <li>
                Customizable notifications:
                <ul>
                  <li>
                    Daily reminders: Receive notifications throughout the week if you forget to clock or save your time
                    card for the day.
                  </li>
                  <li>
                    End of week reminders: Be reminded as the deadline for submitting your timesheet approaches until
                    you save and submit your time card for the week.
                  </li>
                  <li>
                    End of month reminders (Beta): Get notified at the end of the month to submit your time cards if the
                    end of the month lies in the middle of the week.
                  </li>
                </ul>
              </li>
              <li>
                Personalized GIFs and sounds:
                <ul>
                  <li>
                    Choose from a preset list of GIFs or upload your own. The selected GIF will animate as the Chrome
                    extension&#39;s icon in the toolbar while a notification is active.
                  </li>
                  <li>
                    Select from a preset list of sounds or upload your own. The chosen sound will play on loop while a
                    notification is active.
                  </li>
                </ul>
              </li>
            </ol>

            <p className='headline'>Customizing Clock Storm:</p>

            <p>
              To toggle reminders on or off, access the extension options by clicking on the Clock Storm icon in your
              browser toolbar.
            </p>
          </div>
          <div className='right'>
            <img src={extensionOptionsImage} />
          </div>
        </div>

        <p className='headline'>Support:</p>

        <p>
          If you encounter any issues or have questions, please visit our support website at{' '}
          <a href='https://github.com/clockstorm/clockstorm/issues' target='_blank' rel='noopener noreferrer'>
            https://github.com/clockstorm/clockstorm/issues
          </a>
        </p>

        <p className='closing'>
          We hope Clock Storm helps you stay on top of your time card submissions and makes your work life a little
          easier!
        </p>
      </div>
    </div>
  )
}
