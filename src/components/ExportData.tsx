import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Form, Table } from 'react-bootstrap';
import '../styles/ExportData.css';
import { useRecoilState } from 'recoil';
import { filecreatetimeSave, tokenSave, brandSave, savelastdata, saverowlastdata } from '../atoms';

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

const ExportData: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'raw' | 'quality' | 'summary'>('raw');
    const [lastdata, setLastdata] = useRecoilState(savelastdata);
    const [rowlastdata, setRowLastdata] = useRecoilState(saverowlastdata);
    const [summaryDataByDate, setSummaryDataByDate] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState({
        raw: false,
        quality: false,
        summary: false,
        rawSummary: false, // 원데이터 요약 체크박스 추가
    });

    useEffect(() => {
        setSummaryDataByDate(calculateAverages(lastdata));
    }, [lastdata]);

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
                    REM_sleep_duration: 0,
                };
            }

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

        return Object.entries(groupedData).map(([date, values]: [string, GroupedValues]) => ({
            date,
            HR: values.HR / values.count,
            activity_steps: values.activity_steps,
            activity_duration: values.activity_duration,
            exercise_steps: values.exercise_steps,
            exercise_duration: values.exercise_duration,
            oxygen_saturation: values.oxygen_saturation,
            total_sleep_duration: values.total_sleep_duration,
            awake_duration: values.awake_duration,
            light_sleep_duration: values.light_sleep_duration,
            deep_sleep_duration: values.deep_sleep_duration,
            REM_sleep_duration: values.REM_sleep_duration,
        }));
    };

    const calculateRawDataSummary = () => {
        const summary = rowlastdata.reduce(
            (acc: any, item: any) => {
                acc.HR += item.HR || 0;
                acc.activity_steps += item.activity_steps || 0;
                acc.activity_duration += item.activity_duration || 0;
                acc.exercise_steps += item.exercise_steps || 0;
                acc.exercise_duration += item.exercise_duration || 0;
                acc.oxygen_saturation += item.oxygen_saturation || 0;
                acc.total_sleep_duration += item.total_sleep_duration || 0;
                acc.awake_duration += item.awake_duration || 0;
                acc.light_sleep_duration += item.light_sleep_duration || 0;
                acc.deep_sleep_duration += item.deep_sleep_duration || 0;
                acc.REM_sleep_duration += item.REM_sleep_duration || 0;
                acc.count += 1;
                return acc;
            },
            {
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
                REM_sleep_duration: 0,
                count: 0,
            }
        );

        // Return average for each field
        return {
            HR: summary.HR / summary.count,
            activity_steps: summary.activity_steps / summary.count,
            activity_duration: summary.activity_duration / summary.count,
            exercise_steps: summary.exercise_steps / summary.count,
            exercise_duration: summary.exercise_duration / summary.count,
            oxygen_saturation: summary.oxygen_saturation / summary.count,
            total_sleep_duration: summary.total_sleep_duration / summary.count,
            awake_duration: summary.awake_duration / summary.count,
            light_sleep_duration: summary.light_sleep_duration / summary.count,
            deep_sleep_duration: summary.deep_sleep_duration / summary.count,
            REM_sleep_duration: summary.REM_sleep_duration / summary.count,
        };
    };

    // Function to download selected data as CSV
    const downloadCSV = () => {
        if (!selectedFiles.raw && !selectedFiles.quality && !selectedFiles.summary && !selectedFiles.rawSummary) {
            return;
        }

        const selectedData: any[] = [];

        if (selectedFiles.raw) {
            const rawHeaders = ['Start Time', 'End Time', 'Heart Rate', 'Activity Steps', 'Activity Duration', 'Exercise Steps', 'Exercise Duration', 'Oxygen Saturation', 'Total Sleep Duration', 'Awake Duration', 'Light Sleep Duration', 'Deep Sleep Duration', 'REM Sleep Duration'];
            const rawRows = rowlastdata.map((row: any) =>
                rawHeaders.map(header => JSON.stringify(row[header.toLowerCase().replace(/ /g, '_')]) || '').join(',')
            );
            rawRows.unshift(rawHeaders.join(','));
            selectedData.push({ data: rawRows, filename: '원 데이터(Raw data).csv' });
        }
        if (selectedFiles.quality) {
            const qualityHeaders = ['Start Time', 'End Time', 'Heart Rate', 'Activity Steps', 'Activity Duration', 'Exercise Steps', 'Exercise Duration', 'Oxygen Saturation', 'Total Sleep Duration', 'Awake Duration', 'Light Sleep Duration', 'Deep Sleep Duration', 'REM Sleep Duration'];
            const qualityRows = lastdata.map((row: any) =>
                qualityHeaders.map(header => JSON.stringify(row[header.toLowerCase().replace(/ /g, '_')]) || '').join(',')
            );
            qualityRows.unshift(qualityHeaders.join(','));
            selectedData.push({ data: qualityRows, filename: '질관리 적용 데이터.csv' });
        }
        if (selectedFiles.summary) {
            const summaryHeaders = ['Date', 'Average Heart Rate', 'Average Activity Steps', 'Average Activity Duration', 'Oxygen Saturation', 'Total Sleep Duration', 'Awake Duration', 'Light Sleep Duration', 'Deep Sleep Duration', 'REM Sleep Duration'];
            const summaryRows = summaryDataByDate.map((row: any) =>
                summaryHeaders.map(header => JSON.stringify(row[header.toLowerCase().replace(/ /g, '_')]) || '').join(',')
            );
            summaryRows.unshift(summaryHeaders.join(','));
            selectedData.push({ data: summaryRows, filename: '질관리 적용 요약 테이블.csv' });
        }
        if (selectedFiles.rawSummary) {
            const rawSummary = calculateRawDataSummary();
            const summaryHeaders = ['Average Heart Rate', 'Average Activity Steps', 'Average Activity Duration', 'Average Exercise Steps', 'Average Exercise Duration', 'Average Oxygen Saturation', 'Average Total Sleep Duration', 'Average Awake Duration', 'Average Light Sleep Duration', 'Average Deep Sleep Duration', 'Average REM Sleep Duration'];
            const summaryRow = [
                rawSummary.HR,
                rawSummary.activity_steps,
                rawSummary.activity_duration,
                rawSummary.exercise_steps,
                rawSummary.exercise_duration,
                rawSummary.oxygen_saturation,
                rawSummary.total_sleep_duration,
                rawSummary.awake_duration,
                rawSummary.light_sleep_duration,
                rawSummary.deep_sleep_duration,
                rawSummary.REM_sleep_duration,
            ];
            selectedData.push({
                data: [summaryHeaders.join(','), summaryRow.join(',')],
                filename: '원 데이터 요약(Raw Data Summary).csv',
            });
        }

        selectedData.forEach(file => {
            const csvContent = file.data.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <div className="main-content d-flex flex-column" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="ExportData_box" style={{ flex: 1 }}>
                <h3>데이터 내보내기</h3>
                <Row className="mt-3">
                    <Col>
                        <Form>
                            <Form.Check
                                type="checkbox"
                                label="원 데이터(Raw data)"
                                checked={selectedFiles.raw}
                                onChange={() => setSelectedFiles({ ...selectedFiles, raw: !selectedFiles.raw })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="질관리 적용 데이터"
                                checked={selectedFiles.quality}
                                onChange={() => setSelectedFiles({ ...selectedFiles, quality: !selectedFiles.quality })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="원 데이터 요약"
                                checked={selectedFiles.rawSummary}
                                onChange={() => setSelectedFiles({ ...selectedFiles, rawSummary: !selectedFiles.rawSummary })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="질관리 적용 요약"
                                checked={selectedFiles.summary}
                                onChange={() => setSelectedFiles({ ...selectedFiles, summary: !selectedFiles.summary })}
                            />

                        </Form>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col>
                        <Button variant="success" onClick={downloadCSV}>
                            다운로드
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ExportData;
