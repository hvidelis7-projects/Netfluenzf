import React from 'react';
import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

const Privacy: React.FC = () => (
  <LegalPage title="Privacy policy">
    <p>
      This policy describes how Netfluenz handles information in connection with the Kenya-focused creator marketplace
      experience.
    </p>
    <p>
      <strong>What Netfluenz collects.</strong> Netfluenz may collect account details (such as email and role), usage data, device and
      log data, and content you submit (briefs, messages, deliverable links).
    </p>
    <p>
      <strong>Why data is used.</strong> Data is used to provide and improve the service, secure accounts, analyse product usage in
      aggregate, and communicate about the product.
    </p>
    <p>
      <strong>Third parties.</strong> When you enable integrations (for example authentication or analytics), those
      providers process data under their policies. Review of provider documentation is recommended.
    </p>
    <p>
      <strong>Retention.</strong> Information is retained as long as needed for the purposes above and as required by law.
    </p>
    <p>
      <strong>Your choices.</strong> Requests for access, correction, or deletion may be submitted where applicable via the{' '}
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

export default Privacy;
