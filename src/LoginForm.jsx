import { useState } from 'react';
import { CometChat } from '@cometchat-pro/chat';
import './LoginForm.css'; // Assuming you have a CSS file for styling
// import './App.css'; // Assuming you have a CSS file for global styles
// import './index.css'; // Assuming you have a CSS file for global styles

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const appID = '272433816f44727d';
      const region = 'in';
      const authKey = 'de322f213198024ede1c6f9bc07d9381f5cb9eca';

      // Initialize CometChat
      const appSettings = new CometChat.AppSettingsBuilder()
        .subscribePresenceForAllUsers()
        .setRegion(region)
        .build();

      await CometChat.init(appID, appSettings);

      // Create a unique UID from email
      const uid = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

      if (isSignup) {
        // Create new user
        const user = new CometChat.User(uid);
        user.setName(email.split('@')[0]); // Use part before @ as display name
        
        try {
          await CometChat.createUser(user, authKey);
          console.log('User created successfully');
        } catch (error) {
          if (error.code !== 'ERR_UID_ALREADY_EXISTS') {
            throw error;
          }
          // If user exists, continue to login
        }
      }

      // Login
      const user = await CometChat.login(uid, authKey);
      console.log('Login successful:', user);
      onLogin(user);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail"
              required
              pattern=".+\+test@.+"
              title="Please include '+test' in your email (e.g., youremail+test@gmail.com)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>
        <p className="toggle-form">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            className="link-button"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
