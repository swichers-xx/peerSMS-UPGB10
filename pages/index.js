import { useState, useEffect } from 'react'
import Authentication from '../components/Authentication'
import Projects from '../components/Projects'
import Contacts from '../components/Contacts'
import Templates from '../components/Templates'
import Invitations from '../components/Invitations'
import Inbox from '../components/Inbox'
import CannedResponses from '../components/CannedResponses'
import Layout from '../components/Layout'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeComponent, setActiveComponent] = useState('inbox')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case 'inbox':
        return <Inbox />
      case 'projects':
        return <Projects />
      case 'contacts':
        return <Contacts />
      case 'templates':
        return <Templates />
      case 'invitations':
        return <Invitations />
      case 'cannedResponses':
        return <CannedResponses />
      default:
        return <Inbox />
    }
  }

  if (!isAuthenticated) {
    return <Authentication onLogin={handleLogin} />
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-100 p-4">
          <nav className="space-y-2">
            {['inbox', 'projects', 'contacts', 'templates', 'invitations', 'cannedResponses'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveComponent(item)}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeComponent === item
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-200'
                }`}
              >
                {item === 'cannedResponses' ? 'Canned Responses' : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </aside>
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4 capitalize">
            {activeComponent === 'cannedResponses' ? 'Canned Responses' : activeComponent}
          </h1>
          {renderComponent()}
        </main>
      </div>
    </Layout>
  )
}
