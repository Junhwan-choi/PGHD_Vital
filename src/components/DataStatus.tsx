import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/DataStatus.css';
import { CustomAxios } from '../services/api';
import { useRecoilState } from 'recoil';
import { brandSave, filecreatetimeSave, preprocessStatusState, tokenSave } from '../atoms';
import axios from 'axios';
import { saveemail } from '../atoms';
import { API_BASE_URL } from '../services/apiConfig';
const DataStatus: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ category: string; status: string }[]>([]);
    const [filecreatetime, setFilecreatetime] = useRecoilState(filecreatetimeSave);
    const [brand, setBrand] = useRecoilState(brandSave);
    const location = useLocation();
    const [token, setToken] = useRecoilState(tokenSave);
    const [isPreprocessingComplete, setIsPreprocessingComplete] = useState(false); // 전처리 완료 상태
    const [preprocessStatus, setPreprocessStatus] = useRecoilState(preprocessStatusState);

    const [loginemail, setLoginEmail] = useRecoilState(saveemail);


    useEffect(() => {
        const savedEmail = localStorage.getItem('saveemail'); // localStorage에서 이메일 가져오기
        if (savedEmail) {
            setLoginEmail(savedEmail); // Recoil 상태 업데이트
            handleFileStatus();
        }
    }, []);


    const handleFileStatus = async () => {
        try {
            setLoading(true); // 로딩 시작
            const response: Blob = await CustomAxios.postFileStatus(loginemail, filecreatetime, brand);
            const replaceresponse = response + "";

            const rows = replaceresponse.split('\n').slice(1); // 첫 번째 줄(헤더)을 제외
            const newData = rows.map(row => {
                const [index, category, status] = row.split(',');
                return { category, status };
            }).filter(row => row.category && row.status);



            setData(newData);
            console.log("상태: ", newData);
        } catch (error) {
            console.error("오류 발생:", error);
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    const handleDownload = async () => {
        try {
            setLoading(true); // 로딩 시작
            const response: Blob = await CustomAxios.postDownloadcsvfile(loginemail, filecreatetime, brand);
            const blob = new Blob([response], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'integrated_' + brand + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            console.log("파일 다운로드 완료");
        } catch (error) {
            console.error("파일 다운로드 중 오류 발생:", error);
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    const handlePreprocessingClick = async () => {
        const formData = new FormData();
        formData.append('manufacturer', brand);
        formData.append('filecreatetime', filecreatetime);
        formData.append('email', loginemail);

        try {
            setLoading(true); // 로딩 시작
            const response = await axios.post(API_BASE_URL + '/api/second/preprocess', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("Response:", response.data);
            setIsPreprocessingComplete(true); // 전처리 완료 상태 업데이트
        } catch (error) {
            console.error("Error during preprocessing:", error);
        } finally {
            setPreprocessStatus("secondcompleted");
            setLoading(false); // 로딩 종료
        }
    };

    return (
        <div className="main-content">
            <button className="btn btn-secondary" onClick={() => setPreprocessStatus("")}>←</button>
            {loading ? (
                <div className="loading-spinner-container" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',  // 화면의 정확한 중앙에 위치하도록 변환
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 10000
                }}>
                    <div className="loading-spinner" style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#007bff' }}></i>
                        <p style={{ color: '#fff', marginLeft: '10px' }}>전처리 작업 중입니다... 잠시만 기다려주세요</p>
                    </div>
                </div>

            ) : (
                <div className="container">
                    <h3 className="journal_title">데이터 항목 현황</h3>
                    <p style={{ marginLeft: '20px' }}>
                        각 카테고리별 분석 가능한 데이터 항목의 현황입니다. 데이터 항목에 해당하는 성공적으로 업로드되었을 경우에 'upload success'를 표시합니다. 만약 업로드를 실패했을 경우에 'upload fail', 해당하는 데이터가 원본 데이터에 없을 경우 No data를 표시합니다. 아래 현황을 확인한 후 전처리를 진행하길 원한다면,
                        '전처리 실행'을 누르십시오.
                    </p>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>현황</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.category}</td>
                                    <td>{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <span style={{ display: 'flex', justifyContent: 'center' }}>
                        <button id="preprocessingButton" className="btn btn-primary" data-toggle="tooltip" title="데이터 항목의 값을 표준화된 형태로 변환 후 하나의 파일로 병합합니다." onClick={handlePreprocessingClick}>
                            전처리 실행
                        </button>
                    </span>
                    {isPreprocessingComplete && ( // 전처리가 완료된 경우에만 파일 다운로드 버튼 보이기
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: "20px" }}>
                            <button id="downloadButton" className="btn btn-primary" data-toggle="tooltip" title="데이터 항목의 값을 표준화된 형태로 변환 후 하나의 파일로 병합합니다." onClick={handleDownload}>
                                파일 다운로드
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataStatus;
