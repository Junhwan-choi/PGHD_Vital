import React, { useState } from 'react';
import { CustomResponse, LoginType } from '../types/user.type';
import { CustomAxios } from '../services/api';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import { saveemail } from '../atoms';
import { useRecoilState } from 'recoil';
import '../styles/Login.css'; // CSS 파일 import
const Login: React.FC = () => {
  const [loginId, setLoginId] = useState<string>(''); // Change from email to loginId
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loginemail, setLoginEmail] = useRecoilState(saveemail);
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginData: LoginType = { loginId, password }; // Change email to loginId

    try {
      const response: CustomResponse = await CustomAxios.postLogin(loginData);
      if (response.success) {
        alert('로그인 성공!');
        setLoginEmail(loginId); // Change from email to loginId
        localStorage.setItem('saveemail', loginId); // Change from email to loginId

        const cookies = new Cookies();
        cookies.set('access_token', response.data, { path: '/' });
        localStorage.setItem('token', response.data + "");
        navigate('/home', { state: { token: response.data } });
      } else {
        setMessage(response.message || '로그인 실패');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('잘못된 계정입니다.');
    }
  };

  return (
    <div className="login-page">

        <div className="container">
          <div className="content_wrap">
            <div className="content">
              <div className="col-sm-6 col-sm-offset-3">
                {message && <div className="error">{message}</div>}
                <form onSubmit={handleSubmit} className="form">
                  <div className="log_info">
                    <div className="input-group">
                      <label>ID</label> {/* Change label from 'Email' to 'ID' */}
                      <input
                        type="text"
                        className="input"
                        value={loginId} // Change from email to loginId
                        onChange={(e) => setLoginId(e.target.value)} // Change from email to loginId
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>PW</label>
                      <input
                        type="password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="button">로그인</button>
                  <button type="button" className="button signup-button" onClick={handleSignUp}>회원가입</button>
                </form>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Login;
