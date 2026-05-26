import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

const Terms: React.FC = () => (
  <LegalPage title="Terms of use">
    <p>
      These Terms govern access to Netfluenz and the Netfluenz marketing site and application. By using the
      service, you agree to these Terms. If you do not agree, do not use the service.
    </p>
    <p>
      <strong>Product scope.</strong> Features and availability can change as the service evolves. Wallet balances, escrow
      figures, and payment flows in the app are operational records for your workflow; regulated settlement or banking
      integrations are your responsibility unless separately contracted.
    </p>
    <p>
      <strong>Accounts.</strong> You are responsible for your credentials and for activity under your account. Notify
      Netfluenz promptly of unauthorized use.
    </p>
    <p>
      <strong>Content.</strong> You retain rights to content you submit. You grant Netfluenz a licence to host, display, and
      process that content to operate the service.
    </p>
    <p>
      <strong>Disclaimers.</strong> The service is provided “as is” to the maximum extent permitted by law. Netfluenz disclaims
      implied warranties where allowed.
    </p>
    <p>
      <strong>Contact.</strong> Questions about these Terms: see the{' '}
      <Link to="/contact" className="text-[#FF5500] font-semibold underline">
        Contact
      </Link>{' '}
      page.
    </p>
    <p className="text-xs text-gray-500">
      Last updated: April 2026. Operators should have qualified legal counsel review and adapt this document before
      production use.
    </p>
  </LegalPage>
);

export default Terms;
