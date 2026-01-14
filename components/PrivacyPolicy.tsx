import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8"><strong>Last Updated:</strong> January 13, 2026</p>
        
        <p className="text-gray-600 leading-relaxed mb-12">
          This Privacy Policy explains how <strong>Ningbo Keyang E-Commerce Co., Ltd.</strong> ("we", "us", or "our") 
          handles your personal information when you visit our website{' '}
          <a href="https://www.pockimate.com" className="text-indigo-600 hover:underline">https://www.pockimate.com</a>.
        </p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">We only collect personal information that you voluntarily provide, such as:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Email address (e.g., when you contact us)</li>
              <li>Name and shipping address (only if you place an order)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>We do NOT use cookies for tracking, analytics, or advertising.</strong><br />
              Our site uses only essential cookies (e.g., to maintain your shopping cart), which do not require consent under GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>To process and ship your orders;</li>
              <li>To respond to your customer service inquiries;</li>
              <li>To comply with legal obligations (e.g., tax laws in China).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Sharing of Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-3">
              <li>
                <strong>PayPal:</strong> All payments are processed by PayPal. We never see or store your credit card details. 
                PayPal's privacy policy:{' '}
                <a href="https://www.paypal.com/us/legalhub/privacy-full" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  https://www.paypal.com/us/legalhub/privacy-full
                </a>
              </li>
              <li>
                <strong>Shipping carriers:</strong> We share your name and delivery address with logistics partners 
                (e.g., DHL, FedEx) solely to fulfill your order.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed">
              Your personal data is stored and processed in <strong>China</strong>. If you are located in the European Union 
              or the United Kingdom, please note that China is not recognized as providing an "adequate level of protection" 
              by the European Commission. By using our site, you acknowledge this transfer. We implement appropriate technical 
              and organizational measures to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">We retain your order and contact information for as long as necessary to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Fulfill legal and tax obligations under Chinese law (typically up to 5 years);</li>
              <li>Handle potential returns, refunds, or warranty claims.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Access, correct, or request deletion of your personal data;</li>
              <li>Object to or restrict processing;</li>
              <li>(Under CCPA) Opt out of the "sale" of your data — <strong>note: we do not sell or share your personal information</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. How to Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              To exercise your rights or ask questions about your data, please email us at:<br />
              <a href="mailto:pockimate@gmail.com" className="text-indigo-600 hover:underline">pockimate@gmail.com</a>
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              We will respond within <strong>10 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not knowingly collect personal information from children under the age of 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. The "Last Updated" date above will be revised accordingly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Company Information</h2>
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

export default PrivacyPolicy;
