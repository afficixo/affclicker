import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export const metadata = {
  title: "Privacy Policy | afficix",
  description: "Read the afficix privacy policy for information about personal data and privacy.",
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage sourceFile="privacy-policy.html" eyebrow="Privacy & data protection" />;
}
