import { useState, useEffect } from 'react';
import { CometChat } from '@cometchat-pro/chat';

function ChatComponent({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const limit = 30;
        const usersRequest = new CometChat.UsersRequestBuilder()
          .setLimit(limit)
          .build();

        const fetchedUsers = await usersRequest.fetchNext();
        const otherUsers = fetchedUsers.filter(user => 
          user.uid !== currentUser.uid
        );
        setUsers(otherUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      }
    };

    fetchUsers();
  }, [currentUser.uid]);

  // Message listener
  useEffect(() => {
    const listenerId = "CHAT_LISTENER_" + currentUser.uid;
    
    CometChat.addMessageListener(
      listenerId,
      new CometChat.MessageListener({
        onTextMessageReceived: message => {
          console.log("Message received:", message);
          // Add message if it's part of the current conversation
          if (selectedUser && 
              ((message.sender.uid === selectedUser.uid && message.receiver.uid === currentUser.uid) ||
               (message.sender.uid === currentUser.uid && message.receiver.uid === selectedUser.uid))) {
            setMessages(prev => [...prev, message]);
          }
        }
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerId);
    };
  }, [currentUser.uid, selectedUser]);

  // Fetch conversation history
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const messagesRequest = new CometChat.MessagesRequestBuilder()
            .setUID(selectedUser.uid)
            .setLimit(100)
            .hideMessagesFromBlockedUsers(true)
            .build();

          const messages = await messagesRequest.fetchPrevious();
          
          if (!messages) {
            throw new Error('No messages returned from the API');
          }

          setMessages(messages);
          setError(null);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError(`Failed to fetch messages: ${error.message || 'Unknown error'}`);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser) return;

    try {
      const textMessage = new CometChat.TextMessage(
        selectedUser.uid,
        inputMessage.trim(),
        CometChat.RECEIVER_TYPE.USER
      );

      const sentMessage = await CometChat.sendMessage(textMessage);
      console.log("Message sent successfully:", sentMessage);
      setMessages(prev => [...prev, sentMessage]);
      setInputMessage('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="chat-container">
      <div className="users-list">
        <h3>Available Users</h3>
        <div className="users-container">
          {users.length === 0 ? (
            <div className="no-users">No users available</div>
          ) : (
            users.map(user => (
              <div
                key={user.uid}
                className={`user-item ${selectedUser?.uid === user.uid ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-name">{user.name || user.uid}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="chat-content">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>Chat with {selectedUser.name || selectedUser.uid}</h2>
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="messages">
              {messages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`message ${message.sender?.uid === currentUser.uid ? 'sent' : 'received'}`}
                >
                  <p>{message.text}</p>
                  <small className="message-time">
                    {new Date(message.sentAt * 1000).toLocaleTimeString()}
                  </small>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="message-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a user to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatComponent;
