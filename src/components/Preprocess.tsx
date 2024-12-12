import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/Preprocess.css';
import { CustomAxios } from '../services/api';
import DownloadIcon from '@mui/icons-material/Download';
import ReactPaginate from 'react-paginate';
import { CustomResponse } from '../types/user.type';
import { useRecoilState } from 'recoil';
import { brandSave, preprocessStatusState, tokenSave, filecreatetimeSave } from '../atoms';
import { saveemail } from '../atoms';
import Pagination from '@mui/material/Pagination';
const LoadingSpinner: React.FC = () => (
<div className="loading-spinner-container" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'fixed', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    width: '100%', 
    height: '100%', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    zIndex: 10000 
}}>
    <div className="loading-spinner" style={{ display: 'flex', alignItems: 'center' }}>
        <i className="fa fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#007bff' }}></i>
        <p style={{ color: '#fff', marginLeft: '10px' }}>로딩 중입니다...</p>
    </div>
</div>

);

const Preprocess: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useRecoilState(tokenSave);
    const [preprocessStatus, setPreprocessStatus] = useRecoilState(preprocessStatusState);
    const [filecreatetime, setFilecreatetime] = useRecoilState(filecreatetimeSave);
    const [brand, setBrand] = useRecoilState(brandSave);
    const [data, setData] = useState<{ id: number; date: string; fileName: string }[]>([]);
    const [loginemail, setLoginEmail] = useRecoilState(saveemail);
    const [fileSelected, setFileSelected] = useState(false); // 파일 선택 상태 추가
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null); // 선택한 파일 이름 상태 추가

    useEffect(() => {
        const savedEmail = localStorage.getItem('saveemail'); 
        if (savedEmail) {
            setLoginEmail(savedEmail); 
            handleFileHistory();
        }
    }, []);
    const handleFileHistory = async () => {
        try {
            const response = await CustomAxios.postFileHistory(loginemail);
            if (response instanceof Blob) {
                const textResponse = await response.text();
                parseData(textResponse);
            } else if (typeof response === 'string') {
                parseData(response);
            } else {
                console.error("응답이 예상하지 않은 형식입니다:", response);
            }
        } catch (error) {
            console.error("오류 발생:", error);
        }
    };

    const parseData = (textResponse: string) => {
        const rows = textResponse.split('\n');
        const parsedData = rows.map((row) => {
            if (!row.trim()) return null; 
            const columns = row.split(',');
            if (columns.length < 3) return null; // 필요한 열이 부족하면 무시
            const [id, date, fileName] = columns.map(item => item.trim()); // 각 항목을 트림
            return { id: Number(id), date, fileName };
        }).filter((item): item is { id: number; date: string; fileName: string } => item !== null);

        setData(parsedData); 
    };
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const formattedDate = getCurrentFormattedDate();
        const formData = new FormData(event.currentTarget);

        const manufacturers = formData.getAll('manufacturer');
        setBrand(manufacturers + "");
        const files = formData.getAll('doc');
        if (!files.length || (files.length === 1 && files[0] instanceof File && !files[0].name)) {
            alert('파일을 선택해주세요.'); 
            setLoading(false);
            return;
        } else {
            setFileSelected(true)
        }

        const filecreatetime = formattedDate;
        formData.append('filecreatetime', filecreatetime);

        setFilecreatetime(filecreatetime);

        formData.append('email', loginemail);
        try {
            const response: CustomResponse = await CustomAxios.postFirstPreprocess(formData, token);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setPreprocessStatus("firstcompleted");
        }
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFileName(files[0].name); // 선택한 파일 이름 설정
            setFileSelected(true); // 파일 선택 상태를 true로 변경
        } else {
            setSelectedFileName(null); // 파일이 선택되지 않은 경우
            setFileSelected(false); // 파일 선택 상태를 false로 변경
        }
    };

    const getCurrentFormattedDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    };
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    return (
        <main className="main-content">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <section className="content_wrap">
                        <h3 className="upload-history-title">업로드 이력</h3>
                        <table className="upload-history-table">
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>일시</th>
                                    <th>파일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={`${item.id}-${index}`}>
                                        {/* 순서 계산: (현재 페이지 - 1) * 페이지당 항목 수 + 현재 항목의 인덱스 + 1 */}
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{item.date}</td>
                                        <td>
                                            <a href={`/path/to/your/${item.fileName}`} download>
                                                <DownloadIcon style={{ width: '20px', verticalAlign: 'middle' }} />
                                                {item.fileName}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Pagination
                                count={Math.ceil(data.length / itemsPerPage)} // 총 페이지 수
                                page={currentPage} // 현재 페이지
                                onChange={handlePageChange} // 페이지 변경 핸들러
                                color="primary" // 기본 색상
                                shape="rounded" // 모서리 모양
                                variant="outlined" // 테두리 스타일
                                size="large" // 크기
                            />
                        </div>

                    </section>

                    <section className="content_wrap">
                        <div className="form-wrap">
                            <h3 className="journal_title">원본 데이터 파일 업로드</h3>
                            <form onSubmit={handleFormSubmit} encType="multipart/form-data">
                                <p>1. 제조사 선택</p>
                                <div className="manufacturer-options">
                                    <label><input type="radio" name="manufacturer" value="apple" defaultChecked />Apple</label>
                                    <label><input type="radio" name="manufacturer" value="fitbit" />Fitbit</label>
                                    <label><input type="radio" name="manufacturer" value="galaxy" />Galaxy</label>
                                    <label><input type="radio" name="manufacturer" value="xiaomi" />Xiaomi</label>
                                </div>
                                <a></a>
                                <div style={{marginTop:"35px"}}>
                                    2. 원본 데이터 파일 첨부
                                </div>
                                <div className='upload-box'>
                                    <div className="upload-button">
                                        <input type="file" name="doc" onChange={handleFileChange} />

                                    </div>
                                    {fileSelected ? (
                                        <p className="no-files-message">{selectedFileName}<i className="fas fa-paperclip clip-icon"></i>   </p> // 선택한 파일 이름 출력
                                    ) : (
                                        <p className="no-files-message">
                                            클릭하여 파일 업로드를 진행해주세요.
                                            <i className="fas fa-paperclip clip-icon"></i> {/* 클립 아이콘 추가 */}
                                        </p>
                                    )}
                                </div>
                                <a className="warning-message">※ 사생활 침해가 우려되는 민감정보를 업로드하지 마십시오.</a>

                                <div className="info-box">
                                    <p>※ 업로드 유의사항</p>
                                    <p>1. 각 제조사에서 원본을 내려받은 후 파일을 업로드하십시오. 파일의 이름은 조건에 포함되지 않으니 자유롭게 작성하길 바랍니다.
                                        <br />ㆍapple: 'export_cda'라고 명시된 xml 파일
                                        <br />ㆍgalaxy: 원본 형식을 유지한 zip 파일
                                        <br />ㆍfitbit: 원본 형식을 유지한 zip 파일
                                        <br />ㆍxiaomi: 비밀번호를 해제한 zip 파일
                                        <br />
                                        <br />2. 파일의 크기가 네트워크 환경에 따라 업로드 후 길게는 3분 이상의 처리 시간이 소요됩니다. 되도록 1GB넘지 않는 파일을 추천합니다.</p>
                                </div>
                                <button type="submit" className="submit-button">제출하기</button>
                            </form>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default Preprocess;
