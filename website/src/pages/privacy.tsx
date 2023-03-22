import React from 'react'
import '../components/privacy.scss'

export const PrivacyPage: React.FC = () => {
  return (
    <div id='page'>
      <div id='privacy'>
        <h2>Privacy Policy</h2>
        <p>Last updated: March 20, 2023</p>
        <p>
          This Privacy Policy describes how Clock Storm (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) handles
          your personal information when you use our Google Chrome extension (&quot;Extension&quot;). By using the
          Extension, you agree to the collection and use of information in accordance with this policy.
        </p>
        <h3>1. Information Collection and Use</h3>
        <p>
          Clock Storm does not collect any personal information from users. The primary purpose of the Extension is to
          help remind users to submit their time cards.
        </p>
        <h3>2. Chrome Local Storage</h3>
        <p>
          The Extension uses Chrome Local Storage to persist time sheet state information. This data is stored locally
          on your device and is not transmitted to any external servers.
        </p>
        <h3>3. Data Retention and Deletion</h3>
        <p>
          Since we do not collect personal information, there is no data retention period. However, the information
          stored in Chrome Local Storage will be removed when the Extension is uninstalled from your browser.
        </p>
        <h3>4. Security</h3>
        <p>
          We take the security of your information seriously. Clock Storm ensures that your data is secure by only
          storing information within Chrome Local Storage and not sending it to any external servers. We only view
          status information from time card websites when a user visits the time sheet page.
        </p>
        <h3>5. Changes to This Privacy Policy</h3>
        <p>
          We may update our Privacy Policy from time to time. We will notify users of any changes by posting the updated
          Privacy Policy at a permanent location on our website. You are advised to review this Privacy Policy
          periodically for any changes.
        </p>
        <h3>6. Contact Us</h3>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
        <p>Email: clockstormapp@gmail.com</p>
      </div>
    </div>
  )
}
