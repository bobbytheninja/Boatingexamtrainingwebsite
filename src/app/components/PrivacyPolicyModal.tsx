import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useDarkMode } from '../contexts/DarkModeContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
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
            Privacy Policy
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">1. Introduction</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yacht Exam Trainer ("we," "us," or "our") operates the website accessible at blackseabulgaria.com and boatingexamtrainingwebsite.vercel.app (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service, in compliance with the EU General Data Protection Regulation (GDPR) and Bulgarian Law on Personal Data Protection.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Data Controller:</strong> Yacht Exam Trainer<br />
              <strong>Contact:</strong> bobby_rocks@me.com<br />
              <strong>Phone:</strong> +350 87 66 101 85
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">2. Information We Collect</h3>
            
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">2.1 Personal Data</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We collect the following personal information:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
              <li><strong>Payment Information:</strong> Payment card details processed securely through Stripe (we do not store full card numbers)</li>
              <li><strong>Subscription Data:</strong> Exam categories purchased, subscription dates, expiration dates</li>
              <li><strong>Contact Information:</strong> Email, phone number, message content when you contact us</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">2.2 Usage Data</h4>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Exam performance and scores</li>
              <li>Questions answered and study progress</li>
              <li>Login dates and times</li>
              <li>IP address, browser type, device information</li>
              <li>Session duration and page navigation</li>
            </ul>

            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4">2.3 Cookies and Tracking</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We use essential cookies for authentication and session management. We do not use third-party advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">3. Legal Basis for Processing (GDPR)</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We process your personal data under the following legal bases:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Contract Performance:</strong> Processing necessary to provide the exam training service you purchased</li>
              <li><strong>Legitimate Interest:</strong> Improving our services, preventing fraud, ensuring platform security</li>
              <li><strong>Legal Obligation:</strong> Compliance with EU and Bulgarian tax and accounting laws</li>
              <li><strong>Consent:</strong> For marketing communications (you may withdraw consent at any time)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">4. How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Provide access to exam training materials and track your progress</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related notifications (password resets, subscription renewals)</li>
              <li>Respond to customer support inquiries</li>
              <li>Improve and optimize our Service</li>
              <li>Detect and prevent fraud, abuse, or security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">5. Data Sharing and Disclosure</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We do not sell your personal data. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Service Providers:</strong> Stripe (payment processing), Supabase (data hosting), Vercel (hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of our business</li>
              <li><strong>Your Consent:</strong> With your explicit consent for other purposes</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              <strong>Third-Party Service Providers:</strong> All third-party processors are GDPR-compliant and have data processing agreements in place.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">6. International Data Transfers</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your data may be transferred to and processed in countries outside the European Economic Area (EEA). We ensure adequate safeguards through:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>EU Standard Contractual Clauses with service providers</li>
              <li>Providers certified under EU-U.S. Data Privacy Framework</li>
              <li>Adequate data protection measures as required by GDPR Article 46</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">7. Your GDPR Rights</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Under GDPR and Bulgarian law, you have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your data</li>
              <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (for consent-based processing)</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with the Bulgarian Commission for Personal Data Protection (CPDP)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              To exercise these rights, contact us at: <a href="mailto:bobby_rocks@me.com" className="text-cyan-600 dark:text-cyan-400 hover:underline">bobby_rocks@me.com</a>
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">8. Data Retention</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We retain your personal data only as long as necessary:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
              <li><strong>Payment Records:</strong> 7 years (Bulgarian accounting law requirement)</li>
              <li><strong>Exam Progress:</strong> While your account is active, or until you request deletion</li>
              <li><strong>Communication Logs:</strong> 3 years for support and legal purposes</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">9. Data Security</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted password storage using bcrypt hashing</li>
              <li>Secure authentication with session management</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls limiting employee access to personal data</li>
              <li>Automatic logout of concurrent sessions to prevent account sharing</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Despite our efforts, no system is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">10. Children's Privacy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Our Service is not intended for individuals under 16 years of age. We do not knowingly collect personal data from children under 16. If you believe we have collected data from a child, contact us immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">11. Changes to This Privacy Policy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy periodically. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Posting the updated policy on this page with a new "Last Updated" date</li>
              <li>Sending an email notification to registered users (for significant changes)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">12. Contact Information</h3>
            <p className="text-gray-700 dark:text-gray-300">
              For privacy-related questions or to exercise your rights:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-3">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Yacht Exam Trainer</strong><br />
                Email: <a href="mailto:bobby_rocks@me.com" className="text-cyan-600 dark:text-cyan-400 hover:underline">bobby_rocks@me.com</a><br />
                Phone: <a href="tel:+35087661018" className="text-cyan-600 dark:text-cyan-400 hover:underline">+350 87 66 101 85</a>
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              <strong>Supervisory Authority (Bulgaria):</strong><br />
              Commission for Personal Data Protection (CPDP)<br />
              Address: 2 Prof. Tsvetan Lazarov Blvd., Sofia 1592, Bulgaria<br />
              Website: <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">www.cpdp.bg</a>
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">13. Cookie Policy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We use the following types of cookies:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>Strictly Necessary Cookies:</strong> Essential for authentication and security (cannot be disabled)</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences (dark mode, language selection)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              You can control cookies through your browser settings, but disabling essential cookies may prevent access to the Service.
            </p>
          </section>
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
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}