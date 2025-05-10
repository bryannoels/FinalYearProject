import labaLogo from '../../assets/LabaLogo.png';
import { useState } from 'react';
import './Signup.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const userSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (formData.get('password') !== formData.get('confirmPassword')) {
      setErrorMessage('Passwords do not match');
      setShowErrorMessage(true);
      return;
    }

    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    }
    
    setShowErrorMessage(false);

    try {
      const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.statusCode === 200) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrorMessage(JSON.parse(result.body).message);
        setShowErrorMessage(true);
      }
    } catch (error) {
      setErrorMessage(String(error));
    }
  };

  return (
    <>
    {showSuccessMessage && (
      <div className="success__message">
        <label>Account created successfully!</label><br></br>
        <label>Redirecting to login page...</label>
      </div>
    )}
    <div className="content">
      <a href="/" className="logo-signup"><img src={labaLogo} alt="Laba logo" /></a>
      <div className="container__form">
        <label className="message__welcome">Welcome To LABA!</label>
        <form onSubmit={userSignUp}>
          <div className="container__username">
            <label>Username:</label>
            <input type="text" className="input__textbox" name="username" required />
          </div>
          <div className="container__email">
            <label>Email:</label>
            <input type="email" className="input__textbox" name="email" required />
          </div>
          <div className="container__password">
            <label>Password:</label>
            <input type="password" className="input__textbox" name="password" required />
          </div>
          <div className="container__confirm__password">
            <label>Confirm Password:</label>
            <input type="password" className="input__textbox" name="confirmPassword" required />
          </div>
          <button type="submit" className="button">Sign Up</button>
        </form>
        {showErrorMessage && (
          <div className="error__message">
            {errorMessage}
          </div>
        )}
        <div className="container__redirect">
          <label>Already have an account? <a href="/login">Log In</a></label>
        </div>
      </div>
    </div>
      
    </>
  )
}

export default Signup
