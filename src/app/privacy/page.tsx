import Link from "next/link";
import { ChefHatIcon } from "lucide-react";
import Header from "../../components/Header";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Last updated: September 8, 2024
          </p>
        </div>

        <div className="mt-12 prose prose-lg prose-red max-w-none">
          <h2>Introduction</h2>
          <p>
            Welcome to Pepper's Pantry ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our SMS-based meal planning service.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>When you use our SMS service, we collect:</p>
          <ul>
            <li><strong>Phone Number:</strong> Your phone number to send and receive SMS messages</li>
            <li><strong>Message Content:</strong> The text messages you send to us, including your meal preferences, dietary restrictions, and requests</li>
            <li><strong>User Preferences:</strong> Information about your dietary preferences, budget, cooking time constraints, and food allergies</li>
          </ul>

          <h3>Usage Information</h3>
          <p>We automatically collect certain information when you use our service:</p>
          <ul>
            <li><strong>Service Usage:</strong> How you interact with our SMS service, including frequency of use and types of requests</li>
            <li><strong>Technical Data:</strong> Information about your device and network connection for service delivery</li>
            <li><strong>Response Data:</strong> Records of our SMS responses to improve our service quality</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide personalized meal plans and recipe recommendations</li>
            <li>Generate shopping lists based on your meal plans</li>
            <li>Remember your dietary preferences and restrictions</li>
            <li>Improve our recipe database and recommendation algorithms</li>
            <li>Respond to your requests and provide customer support</li>
            <li>Ensure the security and proper functioning of our service</li>
            <li>Comply with legal obligations and resolve disputes</li>
          </ul>

          <h2>Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> With third-party service providers who help us operate our service (such as Twilio for SMS delivery and AWS for hosting)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of our users or others</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. We may retain certain information for longer periods as required by law or for legitimate business purposes.
          </p>

          <h2>Your Rights and Choices</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Opt-out:</strong> Stop receiving SMS messages by texting "STOP"</li>
            <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
          </ul>

          <h2>SMS Specific Terms</h2>
          
          <h3>Consent</h3>
          <p>
            By texting our service, you consent to receive SMS messages from Pepper's Pantry. Message and data rates may apply.
          </p>

          <h3>Opt-out</h3>
          <p>
            You can opt out of receiving SMS messages at any time by texting "STOP" to our service number. You will receive a confirmation message that you have been unsubscribed.
          </p>

          <h3>Message Frequency</h3>
          <p>
            We will only send SMS messages in response to your requests. We do not send unsolicited promotional messages.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted in accordance with applicable data protection laws.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p><strong>Email:</strong> privacy@pepperspantry.com</p>
            <p><strong>Mail:</strong> Pepper's Pantry Privacy Team<br />
            [Your Business Address]<br />
            [City, State, ZIP Code]</p>
          </div>

          <h2>Specific State Privacy Rights</h2>
          
          <h3>California Residents (CCPA)</h3>
          <p>
            California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information.
          </p>

          <h3>European Residents (GDPR)</h3>
          <p>
            If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, and to object to processing.
          </p>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Note:</strong> This privacy policy template should be reviewed by a legal professional and customized for your specific business needs and jurisdiction requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}