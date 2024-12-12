import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/DataQualityIndex.css'; // CSS 파일 임포트
import { Bar } from 'react-chartjs-2'; // Bar, Pie 컴포넌트 임포트
import { Button, Row, Col, Table } from 'react-bootstrap';
import 'chart.js/auto';
import { Dropdown, Menu } from 'antd';
import { Pie, PieChart, Cell, Label } from "recharts";
import { filecreatetimeSave, tokenSave, brandSave, savelastdata } from '../atoms';
import Plot from 'react-plotly.js';
import { Data } from 'plotly.js';
import { ChartOptions } from 'chart.js';

const DataQualityIndex: React.FC = () => {
    interface SleepData {
        start_time: string;
        end_time: string;
        HR: number;
        REM_sleep_duration: number;
        activity_duration: number;
        activity_steps: number;
        awake_duration: number;
        deep_sleep_duration: number;
        exercise_duration: number;
        exercise_steps: number;
        light_sleep_duration: number;
        oxygen_saturation: number;
        total_sleep_duration: number;
    }


    const location = useLocation();
    const [filecreatetime, setFilecreatetime] = useRecoilState(filecreatetimeSave);
    const [brand, setBrand] = useRecoilState(brandSave);
    const [token, setToken] = useRecoilState(tokenSave);
    const data = [{ name: 'A', value: 0.8 }, { name: 'B', value: 0.2 }];
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const currentValue = (data[0].value / totalValue).toFixed(1); // 첫 번째 값의 비율을 계산
    const [lastdata, setLastdata] = useRecoilState(savelastdata);
    // 예시 데이터 (필요에 따라 실제 데이터를 반영)
    const [completenessValue, setCompletenessValue] = useState<any>(0);
    const [recencyValue, setRecencyValue] = useState<number>(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isHovered1, setIsHovered1] = useState(false);

    const [collectedDateCount, setCollectedDateCount] = useState<number>(0);
    const [sleepDateCount, setSleepDateCount] = useState<number>(0);
    const [bioDataCount, setBioDataCount] = useState<number>(0);
    const [activityDataCount, setActivityDataCount] = useState<number>(0);
    const [datecount, setDatecount] = useState<number>(0);

    const [correlation_sleep_heartrate, setCorrelation_sleep_heartrate] = useState<number>(0);
    const [ratiochartdata, setRatioChartData] = useState<any[]>([]);
    const [hrValues, setHrValues] = useState<any[]>([]);
    const [sleepStepData, setsleepStepData] = useState<any[]>([]);


    const plausibilityValue = 0.75;
    const [averagenonzerocount, setaverageNonZeroCount] = useState<number>(0);
    const [completChartData, setCompletChartData] = useState<any[]>([]);
    const combinedData: { date: string, completeness: number }[] = [];
    const labels: string[] = [];
    const dataValues: number[] = [];
    useEffect(() => {

        // console.log(" completChartData : ", completChartData)
        const averageCompleteness = completChartData.reduce((acc, item) => acc + item.completeness, 0) / completChartData.length;

    
        setCompletenessValue(averageCompleteness.toFixed(2))
    }, [completChartData]);
    useEffect(() => {

        // console.log("리스트1 : " + JSON.stringify(lastdata, null, 2))

        const duplicates = lastdata
            .map((item, index) => {
                const sleepFields = [
                    item.total_sleep_duration,
                    item.awake_duration,
                    item.light_sleep_duration,
                    item.deep_sleep_duration,
                    item.REM_sleep_duration
                ];

                // 수면 데이터와 activity_steps가 동시에 존재하는 경우
                const hasOverlap = sleepFields.some(value => value !== 0) && item.activity_steps !== 0;

                return hasOverlap ? { index, item } : null;
            })
            .filter(Boolean); // 중복이 있는 항목만 필터링

        const result = duplicates.length > 0 ? 1 : 0;

        // console.log("결과:", result);
        // console.log("중복 데이터1:", JSON.stringify(duplicates, null, 2));
        const simplifiedDuplicates = duplicates.map((entry: any) => {
            const { index, item } = entry;

            // sleepFields를 명시적으로 타입 지정
            const sleepFields: Record<string, any> = {
                awake_duration: item.awake_duration,
                light_sleep_duration: item.light_sleep_duration,
                deep_sleep_duration: item.deep_sleep_duration,
                REM_sleep_duration: item.REM_sleep_duration
            };

            // 0이 아닌 수면 데이터 항목의 이름 찾기
            const sleepdata = Object.keys(sleepFields).find(key => sleepFields[key] !== 0);

            return {
                index,
                start_time: item.start_time,
                sleepdata: sleepdata?.split("_")[0] || null,
                activity_steps: item.activity_steps
                // 0이 아닌 항목이 없으면 null
            };
        });

        // console.log("추출된 데이터:", JSON.stringify(simplifiedDuplicates, null, 2));
        setsleepStepData(simplifiedDuplicates)


        if (lastdata.length > 0) {
            // 날짜별로 HR을 그룹화하고 평균을 계산하는 함수
            const groupedData: { [key: string]: { sum: number; count: number } } = lastdata.reduce((acc, curr) => {
                const date = curr.start_time.split(' ')[0]; // 시작 시간을 YYYY-MM-DD 형식으로 추출
                if (!acc[date]) {
                    acc[date] = { sum: 0, count: 0 };
                }
                acc[date].sum += curr.HR; // HR 값을 더함
                acc[date].count += 1; // 카운트를 증가시킴
                return acc;
            }, {} as { [key: string]: { sum: number; count: number } }); // 초기값에 타입 지정

            // 각 날짜별 평균 HR을 계산
            const averageHrValues = Object.entries(groupedData).map(([date, value]) => {
                const sum = value.sum; // sum
                const count = value.count; // count
                return {
                    date,
                    averageHR: sum / count // 평균 HR 계산
                };
            });

            // 날짜별 평균 HR 값만 추출
            const hrValues = averageHrValues.map(item => item.averageHR);
            // console.log("평균 Hr : ", hrValues);
            // 상태 업데이트
            setHrValues(hrValues);
        }




        // 각 항목별로 0이 아닌 값의 개수를 세는 함수
        const countNonZeroValues = (data: any[]) => {
            const countByKey: { [key: string]: number } = {};
            data.forEach(entry => {
                Object.keys(entry).forEach(key => {
                    if (key !== 'start_time' && key !== 'end_time' && entry[key] !== 0) {
                        countByKey[key] = (countByKey[key] || 0) + 1;
                    }
                });
            });

            // 항목별 개수를 콘솔에 출력
            // console.log("항목별 개수:", countByKey);

            return countByKey;
        };


        const nonZeroCountByField = countNonZeroValues(lastdata);
        const denominator = 144 * 11; // 원래의 코드와 동일

        const fields = [
            'HR',
            'activity_steps',
            'activity_duration',
            'exercise_steps',
            'exercise_duration',
            'oxygen_saturation',
            'total_sleep_duration',
            'awake_duration',
            'light_sleep_duration',
            'deep_sleep_duration',
            'REM_sleep_duration'
        ];

        // 전체 날짜 수 및 각 항목의 데이터가 있는 날짜 수 계산
        const uniqueDates = new Set();
        const uniqueDatesWithData = new Set();
        const uniqueDatesWithSleepData = new Set();
        const uniqueDatesWithBioData = new Set();
        const uniqueDatesWithActivityData = new Set();

        lastdata.forEach(entry => {
            const date = entry.start_time.split(' ')[0]; // start_time에서 날짜 추출
            uniqueDates.add(date); // 전체 날짜 추가

            // 각 카테고리에 대해 데이터가 있는지 확인
            const hasSleepData = entry.total_sleep_duration !== 0 || entry.awake_duration !== 0 || entry.light_sleep_duration !== 0 || entry.deep_sleep_duration !== 0 || entry.REM_sleep_duration !== 0;
            const hasBioData = entry.HR !== 0 || entry.oxygen_saturation !== 0;
            const hasActivityData = entry.activity_steps !== 0 || entry.activity_duration !== 0 || entry.exercise_steps !== 0 || entry.exercise_duration !== 0;

            if (hasSleepData) {
                uniqueDatesWithSleepData.add(date);
            }
            if (hasBioData) {
                uniqueDatesWithBioData.add(date);
            }
            if (hasActivityData) {
                uniqueDatesWithActivityData.add(date);
            }
            if (hasSleepData || hasBioData || hasActivityData) {
                uniqueDatesWithData.add(date); // 0이 아닌 값이 있는 경우 해당 날짜를 추가
            }
        });

        const totalDateCount = uniqueDates.size; // 전체 날짜 수
        const collectedDateCount = uniqueDatesWithData.size; // 모든 항목의 데이터가 수집된 고유한 날짜 수
        const sleepDateCount = uniqueDatesWithSleepData.size; // 수면 데이터가 수집된 고유한 날짜 수
        const bioDataCount = uniqueDatesWithBioData.size; // 생체 데이터가 수집된 고유한 날짜 수
        const activityDataCount = uniqueDatesWithActivityData.size; // 활동 데이터가 수집된 고유한 날짜 수

        const groupedData: Record<string, Data[]> = {};

        lastdata.forEach((entry) => {
            const date = new Date(entry.start_time).toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = [];
            }
            groupedData[date].push(entry);
        });

        // console.log("날짜별 ", groupedData);

        const calculateCompleteness = (data: any[]) => {
            const completenessValues: number[] = [];
            const groupedByDate = data.reduce((acc, entry) => {
                const date = entry.start_time.split(' ')[0];
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(entry);
                return acc;
            }, {} as { [key: string]: any[] });

            Object.entries(groupedByDate).forEach(([date, dateData]) => {
                if (!dateData || !Array.isArray(dateData)) {
                    return;
                }

                const nonZeroCountByField = countNonZeroValues(dateData);

                const completenessValue = fields.reduce((total, field) => {
                    const ratio = (nonZeroCountByField[field] || 0) / denominator;
                    const logValue = ratio > 0 ? Math.log(ratio) : 0;
                    const calculatedValue = ratio * (logValue || 0) * -1;
                    return total + calculatedValue;
                }, 0);

                labels.push(date);
                dataValues.push(completenessValue);

                combinedData.push({ date, completeness: completenessValue });
            });

            // Log the combinedData array once after the loop completes
            // console.log('Combined Data:', combinedData);
            // 기존 데이터를 중복 없이 합치기
            setCompletChartData((prevData: any[]) => {
                const newData = [...prevData]; // 기존 데이터를 복사

                // combinedData의 날짜별로 중복된 데이터를 업데이트
                combinedData.forEach((newItem) => {
                    const existingItemIndex = newData.findIndex((item) => item.date === newItem.date);

                    if (existingItemIndex >= 0) {
                        // 기존 데이터가 있으면 업데이트
                        newData[existingItemIndex] = newItem;
                    } else {
                        // 기존 데이터가 없으면 새로 추가
                        newData.push(newItem);
                    }
                });

                return newData; // 중복 제거된 새로운 상태 반환
            });



            const averageCompleteness = completenessValues.length > 0
                ? completenessValues.reduce((sum, value) => sum + value, 0) / completenessValues.length
                : 0;

            return parseFloat(averageCompleteness.toFixed(2));
        };
        const completenessValues: Record<string, number> = {};

        Object.keys(groupedData).forEach((date) => {
            const dataForDate = groupedData[date];
            const completenessValue = calculateCompleteness(dataForDate);
            completenessValues[date] = completenessValue;
        });




        const completenessValuesArray = Object.values(completenessValues);
        const totalCompleteness = completenessValuesArray.reduce((sum, value) => sum + value, 0);
        const averageCompleteness = (totalCompleteness / completenessValuesArray.length) / 2.397895;

        // console.log("평균 완전성 값: ", averageCompleteness.toFixed(2));

        setCompletenessValue(averageCompleteness.toFixed(2) + "");

        setCollectedDateCount(collectedDateCount);
        setSleepDateCount(sleepDateCount);
        setBioDataCount(bioDataCount);
        setActivityDataCount(activityDataCount);

        const value = countNonZeroValuesByDate(lastdata);

        setRecencyValue(parseFloat(value.toFixed(2)));
        setCorrelation_sleep_heartrate(logCorrelationForLastData(lastdata))

    }, [lastdata]);
    function logCorrelationForLastData(lastdata: any[]) {
        const heartRateData = lastdata.map((entry) => entry.HR);
        const sleepDurationData = lastdata.map((entry) => entry.total_sleep_duration);
        const n = heartRateData.length;

        if (n === 0) {
            console.log("데이터가 비어 있습니다.");
            return 0;
        }

        const sumHR = heartRateData.reduce((a, b) => a + b, 0);
        const sumSleep = sleepDurationData.reduce((a, b) => a + b, 0);
        const sumHRSq = heartRateData.reduce((a, b) => a + b ** 2, 0);
        const sumSleepSq = sleepDurationData.reduce((a, b) => a + b ** 2, 0);
        const productSum = heartRateData.reduce((sum, val, i) => sum + val * sleepDurationData[i], 0);

        const numerator = productSum - (sumHR * sumSleep) / n;
        const denominator = Math.sqrt(
            (sumHRSq - (sumHR ** 2) / n) * (sumSleepSq - (sumSleep ** 2) / n)
        );

        const correlationValue = denominator === 0 ? 0 : numerator / denominator;
        // console.log("Heart Rate와 Total Sleep Duration의 상관 계수:", correlationValue.toFixed(10));
        return correlationValue;
    }

    const countNonZeroValuesByDate = (data: SleepData[]): number => {
        const countsByDate: Record<string, number> = {};
        const singleNonZeroCountByDate: Record<string, number> = {};

        const today = new Date();

        data.forEach(item => {
            const date = item.start_time.split(" ")[0];

            if (!countsByDate[date]) {
                countsByDate[date] = 0;
            }
            if (!singleNonZeroCountByDate[date]) {
                singleNonZeroCountByDate[date] = 0;
            }

            const valuesToCheck = [
                item.activity_duration,
                item.exercise_duration,
                item.HR,
                item.REM_sleep_duration,
                item.activity_steps,
                item.awake_duration,
                item.deep_sleep_duration,
                item.exercise_steps,
                item.light_sleep_duration,
                item.oxygen_saturation,
                item.total_sleep_duration
            ];

            valuesToCheck.forEach(value => {
                if (value > 0) {
                    countsByDate[date]++;
                }
            });

            if (valuesToCheck.some(value => value > 0)) {
                singleNonZeroCountByDate[date]++;
            }
        });

        Object.keys(singleNonZeroCountByDate).forEach(date => {
            singleNonZeroCountByDate[date] = parseFloat((singleNonZeroCountByDate[date] / 144).toFixed(6));
        });
        const totalNonZeroCounts = Object.values(singleNonZeroCountByDate).reduce((sum, value) => sum + value, 0);
        const averageNonZeroCount = totalNonZeroCounts / Object.keys(singleNonZeroCountByDate).length;
        setaverageNonZeroCount(parseFloat(averageNonZeroCount.toFixed(2)))
        const dateDifferences: Record<string, number> = {};
        Object.keys(countsByDate).forEach(date => {
            const dateObj = new Date(date);
            const timeDiff = today.getTime() - dateObj.getTime();
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            dateDifferences[date] = dayDiff;
        });
        const totalPoints = Object.values(countsByDate).reduce((sum, count) => sum + count, 0);
        const ratiosByDate: Record<string, number> = {};
        Object.keys(countsByDate).forEach(date => {
            const count = countsByDate[date];
            ratiosByDate[date] = totalPoints > 0 ? parseFloat((count / totalPoints).toFixed(9)) : 0;
        });
        const formattedData = Object.entries(ratiosByDate).map(([date, ratio]) => ({ date, ratio }));
        setRatioChartData(formattedData);

        const resultsList: Record<string, number> = {};
        Object.keys(countsByDate).forEach(date => {
            resultsList[date] = parseFloat((dateDifferences[date] * ratiosByDate[date]).toFixed(9));
        });
        const finalResult = Object.values(resultsList).reduce((sum, value) => sum + value, 0);
        // console.log("최종 결과:", finalResult.toFixed(2));

        return finalResult;
    };
    const distributionData = {
        labels: ratiochartdata.map((data) => data.date), // x축: 날짜를 직접 가져오기
        datasets: [
            {
                label: '요일별 데이터 비율',
                data: ratiochartdata.map((data) => data.ratio), // y축: 비율
                backgroundColor: '#0F0F70',
                borderColor: '#0F0F70', // 색상 변경
                borderWidth: 1,
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // 범례 숨기기
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                },
                ticks: {
                    callback: function (value: any, index: number, values: any[]) {
                        const middleIndex = Math.floor(values.length / 2); // 중앙 인덱스 계산
                        // 첫 번째, 중앙, 마지막 레이블만 표시
                        if (index === 0 || index === middleIndex || index === values.length - 1) {
                            return ratiochartdata[value].date; // 실제 날짜 반환
                        }
                        return ''; // 나머지 레이블은 빈 문자열로 반환
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 0.1, // y축의 단계 크기 설정
                },
            },
        },
    };
    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: 'top', // 'top'은 허용된 값 중 하나입니다.
            },
            title: {
                display: true,
                text: '',
            },
        },
    };
    const chartData1 = {
        labels: completChartData.map((item) => item.date), // X축에 날짜 값
        datasets: [
            {
                label: 'Completeness',
                data: completChartData.map((item) => item.completeness), // Y축에 완성도 값
                backgroundColor: ['#0F0F70', '#0F0F70'], // 막대 색상
                borderColor: ['#0F0F70', '#0F0F70'], // 테두리 색상
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="main-content">
            <div className='dataqualityindex_box'>
                <h3>데이터 질관리 및 질지표</h3>
                <p>
                    웨어러블 데이터 질관리는 사이드바에서 사용자가 선택한 기준을 적용하여 데이터를 필터링 하여 유요한 데이터를 선별하는 것을 의미하며,
                    아래의 지표는 데이터 질을 평가하기 위해 다양한 관점에서 정의한 지표입니다.
                </p>

                <h4><strong>3가지 데이터 질지표</strong></h4>
                <ul>
                    <li>완전성(completeness): 수집된 데이터의 양과 범위를 나타내는 지표</li>
                    <li>최신성(recency): 수집된 데이터가 얼마나 최신의 데이터인지를 나타내는 지표</li>
                    <li>개연성(plausibility): 데이터가 실제 현실을 충분히 반영하는지 여부, 신뢰할만한지 여부를 나타내는 지표</li>
                </ul>
                <p>
                    참고) 완전성과 개연성은 0이상 1이하의 실수로 표현되며, 1에 가까울수록 데이터 품질이 높다고 판단할 수 있습니다. 최신성의 단위는 분석일로부터 흐른 평균 일(day)입니다.
                </p>
            </div>



            <Row className="justify-content-between">

                <Col style={{ width: '30%' }} className='dataqualityindex_box'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #000' }}>
                        <h5>완전성 (COMPLETENESS)</h5>
                        <h5>{completenessValue}</h5>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <div
                            style={{ position: 'relative', fontWeight: 'bold' }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            Diversity Ratio
                            {isHovered && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        marginTop: '5px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Shannon 다양성 지수를 활용한 완전성 지표로 각 데이터 항목이 얼마나 균형 있게 수집되었는지를 평가합니다.
                                </span>
                            )}
                        </div>
                        <p style={{ fontWeight: 'bold', color: '#007bff' }}>{completenessValue}</p>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <Bar data={chartData1} options={chartOptions} />
                    </div>
                </Col>
                <Col style={{ width: '30%' }} className='dataqualityindex_box'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #000' }}>
                        <h5>최신성 (RECENCY)</h5>
                        <h5>{Math.floor(recencyValue)}일</h5>
                    </div>

                    <h6>수집된 데이터 분포</h6>
                    <div style={{ width: '100%', height: '300px' }}>
                        <Bar data={distributionData} options={options} />
                    </div>
                </Col>

                <Col style={{ width: '30%' }} className='dataqualityindex_box'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #000' }}>
                        <h5>개연성 (PLAUSIBILITY)</h5>
                        {(() => {
                            let plausibilityValue = 0;

                            if (correlation_sleep_heartrate === 1) {
                                plausibilityValue += 0.33;
                            }

                            if (sleepStepData.length >= 1) {
                                plausibilityValue += 0.33;
                            }

                            if (hrValues.length >= 1) {
                                plausibilityValue += 0.33;
                            }
                            const formattedPlausibilityValue = plausibilityValue.toFixed(2);

                            return <h5>값: {formattedPlausibilityValue}</h5>;
                        })()}
                    </div>



                    <h6>수면 데이터</h6>

                    <div>
                        <p>수면 시간과 심박수 간의 관계</p>
                        <p>(양의 상관관계이면 1, 아니면 0)</p>
                        <p>[상관계수 : {correlation_sleep_heartrate > 0 ? 1 : 0}]</p>
                    </div>
                    <div>
                        <p>수면 중 걸음 수 데이터 수집 여부</p>
                        <p>(수면 중 걸음 수 기록 없으면 1, 있으면 0)</p>
                    </div>

                    <Table striped bordered hover className="table-margin">
                        <thead>
                            <tr>
                                <th>수면 시작 시간</th>
                                <th>수면 단계</th>
                                <th>스텝 수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sleepStepData.map((data, index) => (
                                <tr key={index}>
                                    <td>{data.start_time}</td>
                                    <td>{data.sleepdata}</td>
                                    <td>{data.activity_steps}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Plot
                        data={[
                            {
                                y: hrValues,
                                type: 'box',
                                name: '수면 데이터 분포',
                                marker: { color: 'black', size: 5 },
                                boxpoints: 'all',
                                jitter: 0,
                                pointpos: 0,
                                fillcolor: 'lightblue',
                                line: { width: 2 }

                            }
                        ]}
                        layout={{
                            width: 500,
                            height: 500,
                            title: '수면 데이터 박스 그래프',
                            margin: { t: 40, l: 40, r: 40, b: 40 },
                            xaxis: { title: '데이터 항목' },
                            yaxis: { title: '값' },
                            showlegend: false
                        }}
                    />

                </Col>
            </Row>
        </div>
    );
};

export default DataQualityIndex;
