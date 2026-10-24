import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export const metadata = {
  title: "Terms and Conditions | afficix",
  description: "Review the afficix terms and conditions for publishers and network participation.",
};

export default function TermsOfServicePage() {
  return <LegalDocumentPage sourceFile="terms-of-service.html" eyebrow="Publisher agreement" />;
}
