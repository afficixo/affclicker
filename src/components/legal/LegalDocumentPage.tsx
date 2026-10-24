import { readFileSync } from "node:fs";
import path from "node:path";
import PublicLayout from "@/components/layout/PublicLayout";

const allowedTags = new Set(["a", "br", "em", "h1", "h4", "h5", "li", "p", "strong", "ul"]);

function sanitizeLegalHtml(html: string) {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, rawTag: string, attributes: string) => {
    const tag = rawTag.toLowerCase();
    if (!allowedTags.has(tag)) return "";
    if (match.startsWith("</")) return tag === "br" ? "" : `</${tag}>`;
    if (tag !== "a") return tag === "br" ? "<br>" : `<${tag}>`;

    const hrefMatch = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
    if (!/^(https?:\/\/|mailto:)/i.test(href)) return "<a>";

    const decodedHref = href
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const escapedHref = decodedHref.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return `<a href="${escapedHref}" rel="noopener noreferrer">`;
  });
}

export default function LegalDocumentPage({
  sourceFile,
  eyebrow,
}: {
  sourceFile: "privacy-policy.html" | "terms-of-service.html";
  eyebrow: string;
}) {
  const sourcePath = path.join(process.cwd(), "src", "content", "legal", sourceFile);
  const source = readFileSync(sourcePath, "utf8");
  const headingMatch = source.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i);

  if (!headingMatch) {
    throw new Error(`The legal source file is missing its document heading: ${sourceFile}`);
  }

  const content = sanitizeLegalHtml(source.replace(headingMatch[0], ""));

  return (
    <PublicLayout className="legal-light-theme bg-white">
      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-40px_rgba(38,50,56,0.35)]">
          <header className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-[#f0faed] px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#347d2b]">
              {eyebrow}
            </p>
            <div
              className="legal-document-title mt-3"
              dangerouslySetInnerHTML={{ __html: sanitizeLegalHtml(headingMatch[0]) }}
            />
            <div className="mt-6 h-1 w-12 rounded-full bg-[#5ff442]" aria-hidden="true" />
          </header>
          <div
            className="legal-document-content px-6 py-7 sm:px-10 sm:py-10"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </main>
    </PublicLayout>
  );
}
