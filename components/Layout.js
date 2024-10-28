import Head from 'next/head'
import Link from 'next/link'
import { useTheme } from '../lib/ThemeContext'

export default function Layout({ children }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>PeerSMS Beta1</title>
        <meta name="description" content="Peer-to-peer SMS/MMS survey invitation distribution and communication platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-blue-600 dark:bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">PeerSMS Beta1</h1>
        </div>
      </header>
      <nav className="bg-blue-500 dark:bg-blue-700 text-white py-2">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/">
                <a className="hover:text-blue-200">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/projects">
                <a className="hover:text-blue-200">Projects</a>
              </Link>
            </li>
            <li>
              <Link href="/contacts">
                <a className="hover:text-blue-200">Contacts</a>
              </Link>
            </li>
            <li>
              <Link href="/templates">
                <a className="hover:text-blue-200">Templates</a>
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <a className="hover:text-blue-200">Settings</a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 flex-grow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {children}
      </main>
      <footer className="bg-gray-200 dark:bg-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} PeerSMS Beta1. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
