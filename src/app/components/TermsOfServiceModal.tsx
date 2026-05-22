import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useDarkMode } from '../contexts/DarkModeContext';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  const { darkMode } = useDarkMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl"
        style={{
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
          style={{
            backgroundColor: darkMode ? '#334155' : '#f8fafc',
            borderBottomColor: darkMode ? '#475569' : '#e2e8f0',
          }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Terms of Service
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2"><strong>Last Updated:</strong> March 6, 2026</p>
            <p><strong>Effective Date:</strong> March 6, 2026</p>
          </div>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">1. Acceptance of Terms</h3>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing and using Yacht Exam Trainer (the "Service"), available at blackseabulgaria.com and boatingexamtrainingwebsite.vercel.app, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms constitute a legally binding agreement between you and Yacht Exam Trainer ("we," "us," or "our"), governed by the laws of Bulgaria and the European Union.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">2. Service Description</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yacht Exam Trainer provides online training and practice exams for boating licenses across five categories:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Jet Ski License</li>
              <li>Small Boat License</li>
              <li>Big Boat License</li>
              <li>Yacht License (up to 50 tons)</li>
              <li>Navigation Device License</li>
            </ul>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mt-3">
              <p className="text-yellow-900 dark:text-yellow-200 font-semibold">
                ⚠️ IMPORTANT NOTICE
              </p>
              <p className="text-yellow-800 dark:text-yellow-300 mt-2">
                This Service provides <strong>training materials and practice exams only</strong>. It does NOT provide official certification, licenses, or government-recognized qualifications. You must take and pass the official government examination separately to obtain a valid boating license.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">3. Intellectual Property Rights</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">3.1 Our Rights</h4>
            <p className="text-gray-700 dark:text-gray-300">
              All content on the Service, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Software code, algorithms, and system architecture</li>
              <li>Exam questions, answers, and explanations</li>
              <li>Text, graphics, images, logos, and design elements</li>
              <li>User interface, layout, and navigation structure</li>
              <li>Database structure and organization</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              ...are the exclusive property of Yacht Exam Trainer and protected by:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Bulgarian Law on Copyright and Related Rights (ZAPSP)</li>
              <li>EU Directive 2001/29/EC and EU Directive 2019/790 on Copyright in the Digital Single Market</li>
              <li>International copyright treaties (Berne Convention, WIPO)</li>
              <li>Trade secret and confidential information laws</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              The software, user interface design, testing engine, algorithms, user experience flows, database architecture, and all original content created by Black Sea Bulgaria are protected by copyright under Bulgarian law (ZAPSP) and EU Directive 2019/790. All rights are reserved. You may not reproduce, distribute, modify, reverse-engineer, or create derivative works of any proprietary elements of the platform without express written consent.
            </p>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">3.2 License to Use</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for your personal, non-commercial exam preparation. This license does NOT permit you to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Copy, reproduce, or distribute any exam questions or content</li>
              <li>Reverse engineer, decompile, or disassemble the software</li>
              <li>Create derivative works based on our Service</li>
              <li>Use automated tools (bots, scrapers) to access the Service</li>
              <li>Share your account credentials with others</li>
              <li>Resell, sublicense, or commercially exploit the Service</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">3.3 Copyright Infringement</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Unauthorized use, reproduction, or distribution of our content may result in:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Immediate account termination without refund</li>
              <li>Legal action under Bulgarian and EU copyright law</li>
              <li>Criminal prosecution for copyright infringement (up to 3 years imprisonment under Bulgarian law)</li>
              <li>Civil damages and legal fees</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">4. User Accounts and Security</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">4.1 Account Registration</h4>
            <p className="text-gray-700 dark:text-gray-300">
              You must:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Provide accurate, current, and complete information</li>
              <li>Be at least 16 years old (GDPR minimum age requirement)</li>
              <li>Maintain the security of your password</li>
              <li>Not share your account with others</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">4.2 Account Sharing Prevention</h4>
            <p className="text-gray-700 dark:text-gray-300">
              To prevent unauthorized account sharing and protect our intellectual property:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>When you log in on a new device, all other sessions are automatically logged out</li>
              <li>Only ONE device can access your account at a time</li>
              <li>We monitor for suspicious login patterns</li>
              <li>Accounts found to be shared will be terminated without refund</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">4.3 Account Termination</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to suspend or terminate your account if you:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Violate these Terms</li>
              <li>Share your account credentials</li>
              <li>Use the Service for unlawful purposes</li>
              <li>Engage in fraudulent activity</li>
              <li>Attempt to circumvent security measures</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">5. Subscriptions and Payments</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">5.1 Pricing</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Subscription fees are €5.00 per month per exam category. Prices are subject to change with 30 days' notice.
            </p>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">5.2 Payment Processing</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method on a recurring monthly basis until you cancel.
            </p>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">5.3 Refund Policy</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Under EU Consumer Rights Directive (2011/83/EU) and Bulgarian Consumer Protection Act:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>14-Day Cooling-Off Period:</strong> You may cancel within 14 days of purchase for a full refund</li>
              <li><strong>After 14 Days:</strong> No refunds for unused subscription time</li>
              <li><strong>Digital Content Waiver:</strong> By accessing exam content, you waive your 14-day right of withdrawal</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">5.4 Cancellation</h4>
            <p className="text-gray-700 dark:text-gray-300">
              You may cancel your subscription at any time from your Account page. Access continues until the end of the current billing period.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">6. Exam Content and Testing</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">6.1 Exam Structure</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Each exam contains 40 questions</li>
              <li>Questions have difficulty-based points (1, 2, or 3 points)</li>
              <li>Maximum 6 points can be lost to pass</li>
              <li>60-minute time limit per exam</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">6.2 Mock vs. Paid Exams</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Mock Exams:</strong> Free, use the first 10 questions from our database</li>
              <li><strong>Paid Exams:</strong> Full access to all questions, randomized selection</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">6.3 Study vs. Exam Mode</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Study Mode:</strong> See correct answers immediately for learning</li>
              <li><strong>Exam Mode:</strong> Simulates real exam conditions, results shown at end</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">6.4 No Official Certification</h4>
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-900 dark:text-red-200 font-semibold">
                ⚠️ CRITICAL DISCLAIMER
              </p>
              <p className="text-red-800 dark:text-red-300 mt-2">
                Passing our exams does NOT grant you an official boating license. Our Service is for training purposes only. You MUST take the official government examination administered by Bulgarian Maritime Administration or equivalent authority to obtain a legal boating license.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">7. Limitation of Liability</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">7.1 Service Availability</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We provide the Service "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Uninterrupted or error-free operation</li>
              <li>Accuracy or completeness of content</li>
              <li>That you will pass the official government exam</li>
              <li>Compatibility with all devices or browsers</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">7.2 Limitation of Damages</h4>
            <p className="text-gray-700 dark:text-gray-300">
              To the maximum extent permitted by Bulgarian and EU law, we are NOT liable for:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Loss of data, profits, or business opportunities</li>
              <li>Failure to pass official examinations</li>
              <li>Indirect, incidental, consequential, or punitive damages</li>
              <li>Third-party claims arising from your use of the Service</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Our total liability to you shall not exceed the amount you paid in the 12 months preceding the claim.
            </p>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">7.3 Indemnification</h4>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Your violation of these Terms</li>
              <li>Your violation of third-party rights (including intellectual property)</li>
              <li>Your use or misuse of the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">8. Prohibited Activities</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You may NOT:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Copy, scrape, or download exam questions or content</li>
              <li>Reverse engineer or decompile the Service software</li>
              <li>Use the Service to create competing products</li>
              <li>Share or publish exam questions on external platforms</li>
              <li>Use automated bots or scripts to access the Service</li>
              <li>Attempt to bypass security measures or access controls</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">9. Trade Secrets and Confidentiality</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Our exam questions, algorithms, scoring systems, and business methods constitute trade secrets under Bulgarian Law on Protection of Classified Information and EU Trade Secrets Directive (2016/943). Unauthorized disclosure or use of this information may result in:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Criminal penalties under Bulgarian law</li>
              <li>Civil lawsuits for damages and injunctive relief</li>
              <li>Immediate account termination</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">9a. Exam Question Sources</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Practice exam questions used on this platform are sourced from official examination materials published by the Bulgarian Maritime Administration (Изпълнителна агенция "Морска администрация" — MARAD), a state executive agency of the Republic of Bulgaria. These materials are reused in accordance with:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Article 4 of the Bulgarian Law on Copyright and Related Rights (ZAPSP)</strong>, which exempts official acts and documents of state administrative bodies from copyright protection</li>
              <li><strong>EU Open Data and Public Sector Information Directive (2019/1024)</strong>, as transposed into Bulgarian law, which mandates that public sector information be available for commercial and non-commercial reuse</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              We do not claim ownership of exam question content. Our platform provides the interactive testing engine, study tools, multilingual interface, progress tracking, and educational framework — this is what your subscription covers. <strong>MARAD does not endorse, sponsor, or approve this platform.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">10. Governing Law and Dispute Resolution</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">10.1 Applicable Law</h4>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms are governed by the laws of the Republic of Bulgaria and the European Union, without regard to conflict of law provisions.
            </p>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">10.2 Jurisdiction</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Any disputes shall be resolved exclusively in the courts of Sofia, Bulgaria. EU consumers retain the right to bring proceedings in their country of residence.
            </p>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">10.3 Alternative Dispute Resolution (ODR)</h4>
            <p className="text-gray-700 dark:text-gray-300">
              EU consumers may use the European Commission's Online Dispute Resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">https://ec.europa.eu/consumers/odr</a>
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">11. Changes to Terms</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these Terms at any time. Material changes will be communicated via:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Email notification to registered users</li>
              <li>Prominent notice on the Service</li>
              <li>Updated "Last Updated" date on this page</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Continued use after changes constitutes acceptance. If you disagree, you must stop using the Service and cancel your subscription.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">12. Severability</h3>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">13. Contact Information</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Yacht Exam Trainer</strong><br />
                Email: <a href="mailto:gramatikovbobby@gmail.com" className="text-cyan-600 dark:text-cyan-400 hover:underline">gramatikovbobby@gmail.com</a><br />
                Phone: <a href="tel:+359876610185" className="text-cyan-600 dark:text-cyan-400 hover:underline">+359 87 66 101 85</a><br />
                Website: <a href="https://blackseabulgaria.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">blackseabulgaria.com</a>
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">15. Image Credits &amp; Third-Party Licences</h3>
            <p className="text-gray-700 dark:text-gray-300">
              The hero photograph displayed on our homepage depicts a Bavaria Cruiser 45 sailing yacht and is used under the Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) licence.
            </p>
            <ul className="list-none pl-0 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Photographer:</strong> Justin Leighton</li>
              <li><strong>Original file:</strong> <a href="https://commons.wikimedia.org/wiki/File:Bavaria_Cruiser_45.jpg" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">commons.wikimedia.org/wiki/File:Bavaria_Cruiser_45.jpg</a></li>
              <li><strong>Licence:</strong> <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">Creative Commons Attribution-ShareAlike 3.0 Unported</a></li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              No modification has been made to the original photograph. The CC BY-SA 3.0 licence permits commercial use with attribution. This platform's software, code, and original content remain under separate proprietary copyright (see Section 3).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">14. Entire Agreement</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Yacht Exam Trainer regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              By using Yacht Exam Trainer, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 border-t p-4"
          style={{
            backgroundColor: darkMode ? '#334155' : '#f8fafc',
            borderTopColor: darkMode ? '#475569' : '#e2e8f0',
          }}
        >
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
          >
            I Agree to These Terms
          </Button>
        </div>
      </div>
    </div>
  );
}