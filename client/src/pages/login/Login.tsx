import labaLogo from '../../assets/LabaLogo.png';
import { useState, useContext } from 'react';
import './Login.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const userLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      rememberMe: formData.get('rememberMe') === 'on' ? true : false
    };

    try {
      const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.statusCode === 200) {
        login(JSON.parse(result.authToken), formData.get('rememberMe') === 'on' ? true : false);
        navigate('/');
      } else {
        setErrorMessage(JSON.parse(result.body).message);
        setShowErrorMessage(true);
      }
    } catch (error) {
      setErrorMessage(String(error));
      console.error('Error:', error);
    }
  };

  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  return (
    <>
      <div className="content">
        <a href="/" className="logo"><img src={labaLogo} className="logo" alt="Laba logo" /></a>
        <div className="container__form">
          <label className="message__welcome">Welcome Back!</label>
          <form onSubmit={userLogin}>
            <div className="container__email">
              <label>Email:</label>
              <input type="email" className="input__textbox" name="email" required />
            </div>
            <div className="container__password">
              <label>Password:</label>
              <input type="password" className="input__textbox" name="password" required />
            </div>
            <div className="container__remember__forgot">
              <label>
                <input type="checkbox" name="rememberMe" className="checkbox__remember"/>
                Remember Me
              </label>
              <a href="/forgot-password">Forgot Password?</a>
            </div>
            <button type="submit" className="button">Login</button>
          </form>
          {showErrorMessage && (
            <div className="error__message">
              {errorMessage}
            </div>
          )}
          <div className="container__redirect">
            <label>Don't have an account? <a href="/signup">Sign Up</a></label>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
