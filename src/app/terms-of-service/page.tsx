import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export const metadata = {
  title: "Terms and Conditions | affclicker",
  description: "Review the affclicker terms and conditions for publishers and network participation.",
};

export default function TermsOfServicePage() {
  return <LegalDocumentPage sourceFile="terms-of-service.html" eyebrow="Publisher agreement" />;
}
