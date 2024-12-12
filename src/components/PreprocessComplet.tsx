import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/PreprocessComplet.css';
import DownloadIcon from '@mui/icons-material/Download';
import { useRecoilState } from 'recoil';
import { preprocessStatusState, filecreatetimeSave, saveemail, brandSave, savelastdata, saverowlastdata } from '../atoms';
import { CustomAxios } from '../services/api';
import { Pagination } from 'react-bootstrap';

const PreprocessComplet: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [preprocessStatus, setPreprocessStatus] = useRecoilState(preprocessStatusState);
    const [filecreatetime, setFilecreatetime] = useRecoilState(filecreatetimeSave);
    const [loginemail, setLoginEmail] = useRecoilState(saveemail);
    const [brand, setBrand] = useRecoilState(brandSave);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
    const itemsPerPage = 50; // 페이지당 항목 수
    const [lastdata, setLastdata] = useRecoilState(savelastdata);
    const [rowlastdata, setRowLastdata] = useRecoilState(saverowlastdata);

    useEffect(() => {
        if (loginemail != null) {
            handleTabledata();
        }
    }, [loginemail]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const handleTabledata = async () => {
        try {
            const response = await CustomAxios.postDownloadcsvfile(loginemail, filecreatetime, brand);
            const blob = response instanceof Blob ? response : new Blob([JSON.stringify(response)], { type: 'application/json' });

            const text = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsText(blob);
            });

            const lines = text.trim().split('\\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

            const filteredData = data.map(row => {
                return {
                    start_time: row[0],
                    end_time: row[1],
                    HR: row[2] ? Number(row[2]) : 0,
                    activity_steps: row[3] ? Number(row[3]) : 0,
                    activity_duration: row[4] ? Number(row[4]) : 0,
                    exercise_steps: row[5] ? Number(row[5]) : 0,
                    exercise_duration: row[6] ? Number(row[6]) : 0,
                    oxygen_saturation: row[7] ? Number(row[7]) : 0,
                    total_sleep_duration: row[8] ? Number(row[8]) : 0,
                    awake_duration: row[9] ? Number(row[9]) : 0,
                    light_sleep_duration: row[10] ? Number(row[10]) : 0,
                    deep_sleep_duration: row[11] ? Number(row[11]) : 0,
                    REM_sleep_duration: row[12] ? Number(row[12]) : 0,
                };
            }).filter(item => {
                return (
                    item.start_time.trim() !== "" &&
                    !(item.HR === 0 &&
                        item.activity_steps === 0 &&
                        item.activity_duration === 0 &&
                        item.exercise_steps === 0 &&
                        item.exercise_duration === 0 &&
                        item.oxygen_saturation === 0 &&
                        item.total_sleep_duration === 0 &&
                        item.awake_duration === 0 &&
                        item.light_sleep_duration === 0 &&
                        item.deep_sleep_duration === 0 &&
                        item.REM_sleep_duration === 0)
                );
            });

            setLastdata(filteredData);

            setRowLastdata(filteredData);
            setData(filteredData);
        } catch (error) {
            console.error("파일 다운로드 중 오류 발생:", error);
        }
    };

    const handleDownload = async () => {
        try {
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
        }
    };
    const getPaginationItems = () => {
        const range = 10; // 표시할 페이지 버튼의 범위
        const items = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(i);
            }
        } else {
            items.push(1);
            if (currentPage - range > 2) {
                items.push('...');
            }
            for (let i = Math.max(currentPage - range, 2); i <= Math.min(currentPage + range, totalPages - 1); i++) {
                items.push(i);
            }
            if (currentPage + range < totalPages - 1) {
                items.push('...');
            }

            items.push(totalPages);
        }
        return items;
    };
    return (
        <div className="main-content">
            <button className="btn btn-secondary" onClick={() => setPreprocessStatus("firstcompleted")}>←</button>
            <h2 className="mt-4" style={{ textAlign: 'left' }}>데이터 전처리 완료</h2>
            <p>전처리 과정을 통해 각각의 파일에 있는 데이터를 하나의 파일로 통합하였습니다.</p>
            <p>아래 테이블에서 각 데이터 항목의 상세한 값을 확인할 수 있습니다.</p>

            <div className="table-container">
                <table className="preprocess-table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th style={{ width: "250px" }}>Start Time</th>
                            <th style={{ width: "200px" }}>End Time</th>
                            <th>Heart Rate</th>
                            <th>Activity Steps</th>
                            <th>Activity Duration</th>
                            <th>Exercise Steps</th>
                            <th>Exercise Duration</th>
                            <th>Oxygen Saturation</th>
                            <th>Total Sleep Duration</th>
                            <th>Awake Duration</th>
                            <th>Light Sleep Duration</th>
                            <th>Deep Sleep Duration</th>
                            <th>REM Sleep Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems
                            .filter((item) =>
                                Object.values(item).some((value) => value !== null && value !== undefined && value !== "")
                            )
                            .map((item, index) => (
                                <tr key={index}>
                                    <td>{item.start_time}</td>
                                    <td>{item.end_time}</td>
                                    <td>
                                        {typeof item.HR === "number" && !Number.isInteger(item.HR)
                                            ? item.HR.toFixed(2)
                                            : item.HR}
                                    </td>
                                    <td>
                                        {typeof item.activity_steps === "number" && !Number.isInteger(item.activity_steps)
                                            ? item.activity_steps.toFixed(2)
                                            : item.activity_steps}
                                    </td>
                                    <td>
                                        {typeof item.activity_duration === "number" && !Number.isInteger(item.activity_duration)
                                            ? item.activity_duration.toFixed(2)
                                            : item.activity_duration}
                                    </td>
                                    <td>
                                        {typeof item.exercise_steps === "number" && !Number.isInteger(item.exercise_steps)
                                            ? item.exercise_steps.toFixed(2)
                                            : item.exercise_steps}
                                    </td>
                                    <td>
                                        {typeof item.exercise_duration === "number" && !Number.isInteger(item.exercise_duration)
                                            ? item.exercise_duration.toFixed(2)
                                            : item.exercise_duration}
                                    </td>
                                    <td>
                                        {typeof item.oxygen_saturation === "number" && !Number.isInteger(item.oxygen_saturation)
                                            ? item.oxygen_saturation.toFixed(2)
                                            : item.oxygen_saturation}
                                    </td>
                                    <td>
                                        {typeof item.total_sleep_duration === "number" && !Number.isInteger(item.total_sleep_duration)
                                            ? item.total_sleep_duration.toFixed(2)
                                            : item.total_sleep_duration}
                                    </td>
                                    <td>
                                        {typeof item.awake_duration === "number" && !Number.isInteger(item.awake_duration)
                                            ? item.awake_duration.toFixed(2)
                                            : item.awake_duration}
                                    </td>
                                    <td>
                                        {typeof item.light_sleep_duration === "number" && !Number.isInteger(item.light_sleep_duration)
                                            ? item.light_sleep_duration.toFixed(2)
                                            : item.light_sleep_duration}
                                    </td>
                                    <td>
                                        {typeof item.deep_sleep_duration === "number" && !Number.isInteger(item.deep_sleep_duration)
                                            ? item.deep_sleep_duration.toFixed(2)
                                            : item.deep_sleep_duration}
                                    </td>
                                    <td>
                                        {typeof item.REM_sleep_duration === "number" && !Number.isInteger(item.REM_sleep_duration)
                                            ? item.REM_sleep_duration.toFixed(2)
                                            : item.REM_sleep_duration}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <Pagination>
                {getPaginationItems().map((item, index) => (
                    <Pagination.Item
                        key={index}
                        active={item === currentPage}
                        onClick={() => item !== '...' && handlePageChange(item as number)}
                        disabled={item === '...'}
                    >
                        {item}
                    </Pagination.Item>
                ))}
            </Pagination>

            <button className="btn btn-primary" onClick={handleDownload}>
                <DownloadIcon /> 파일 다운로드
            </button>
        </div>

    );
};

export default PreprocessComplet;
