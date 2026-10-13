import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type InformationPageKey = 'help' | 'contact' | 'safety' | 'report' | 'terms' | 'privacy' | 'cookies';

type InformationSection = {
  title: string;
  paragraphs: string[];
  links?: { label: string; href: string }[];
};

const information: Record<InformationPageKey, { eyebrow: string; title: string; intro: string; sections: InformationSection[] }> = {
  help: {
    eyebrow: 'Customer support',
    title: 'Help center',
    intro: 'Find your way around KHMarket and get the most from buying and selling in Cambodia.',
    sections: [
      { title: 'Buying on KHMarket', paragraphs: ['Browse or search listings, review the item details and location, then use the product page to contact the seller. Agree on the price and handover directly with the seller before completing a purchase.'], links: [{ label: 'Browse products', href: '/search' }, { label: 'Browse categories', href: '/categories' }] },
      { title: 'Selling an item', paragraphs: ['Create an account, add a clear description and accurate price, and include current photos. Keep conversations about the listing in KHMarket messages so you can refer back to them.'], links: [{ label: 'Start selling', href: '/sell' }] },
      { title: 'Account access', paragraphs: ['Sign in using your email address or username. If you have trouble accessing your account, use the Contact Us page for next steps.'], links: [{ label: 'Contact us', href: '/contact' }] },
    ],
  },
  contact: {
    eyebrow: 'We are here to help',
    title: 'Contact KHMarket',
    intro: 'Choose the quickest path for your question. KHMarket connects buyers and sellers; it does not handle payments or delivery for listings.',
    sections: [
      { title: 'Questions about an item', paragraphs: ['Open the product listing and use Message seller to ask about availability, condition, pickup, or delivery arrangements.'], links: [{ label: 'Find a listing', href: '/search' }, { label: 'Open messages', href: '/messages' }] },
      { title: 'Account or website issue', paragraphs: ['Describe what happened, include the page you were using, and avoid sending passwords or payment details.'], links: [{ label: 'Report a problem', href: '/report' }, { label: 'Help center', href: '/help' }] },
    ],
  },
  safety: {
    eyebrow: 'Buy and sell with care',
    title: 'Safety tips',
    intro: 'A few practical checks can help make local marketplace transactions safer.',
    sections: [
      { title: 'Meet and inspect', paragraphs: ['Meet in a public place when practical, bring someone with you for high-value items, and inspect the item before paying. Confirm the product, agreed price, and handover details in advance.'] },
      { title: 'Protect your information', paragraphs: ['Never share passwords, one-time codes, or banking credentials. Be cautious of links or requests to pay outside the arrangement you agreed with the seller.'] },
      { title: 'Keep communication clear', paragraphs: ['Use KHMarket messages to discuss listings and retain a record of the agreement. If something feels wrong, pause the transaction and report the concern.'], links: [{ label: 'Report a problem', href: '/report' }] },
    ],
  },
  report: {
    eyebrow: 'Customer support',
    title: 'Report a problem',
    intro: 'Tell us what went wrong so you can take the appropriate next step.',
    sections: [
      { title: 'Problem with a listing or seller', paragraphs: ['Do not send money or personal credentials if you suspect a listing is misleading. Save the listing URL and relevant messages, and stop the transaction while you review the details.'] },
      { title: 'Problem using the website', paragraphs: ['For account access or a technical issue, note the page, what you expected, and what happened. Do not include your password, verification codes, or full payment information.'], links: [{ label: 'Contact us', href: '/contact' }, { label: 'Help center', href: '/help' }] },
      { title: 'Urgent safety concern', paragraphs: ['If you are in immediate danger or believe a crime is taking place, contact the appropriate local authorities. KHMarket is not an emergency service.'] },
    ],
  },
  terms: {
    eyebrow: 'Marketplace information',
    title: 'Terms & conditions',
    intro: 'These terms describe the basic rules for using KHMarket. By using the marketplace, you agree to use it lawfully and responsibly.',
    sections: [
      { title: 'Listings and accounts', paragraphs: ['You are responsible for accurate account details and any listing you create. Do not post illegal, deceptive, unsafe, or infringing content, and do not impersonate another person.'] },
      { title: 'Transactions', paragraphs: ['KHMarket provides a place for users to discover listings and communicate. Buyers and sellers are responsible for verifying items, agreeing on payment and delivery, and completing transactions. KHMarket does not take custody of goods or funds.'] },
      { title: 'Acceptable use', paragraphs: ['Do not attempt to disrupt the service, access another user’s account, or misuse personal information. We may restrict access to accounts or content that violates these rules or applicable law.'] },
    ],
  },
  privacy: {
    eyebrow: 'Marketplace information',
    title: 'Privacy policy',
    intro: 'KHMarket uses information needed to provide marketplace accounts, listings, messages, and optional newsletter updates.',
    sections: [
      { title: 'Information used', paragraphs: ['Account details and listing information are used to operate the marketplace. Messages and transaction-related records support features requested by users. Newsletter email addresses are stored when a person subscribes.'] },
      { title: 'Use and sharing', paragraphs: ['Public listing details are visible to marketplace visitors. Account information is used to provide KHMarket features and is not displayed publicly unless you choose to include it in a listing or profile. We do not sell newsletter addresses.'] },
      { title: 'Your choices', paragraphs: ['You can choose what details to include in listings and whether to subscribe to newsletter updates. Never include passwords, one-time codes, or sensitive financial credentials in public content or messages.'] },
    ],
  },
  cookies: {
    eyebrow: 'Marketplace information',
    title: 'Cookie information',
    intro: 'KHMarket uses a small number of browser cookies and local preferences to make core features work.',
    sections: [
      { title: 'Essential session cookie', paragraphs: ['When you sign in, KHMarket uses an HTTP-only session cookie to recognize your account across requests. It is required for authenticated features and expires automatically.'] },
      { title: 'Local preferences', paragraphs: ['The language selector stores your chosen language preference in this browser. Clearing browser storage removes that preference.'] },
      { title: 'Managing cookies', paragraphs: ['You can clear or block cookies in your browser settings. Blocking the essential session cookie may prevent sign-in and other account features from working.'] },
    ],
  },
};

export function InformationPage({ page }: { page: InformationPageKey }) {
  const content = information[page];

  return (
    <div className="container-shell py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{content.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{content.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{content.intro}</p>
        <div className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
          {content.sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 leading-7 text-slate-600">{paragraph}</p>)}
              {section.links && (
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-teal-700">
                      {link.label}<ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
