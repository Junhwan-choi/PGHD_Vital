import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { filecreatetimeSave, tokenSave, brandSave, savelastdata, saverowlastdata } from '../atoms';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/DataOverview.css'; // CSS 파일 임포트
import { Line } from 'react-chartjs-2'; // Line 컴포넌트 임포트
import { Button, Row, Col, Form, Table } from 'react-bootstrap';
import 'chart.js/auto';
import { ResponsiveHeatMap } from '@nivo/heatmap';
const DataOverview: React.FC = () => {
    const [heatMapData, setHeatMapData] = useState<any[]>([]);
    const [tabledata, setTableData] = useState<any[]>([]);
    const location = useLocation();
    const [lastdata, setLastdata] = useRecoilState(savelastdata);

    const [alldatadaycount, setAlldatadaycount] = useState<number>(0);
    const [alldatacount, setAlldatacount] = useState<number>(0);

    interface GroupedValues {
        count: number;
        HR: number;
        activity_steps: number;
        activity_duration: number;
        exercise_steps: number;
        exercise_duration: number;
        oxygen_saturation: number;
        total_sleep_duration: number;
        awake_duration: number;
        light_sleep_duration: number;
        deep_sleep_duration: number;
        REM_sleep_duration: number;
    }
    useEffect(() => {
        // console.log("저장된 데이터 : ", lastdata);
        handleCSVFile(lastdata)
        setTableData(calculateAverages(lastdata))

    }, [lastdata]); // lastdata가 변경될 때마다 실행
    const calculateAverages = (data: any[]) => {
        const groupedData: { [key: string]: GroupedValues } = data.reduce((acc: any, item: any) => {
            const startTime = item.start_time;
            if (!startTime) return acc;

            const startDate = new Date(startTime);
            if (isNaN(startDate.getTime())) return acc;

            const formattedDate = startDate.toISOString().split('T')[0]; 

            if (!acc[formattedDate]) {
                acc[formattedDate] = {
                    count: 0,
                    HR: 0,
                    activity_steps: 0,
                    activity_duration: 0,
                    exercise_steps: 0,
                    exercise_duration: 0,
                    oxygen_saturation: 0,
                    total_sleep_duration: 0,
                    awake_duration: 0,
                    light_sleep_duration: 0,
                    deep_sleep_duration: 0,
                    REM_sleep_duration: 0
                };
            }

            // 데이터 합계와 카운트 업데이트
            acc[formattedDate].count += 1;
            acc[formattedDate].HR += item.HR || 0;
            acc[formattedDate].activity_steps += item.activity_steps || 0;
            acc[formattedDate].activity_duration += item.activity_duration || 0;
            acc[formattedDate].exercise_steps += item.exercise_steps || 0;
            acc[formattedDate].exercise_duration += item.exercise_duration || 0;
            acc[formattedDate].oxygen_saturation += item.oxygen_saturation || 0;
            acc[formattedDate].total_sleep_duration += item.total_sleep_duration || 0;
            acc[formattedDate].awake_duration += item.awake_duration || 0;
            acc[formattedDate].light_sleep_duration += item.light_sleep_duration || 0;
            acc[formattedDate].deep_sleep_duration += item.deep_sleep_duration || 0;
            acc[formattedDate].REM_sleep_duration += item.REM_sleep_duration || 0;

            return acc;
        }, {});

        return Object.entries(groupedData).map(([date, values]: [string, GroupedValues]) => {
            return {
                date,
                HR: values.HR / values.count, // 평균 HR
                activity_steps: values.activity_steps,
                activity_duration: values.activity_duration,
                exercise_steps: values.exercise_steps,
                exercise_duration: values.exercise_duration,
                oxygen_saturation: values.oxygen_saturation,
                total_sleep_duration: values.total_sleep_duration,
                awake_duration: values.awake_duration,
                light_sleep_duration: values.light_sleep_duration,
                deep_sleep_duration: values.deep_sleep_duration,
                REM_sleep_duration: values.REM_sleep_duration
            };
        });
    };



    const handleCSVFile = (data: any) => {
        const filteredData = lastdata
            .filter(item => item.start_time) // 시작 시간과 HR 값이 유효한 항목만 포함
            .map((item) => [
                item.start_time,            // 시작 시간
                item.end_time,              // 종료 시간
                item.HR,                    // 심박수
                item.activity_steps,        // 활동 단계
                item.activity_duration,     // 활동 시간
                item.exercise_steps,        // 운동 단계
                item.exercise_duration,     // 운동 시간
                item.oxygen_saturation,     // 산소 포화도
                item.total_sleep_duration,  // 총 수면 시간
                item.awake_duration,        // 깨어있는 시간
                item.light_sleep_duration,  // 얕은 수면 시간
                item.deep_sleep_duration,   // 깊은 수면 시간
                item.REM_sleep_duration     // REM 수면 시간
            ]);

        const uniqueDates = new Set<string>();
        let totalDataCount = 0;

        const dailyCounts: { [key: string]: number[] } = {};

        filteredData.forEach((row: any) => {
            const startTime = new Date(row[0]);
            const dateKey = `${startTime.getFullYear()}-${(startTime.getMonth() + 1).toString().padStart(2, '0')}-${startTime.getDate().toString().padStart(2, '0')}`;
            const hour = startTime.getHours();

            uniqueDates.add(dateKey); // 날짜 수집
            totalDataCount += 1; // 데이터 개수 카운트

            if (!dailyCounts[dateKey]) {
                dailyCounts[dateKey] = Array(24).fill(0);
            }

            const nonEmptyValuesCount = row.slice(2).filter((value: number | null | undefined) => value !== 0 && value !== null && value !== undefined).length;

            if (nonEmptyValuesCount > 0) {
                dailyCounts[dateKey][hour] += nonEmptyValuesCount;
            }
        });

        setAlldatadaycount(uniqueDates.size)
        setAlldatacount(totalDataCount)

        const transformedCounts: { [key: string]: number[] } = {};
        Object.keys(dailyCounts).forEach(date => {
            transformedCounts[date] = dailyCounts[date].map(count => {
                if (count === 0) {
                    return 0; 
                } else if (count < 10) {
                    return 10; 
                } else if (count < 20) {
                    return 20; 
                } else if (count < 30) {
                    return 30; 
                } else if (count < 40) {
                    return 40; 
                } else {
                    return 50; 
                }
            });
        });

        const heatMapArray = Array.from({ length: 24 }, (_, hour) => {
            const hourRange = `${hour}~${hour + 1}시`;
            return {
                id: hourRange,
                data: Object.keys(transformedCounts).map(date => ({
                    x: date,
                    y: transformedCounts[date][hour] || 0
                }))
            };
        });
        setHeatMapData(heatMapArray);
    };
    return (
        <div className="main-content">

            <div className='dataoverview_box'>
                <div >
                    <h4>시간대별 데이터 수집 현황</h4>
                    <div>
                        <span>전체 데이터 수집 일 수: <strong>{alldatadaycount}일</strong></span> |
                        <span> 전체 데이터 개수: <strong>{alldatacount}개</strong></span>
                    </div>
                </div>
                <hr style={{ border: '1px solid black' }} /> {/* 검은색 실선 추가 */}

                <div className="chart-section">
                    <div style={{ width: '100%', height: '70vh' }}>
                        <ResponsiveHeatMap
                            data={heatMapData}
                            forceSquare={false}
                            axisLeft={null} // y축 숨기기
                            axisTop={null}
                            axisBottom={{
                                format: (value) => {
                                    const date = new Date(value);
                                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                },
                                legend: '', 
                                legendPosition: 'middle', 
                                tickValues: [heatMapData[0]?.data[0]?.x, heatMapData[0]?.data[heatMapData[0].data.length - 1]?.x], // 첫 값과 끝 값만 표시
                                tickPadding: 10, 
                            }}
                        
                            colors={(cell) => {
                                const value = cell.value;
                                if (value === null) return '#eeeeee';
                                if (value === 0) return '#ffffff';
                                if (value === 10) return '#E9E9FB';
                                if (value === 20) return '#C8C8ED';
                                if (value === 30) return '#9595D0';
                                if (value === 40) return '#4E4EA5';
                                if (value === 50) return '#0F0F70';
                                return '#3182bd';
                            }}
                            emptyColor="#eeeeee"
                            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                            labelTextColor="none"
                            margin={{ top: 20, right: 20, bottom: 60, left: 40 }} // X축 레이블을 위한 충분한 여백 추가
                        />
                    </div>
                </div>
            </div>

            <div className="dataoverview_box">
                <h5>날짜별 요약</h5>
                <div className="action-section">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <Button variant="primary">
                                <i className="fas fa-download"></i> 다운로드
                            </Button>
                        </Col>
                    </Row>
                </div>

                <div className="table-container" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>Date</th> 
                                <th>Average Heart Rate</th>
                                <th>Activity Steps</th>
                                <th>Activity Duration</th>
                                <th>Oxygen Saturation</th>
                                <th>Total Sleep Duration</th>
                                <th>Awake Duration</th>
                                <th>Light Sleep Duration</th>
                                <th>Deep Sleep Duration</th>
                                <th>REM Sleep Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tabledata.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.date ?? 'N/A'}</td>
                                    <td>{row.HR !== undefined ? row.HR.toFixed(2) : 'N/A'}</td>
                                    <td>{row.activity_steps !== undefined ? row.activity_steps : 'N/A'}</td>
                                    <td>{row.activity_duration !== undefined ? row.activity_duration.toFixed(2) : 'N/A'}</td>
                                    <td>{row.oxygen_saturation !== undefined ? row.oxygen_saturation.toFixed(2) : 'N/A'}</td>
                                    <td>{row.total_sleep_duration !== undefined ? row.total_sleep_duration.toFixed(2) : 'N/A'}</td>
                                    <td>{row.awake_duration !== undefined ? row.awake_duration.toFixed(2) : 'N/A'}</td>
                                    <td>{row.light_sleep_duration !== undefined ? row.light_sleep_duration.toFixed(2) : 'N/A'}</td>
                                    <td>{row.deep_sleep_duration !== undefined ? row.deep_sleep_duration : 'N/A'}</td>
                                    <td>{row.REM_sleep_duration !== undefined ? row.REM_sleep_duration : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>


            </div>

        </div>
    );

};

export default DataOverview;
