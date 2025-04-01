import { useState } from 'react';
import LoginForm from './LoginForm';
import ChatComponent from './ChatComponent';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  return (
    <div className="app-container">
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatComponent currentUser={user} />
      )}
    </div>
  );
}

export default App;
