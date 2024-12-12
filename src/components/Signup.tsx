import React, { useState } from 'react';
import { CustomResponse, SignupType } from '../types/user.type';
import { CustomAxios } from '../services/api';
import { useNavigate } from 'react-router';

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const SignupData: SignupType = {
      email: email,
      password: password,
      name: name
    };

    try {
      const response: CustomResponse = await CustomAxios.postSignup(SignupData);
      if (response.success) {
        alert('회원가입 성공!');
      } else {
        setMessage(response.message || '회원가입 실패');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('서버와의 통신에 문제가 발생했습니다.');
    }
  };

  return (
    <div style={{ backgroundColor: '#EDF0F4', height: '100vh' }}>
      <div className="wrap">
        <div className="header" style={{ background: '#625DA3' }}>
          <div className="top" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/">
              <h1 style={{ color: '#fff' }}>VITAL</h1>
            </a>
          </div>
        </div>

        <div className="container">
          <div className="content_wrap" style={{ backgroundColor: '#fff' }}>
            <div className="content">
              <div className="journal sect"></div>

              <div className="col-sm-6 col-sm-offset-3">
                {/* 인증 처리 후 메시지가 있으면 메시지 표시 */}
                {message && <div className="alert alert-danger">{message}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>아이디</label>
                    <input
                      type="text"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>성함</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg">회원가입</button>
                </form>

                <hr />

                <p>이미 계정이 있으신가요? <a href="/login">로그인하기</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
