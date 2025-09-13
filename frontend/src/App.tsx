import { useState } from 'react';
import { type User } from './types';

import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PostsPage from './components/PostsPage';
import CreatePostPage from './components/CreatePostPage';
import AdminPage from './components/AdminPage';
import Footer from './components/Footer';

export default function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const fakeToken = `fake-jwt-token-for-${user.id}`;
    setToken(fakeToken);
    setPage('posts');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setPage('home');

    // TODO: JWT Token 
    token;
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'posts':
        return <PostsPage onNavigate={setPage} />;
      case 'create':
        return (
          <CreatePostPage 
            currentUser={currentUser} 
            onPostCreated={() => setPage('posts')} 
          />
        );
      case 'admin':
        return <AdminPage currentUser={currentUser} />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 flex flex-col">
      <Navbar user={currentUser} onNavigate={setPage} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}