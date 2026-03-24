import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-600 text-sm">
              A modern content management system built with Next.js 15.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/category" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Social</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-600 text-sm">
              Have questions? Contact us at{' '}
              <a
                href="mailto:contact@example.com"
                className="text-primary-500 hover:underline"
              >
                contact@example.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2024 CMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
