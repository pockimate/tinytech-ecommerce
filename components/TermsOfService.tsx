import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8"><strong>Last Updated:</strong> January 13, 2026</p>
        
        <p className="text-gray-600 leading-relaxed mb-12">
          These Terms of Service ("Terms") govern your use of the website{' '}
          <a href="https://www.pockimate.com" className="text-indigo-600 hover:underline">https://www.pockimate.com</a>{' '}
          (the "Site") operated by <strong>Ningbo Keyang E-Commerce Co., Ltd.</strong> ("we", "us", or "our"). 
          By placing an order, you agree to these Terms.
        </p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Account Registration</h2>
            <p className="text-gray-600 leading-relaxed">
              You may browse our Site without an account. To place an order, you must provide accurate contact and shipping information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Orders and Payments</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All orders are subject to availability and our acceptance.</li>
              <li>We accept payments exclusively through <strong>PayPal</strong>.</li>
              <li>Prices are listed in USD and are subject to change without notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We ship worldwide via third-party carriers (e.g., DHL, FedEx).</li>
              <li>Delivery times are estimates and not guaranteed.</li>
              <li>Risk of loss passes to you upon delivery to the carrier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on this Site (logos, text, images) is owned by or licensed to us and protected by copyright laws. 
              You may not reproduce or resell any part of this Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">To the fullest extent permitted by law, we are not liable for:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Indirect, incidental, or consequential damages;</li>
              <li>Delays or failures caused by events beyond our reasonable control (e.g., natural disasters, customs delays).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the People's Republic of China. Any disputes shall be resolved 
              in the competent courts of Ningbo, Zhejiang Province.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to These Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms periodically. Continued use of the Site after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              Questions about these Terms? Email us at:<br />
              <a href="mailto:pockimate@gmail.com" className="text-indigo-600 hover:underline">pockimate@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Company Information</h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Ningbo Keyang E-Commerce Co., Ltd.</strong><br />
              Room 9-5, Building 12, Lanyue Yuan, Century City,<br />
              Qianwan New Area, Ningbo, Zhejiang Province<br />
              (P.O. Box 351, Lingdu Business Secretarial Service), China
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
