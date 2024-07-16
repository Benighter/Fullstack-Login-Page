import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#1890ff',
  },
  content: {
    marginTop: '20px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '20px',
    backgroundColor: '#1890ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

function ProtectedPage() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtectedContent = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token in ProtectedPage:', token);
        if (!token) {
          throw new Error('No token found');
        }

        console.log('Attempting to fetch protected content...');
        const response = await axios.get('http://localhost:5000/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Protected content response:', response.data);
        setContent(response.data.message);
      } catch (error) {
        console.error('Error fetching protected content:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        setError('Failed to fetch protected content. Please try logging in again.');
        localStorage.removeItem('token');
      }
    };

    fetchProtectedContent();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
        <button style={styles.button} onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Protected Page</h2>
      <div style={styles.content}>
        {content ? <p>{content}</p> : <p>Loading...</p>}
      </div>
      <button style={styles.button} onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ProtectedPage;