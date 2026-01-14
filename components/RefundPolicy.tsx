import React from 'react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-8">Refund Policy</h1>
        <p className="text-gray-500 mb-12"><strong>Last Updated:</strong> January 13, 2026</p>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Return Window</h2>
            <p className="text-gray-600 leading-relaxed">
              We accept returns within <strong>15 days from the date you receive your order</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility Requirements</h2>
            <p className="text-gray-600 leading-relaxed">To be eligible for a return, your item must be:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Unused, undamaged, and in its original condition;</li>
              <li>In the original packaging with all tags attached;</li>
              <li>Accompanied by your order number or proof of purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Non-Returnable Items</h2>
            <p className="text-gray-600 leading-relaxed">For hygiene and safety reasons, the following items cannot be returned:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Underwear, swimwear, or intimate apparel;</li>
              <li>Personal care products (e.g., earbuds, face masks);</li>
              <li>Items marked as "final sale" or "clearance".</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How to Request a Return</h2>
            <p className="text-gray-600 leading-relaxed">
              Email us at{' '}
              <a href="mailto:pockimate@gmail.com" className="text-indigo-600 hover:underline">pockimate@gmail.com</a>{' '}
              with your order number and reason for return. We will provide return instructions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Process</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Once we receive and inspect your return, we will notify you of approval.</li>
              <li>Approved refunds will be issued to your original payment method via <strong>PayPal</strong> within <strong>5 business days</strong>.</li>
              <li>Original shipping fees are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Special Notice for EU/UK Customers</h2>
            <p className="text-gray-600 leading-relaxed">
              If you are in the European Union or United Kingdom, you have a legal right to withdraw from your purchase 
              within <strong>14 days of receiving the goods</strong>, without giving any reason. In such cases:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>No restocking fee will be charged;</li>
              <li>You are responsible for the cost of return shipping;</li>
              <li>We will refund the full purchase price (including standard shipping) within 14 days of receiving the returned item.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              Questions? Email us at{' '}
              <a href="mailto:pockimate@gmail.com" className="text-indigo-600 hover:underline">pockimate@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
