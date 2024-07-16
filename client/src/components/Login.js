import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const styles = {
  form: {
    maxWidth: '300px',
    margin: '50px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#1890ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: '15px',
    color: '#1890ff',
    textDecoration: 'none',
  },
  title: {
    textAlign: 'center',
    color: '#1890ff',
    marginBottom: '20px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px',
  }
};

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with email:', email);
      const response = await axios.post('http://localhost:5000/login', { email, password });
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      console.log('Token saved to localStorage:', response.data.token);
      setIsAuthenticated(true);
      
      const tokenBeforeRedirect = localStorage.getItem('token');
      console.log('Token just before redirect:', tokenBeforeRedirect);
      
      // Redirect to your portfolio site
      window.location.href = 'https://benighter.github.io/PersonalPortfolio/';
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        setError(`Server error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from the server. Please check your internet connection and try again.');
      } else {
        console.error('Error message:', error.message);
        setError(`An unexpected error occurred: ${error.message}`);
      }
    }
  };

  return (
    <div style={styles.form}>
      <h2 style={styles.title}>Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={styles.input}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      <Link to="/register" style={styles.link}>Don't have an account? Register here</Link>
    </div>
  );
}

export default Login;