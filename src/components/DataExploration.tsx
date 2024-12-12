import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { filecreatetimeSave, tokenSave, brandSave, savelastdata } from '../atoms';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/DataExploration.css'; // CSS 파일 임포트
import { Line, Bar, Pie, Chart } from 'react-chartjs-2'; // 그래프 컴포넌트 임포트
import Plot from 'react-plotly.js';
import { Layout, Data } from 'plotly.js';
import { Button, Row, Col, Form } from 'react-bootstrap';
import 'chart.js/auto';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    TooltipItem,
    registerables,
} from "chart.js";

ChartJS.register(
    ...registerables,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    ArcElement
);

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


const DataExploration: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [data, setData] = useState<{ category: string; status: string }[]>([]);
    const [filecreatetime, setFilecreatetime] = useRecoilState(filecreatetimeSave);
    const [brand, setBrand] = useRecoilState(brandSave);
    const location = useLocation();
    const [token, setToken] = useRecoilState(tokenSave);
    const [plotlyData, setPlotlyData] = useState<any[]>([]);
    const [plotlyData1, setPlotlyData1] = useState<any[]>([]);
    const [plotlyData2, setPlotlyData2] = useState<any[]>([]);

    const react_dummy = [10, 10, 10, 10, 20, 20, 20, 20, 30, 30, 30, 30];
    const labels_dummy = new Array(12).fill(0).map((_, idx) => idx + 1 + "월");
    const [lastdata, setLastdata] = useRecoilState(savelastdata);
    const heartRateData1 = lastdata.map(item => item.HR); // HR 데이터 배열
    const oxygenSaturationData1 = lastdata.map(item => item.oxygen_saturation); // 산소포화도 데이터 배열
    const startDates1 = lastdata.map(item => new Date(item.start_time).toLocaleString()); // 시작 날짜 배열
    const [dataChart1, setDataChart1] = useState<any>([]);
    const [dataChart2, setDataChart2] = useState<any>([]);
    const [dataChart3, setDataChart3] = useState<any>([]);
    const [initialPlotlyData, setinitialPlotlyData] = useState<any>([]);

    const [avgSteps, setAvgSteps] = useState<number>(0);
    const [minSteps, setMinSteps] = useState<number>(0);
    const [maxSteps, setMaxSteps] = useState<number>(0);
    const [stdDevSteps, setStdDevSteps] = useState<any>(0);
    const [avgDuration, setAvgDuration] = useState<number>(0);
    const [minDuration, setMinDuration] = useState<number>(0);
    const [maxDuration, setMaxDuration] = useState<number>(0);
    const [stdDevDuration, setStdDevDuration] = useState<any>(0);
    const [avgHR, setAvgHR] = useState<number>(0);
    const [minHR, setMinHR] = useState<number>(0);
    const [maxHR, setMaxHR] = useState<number>(0);
    const [stdDevHR, setStdDevHR] = useState<number>(0);
    const [avgSleep, setAvgSleep] = useState<number>(0);
    const [minSleep, setMinSleep] = useState<number>(0);
    const [maxSleep, setMaxSleep] = useState<number>(0);
    const [stdDevSleep, setStdDevSleep] = useState<number>(0);
    const [avgOxygenSaturation, setAvgOxygenSaturation] = useState<number>(0);
    const [minOxygenSaturation, setMinOxygenSaturation] = useState<number>(0);
    const [maxOxygenSaturation, setMaxOxygenSaturation] = useState<number>(0);
    const [stdDevOxygenSaturation, setStdDevOxygenSaturation] = useState<number>(0);



    useEffect(() => {
        const dailyData = lastdata.reduce((acc, item) => {
            const date = item.start_time.split(" ")[0];
            const stepsSum = item.activity_steps + item.exercise_steps;

            if (!acc[date]) {
                acc[date] = {
                    totalSteps: 0,
                    activitySteps: 0,
                    activityDuration: 0,
                };
            }

            acc[date].totalSteps += stepsSum; // 총 걸음수 합계
            acc[date].activitySteps += item.activity_steps; // 활동 걸음수 합계
            acc[date].activityDuration += item.activity_duration; // 활동 시간 합계

            return acc;
        }, {} as Record<string, { totalSteps: number; activitySteps: number; activityDuration: number }>);

        const processedData1 = Object.keys(dailyData).map(date => {
            const dayData = dailyData[date];
            return {
                date: date, // 날짜
                activity_steps: dayData.activitySteps, // 활동 걸음수 합계
                totalSteps: dayData.totalSteps, // 총 걸음수
                activity_duration: dayData.activityDuration, // 활동 시간 합계
            };
        });


        setDataChart1(processedData1);
        setinitialPlotlyData(processedData1);

        // activity_steps와 activity_duration의 합계 및 데이터 개수 계산
        const totalSteps = processedData1.reduce((sum, item) => sum + item.activity_steps, 0);
        const totalDuration = processedData1.reduce((sum, item) => sum + item.activity_duration, 0);
        const dataCount = processedData1.length;

        // 평균값 계산
        const avgStepsValue = parseFloat((totalSteps / dataCount).toFixed(2));
        const avgDurationValue = parseFloat((totalDuration / dataCount).toFixed(2));

        // 최소값, 최대값 계산 후 소수점 두 자리로 변환
        const minSteps = parseFloat(Math.min(...processedData1.map(item => item.activity_steps)).toFixed(2));
        const maxSteps = parseFloat(Math.max(...processedData1.map(item => item.activity_steps)).toFixed(2));

        const minDuration = parseFloat(Math.min(...processedData1.map(item => item.activity_duration)).toFixed(2));
        const maxDuration = parseFloat(Math.max(...processedData1.map(item => item.activity_duration)).toFixed(2));

        // 표준편차 계산 
        const stepsVariance = processedData1.reduce((sum, item) => {
            return sum + Math.pow(item.activity_steps - avgStepsValue, 2);
        }, 0) / dataCount;
        const stepsStdDev = parseFloat(Math.sqrt(stepsVariance).toFixed(2));

        // 표준편차 계산 
        const durationVariance = processedData1.reduce((sum, item) => {
            return sum + Math.pow(item.activity_duration - avgDurationValue, 2);
        }, 0) / dataCount;
        const durationStdDev = parseFloat(Math.sqrt(durationVariance).toFixed(2));

        setAvgSteps(avgStepsValue);
        setMinSteps(minSteps)
        setMaxSteps(maxSteps)
        setStdDevSteps(stepsStdDev)
        setAvgDuration(avgDurationValue);
        setMinDuration(minDuration)
        setMaxDuration(maxDuration)
        setStdDevDuration(durationStdDev)

        const processedData2 = calculateAverages(lastdata).map(item => ({
            date: item.date,
            HR: item.HR,
            oxygen_saturation: item.oxygen_saturation
        }));
        const totalHR = processedData2.reduce((sum, item) => sum + item.HR, 0);
        const totalOxygenSaturation = processedData2.reduce((sum, item) => sum + item.oxygen_saturation, 0);
        const dataCount2 = processedData2.length;
        const avgHRValue = parseFloat((totalHR / dataCount2).toFixed(2));
        const avgOxygenSaturationValue = parseFloat((totalOxygenSaturation / dataCount2).toFixed(2));
        const minHR = parseFloat(Math.min(...processedData2.map(item => item.HR)).toFixed(2));
        const maxHR = parseFloat(Math.max(...processedData2.map(item => item.HR)).toFixed(2));
        const minOxygenSaturation = parseFloat(Math.min(...processedData2.map(item => item.oxygen_saturation)).toFixed(2));
        const maxOxygenSaturation = parseFloat(Math.max(...processedData2.map(item => item.oxygen_saturation)).toFixed(2));
        const hrVariance = processedData2.reduce((sum, item) => sum + Math.pow(item.HR - avgHRValue, 2), 0) / dataCount2;
        const hrStdDev = parseFloat(Math.sqrt(hrVariance).toFixed(2));
        const oxygenSaturationVariance = processedData2.reduce((sum, item) => sum + Math.pow(item.oxygen_saturation - avgOxygenSaturationValue, 2), 0) / dataCount2;
        const oxygenSaturationStdDev = parseFloat(Math.sqrt(oxygenSaturationVariance).toFixed(2));

        setAvgHR(avgHRValue);
        setMinHR(minHR);
        setMaxHR(maxHR);
        setStdDevHR(hrStdDev);
        setAvgOxygenSaturation(avgOxygenSaturationValue);
        setMinOxygenSaturation(minOxygenSaturation);
        setMaxOxygenSaturation(maxOxygenSaturation);
        setStdDevOxygenSaturation(oxygenSaturationStdDev);

        setDataChart2(processedData2);



        const processedData3 = calculateAverages(lastdata).map((item) => {
            return {
                date: item.date, // 날짜 설정
                REM_sleep_duration: item.REM_sleep_duration != null ? item.REM_sleep_duration : 0, // null이면 0으로 설정
                deep_sleep_duration: item.deep_sleep_duration != null ? item.deep_sleep_duration : 0, // null이면 0으로 설정
                light_sleep_duration: item.light_sleep_duration != null ? item.light_sleep_duration : 0, // null이면 0으로 설정
                awake_duration: item.awake_duration != null ? item.awake_duration : 0, // null이면 0으로 설정
                total_sleep_duration: item.total_sleep_duration != null ? item.total_sleep_duration : 0, // null이면 0으로 설정
            };
        });

        // 전체 날짜 범위 생성 (2024-01-01부터 2024-01-31까지)
        const allDates: string[] = generateDateRange('2024-01-01', '2024-01-31');

        // 비어있는 날짜를 채우기
        const filledData = allDates.map(date => {
            // processedData3에서 해당 날짜 데이터를 찾음
            const existingData = processedData3.find(item => item.date === date);
            if (existingData) {
                return existingData; // 데이터가 있으면 그대로 사용
            } else {
                // 데이터가 없으면 0으로 채움
                return {
                    date,
                    REM_sleep_duration: 0,
                    deep_sleep_duration: 0,
                    light_sleep_duration: 0,
                    awake_duration: 0,
                    total_sleep_duration: 0,
                };
            }
        });

        // 데이터 설정
        setDataChart3(filledData);





        // 날짜 범위를 생성하는 함수
        function generateDateRange(startDate: string, endDate: string): string[] {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dates: string[] = [];

            // 시작 날짜부터 끝 날짜까지 반복하여 날짜를 추가
            while (start <= end) {
                dates.push(start.toISOString().split('T')[0]); // 'YYYY-MM-DD' 형식으로 날짜 추가
                start.setDate(start.getDate() + 1);
            }

            return dates;
        }

    }, [lastdata]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const generateAllDates = () => {
        const monthsSet = new Set<number>(); // 중복 방지를 위한 Set
        dataChart3.forEach((item: { date: string | number | Date; }) => {
            const date = new Date(item.date);
            monthsSet.add(date.getMonth() + 1); // 1부터 시작하므로 +1
        });

        const allDates: any[] = [];

        monthsSet.forEach(month => {
            const daysInMonth = getDaysInMonth(2024, month);
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                allDates.push({
                    date: dateStr,
                    REM_sleep_duration: null,
                    deep_sleep_duration: null,
                    light_sleep_duration: null,
                    awake_duration: null,
                });
            }
        });

        return allDates;
    };
    const mergedData = generateAllDates().map(dateItem => {
        const existingData = dataChart3.find((item: { date: any; }) => item.date === dateItem.date);
        return {
            date: dateItem.date,
            REM_sleep_duration: existingData ? existingData.REM_sleep_duration : null,
            deep_sleep_duration: existingData ? existingData.deep_sleep_duration : null,
            light_sleep_duration: existingData ? existingData.light_sleep_duration : null,
            awake_duration: existingData ? existingData.awake_duration : null,
        };
    });

    const monthDays = mergedData.reduce((acc, item) => {
        const date = new Date(item.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[yearMonth]) {
            acc[yearMonth] = 0; // 초기화
        }
        acc[yearMonth] += 1; // 해당 월에 일수 추가
        return acc;
    }, {} as Record<string, number>);

    const calculateAverages = (data: any[]) => {
        const groupedData: { [key: string]: GroupedValues } = data.reduce((acc: any, item: any) => {
            // item.start_time이 유효한지 체크
            const startTime = item.start_time;
            if (!startTime) return acc; // 유효하지 않으면 누적 결과 반환

            const startDate = new Date(startTime);
            if (isNaN(startDate.getTime())) return acc; // 날짜 변환이 실패하면 누적 결과 반환

            const formattedDate = startDate.toISOString().split('T')[0]; // 날짜만 추출

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
    useEffect(() => {
        const newPlotlyData: Data[] = [
            {
                x: dataChart1.map((item: { date: any }) => item.date),
                y: dataChart1.map((item: { totalSteps: any }) => item.totalSteps || 0),
                type: 'scatter',
                mode: 'lines',
                name: '하루 총 걸음수',
                line: { color: '#DD5353' },
                yaxis: 'y1',
            },
            {
                x: dataChart1.map((item: { date: any }) => item.date),
                y: dataChart1.map((item: { activity_duration: any }) => item.activity_duration || 0),
                type: 'scatter',
                mode: 'lines',
                name: '하루 총 활동 시간(분)',
                line: { color: '#5F9DF7' },
                yaxis: 'y2',
            },
        ];

        setPlotlyData(newPlotlyData);
    }, [dataChart1]);


    useEffect(() => {
        const newPlotlyData: Data[] = [
            {
                x: dataChart2.map((item: { date: any }) => item.date),
                y: dataChart2.map((item: { HR: any }) => item.HR || 0),
                type: 'scatter',
                mode: 'lines',
                name: '심박수',
                line: { color: '#DD5353' },
                yaxis: 'y1',
            },
            {
                x: dataChart2.map((item: { date: any }) => item.date),
                y: dataChart2.map((item: { oxygen_saturation: any }) => item.oxygen_saturation || 0),
                type: 'scatter',
                mode: 'lines',
                name: '산소포화도',
                line: { color: '#5F9DF7' },
                yaxis: 'y2',
            },
        ];
        setPlotlyData1(newPlotlyData);
    }, [dataChart2]);
    useEffect(() => {
        const newPlotlyData: Data[] = [
            {
                x: dataChart3.map((item: { date: any; }) => item.date),
                y: dataChart3.map((item: { REM_sleep_duration: any; }) => item.REM_sleep_duration ?? 0),  // Default to 0 if null or undefined
                type: 'bar',
                name: '렘수면',
                marker: { color: '#DD5353' },
                hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                yaxis: 'y1',
            },
            {
                x: dataChart3.map((item: { date: any; }) => item.date),
                y: dataChart3.map((item: { deep_sleep_duration: any; }) => item.deep_sleep_duration ?? 0),  // Default to 0 if null or undefined
                type: 'bar',
                name: '깊은 수면',
                marker: { color: '#5F9DF7' },
                hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                yaxis: 'y1',  // 모두 같은 y축을 사용하도록 설정
            },
            {
                x: dataChart3.map((item: { date: any; }) => item.date),
                y: dataChart3.map((item: { light_sleep_duration: any; }) => item.light_sleep_duration ?? 0),  // Default to 0 if null or undefined
                type: 'bar',
                name: '얕은 수면',
                marker: { color: '#FF7F0E' },
                hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                yaxis: 'y1',
            },
            {
                x: dataChart3.map((item: { date: any; }) => item.date),
                y: dataChart3.map((item: { awake_duration: any; }) => item.awake_duration ?? 0),  // Default to 0 if null or undefined
                type: 'bar',
                name: '각성 상태',
                marker: { color: '#0F0F70' },
                hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                yaxis: 'y1',
            },
        ];

        setPlotlyData2(newPlotlyData);  // Set the new plot data
    }, [dataChart3]);
    const initialLayout2: Partial<Layout> = {
        xaxis: {
            title: '',  // 날짜 또는 시간 기준으로 x축 타이틀 설정
            tickmode: 'linear',
            tickformat: '%Y-%m-%d',  // 기본적으로 날짜 형식으로 레이블 표시
            fixedrange: false,  // x축 드래그 및 확대/축소 활성화
        },
        yaxis: {
            title: '',  // 수면 시간의 지속 시간 (단위: 분)
            rangemode: 'tozero',
            tickformat: '.0f',
            tickvals: [0, 700],  // 첫 번째 값과 마지막 값만 표시, 예시로 0과 700 설정
            ticktext: ['0', '700'],  // y축 단위를 0과 700으로 표시
            showticklabels: false,  // y축 레이블 숨기기
            ticks: '',  // y축 눈금 숨기기
            showgrid: false,  // y축 그리드 숨기기
            range: [0, 700],  // y축 범위 설정 (최대 700)
            tickangle: 0,  // 레이블 각도 0으로 고정하여 이동 방지
            automargin: true,  // 마진 자동으로 설정하여 레이블이 움직이지 않게 함
            fixedrange: true,  // y축 드래그 비활성화 (세로 축은 확대/축소 불가)
        },
        barmode: 'stack',  // Stack the bars to show different sleep stages together
        showlegend: true,
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.2,
            yanchor: 'bottom',
        },
        autosize: true,
        plot_bgcolor: 'rgba(0, 0, 0, 0)',  // Transparent background for the plot
        paper_bgcolor: 'rgba(0, 0, 0, 0)',  // Transparent paper background
    };

    // 상태로 초기값 설정
    const [layout2, setLayout2] = useState<Partial<Layout>>(initialLayout2);
    const handleZoom2 = (event: any) => {
        console.log("동작 : " , event)
        if (event["xaxis.autorange"] === true && event["xaxis.showspikes"] === false) {
            console.log("홈버튼클릭");
            setLayout2({
                ...initialLayout2,
                xaxis: {
                    ...initialLayout2.xaxis,
                    tickformat: '%Y-%m-%d', // 홈 버튼 클릭 시 날짜 형식으로 설정
                },
            });
    
            const newPlotlyData: Data[] = [
                {
                    x: dataChart3.map((item: { date: any; }) => item.date),
                    y: dataChart3.map((item: { REM_sleep_duration: any; }) => item.REM_sleep_duration ?? 0),  // Default to 0 if null or undefined
                    type: 'bar',
                    name: '렘수면',
                    marker: { color: '#DD5353' },
                    hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                    yaxis: 'y1',
                },
                {
                    x: dataChart3.map((item: { date: any; }) => item.date),
                    y: dataChart3.map((item: { deep_sleep_duration: any; }) => item.deep_sleep_duration ?? 0),  // Default to 0 if null or undefined
                    type: 'bar',
                    name: '깊은 수면',
                    marker: { color: '#5F9DF7' },
                    hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                    yaxis: 'y1',  // 모두 같은 y축을 사용하도록 설정
                },
                {
                    x: dataChart3.map((item: { date: any; }) => item.date),
                    y: dataChart3.map((item: { light_sleep_duration: any; }) => item.light_sleep_duration ?? 0),  // Default to 0 if null or undefined
                    type: 'bar',
                    name: '얕은 수면',
                    marker: { color: '#FF7F0E' },
                    hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                    yaxis: 'y1',
                },
                {
                    x: dataChart3.map((item: { date: any; }) => item.date),
                    y: dataChart3.map((item: { awake_duration: any; }) => item.awake_duration ?? 0),  // Default to 0 if null or undefined
                    type: 'bar',
                    name: '각성 상태',
                    marker: { color: '#0F0F70' },
                    hoverinfo: 'x+y+name',  // x, y, name을 hover시 표시
                    yaxis: 'y1',
                },
            ];
    
            setPlotlyData2(newPlotlyData); // 초기 데이터로 재설정
            return; // 줌을 리셋한 후 추가 작업을 하지 않도록 종료
        }
    
        const startDateStr = event["xaxis.range[0]"];
        const endDateStr = event["xaxis.range[1]"];
        console.log("startDateStr : " + startDateStr);
        console.log("endDateStr : " + endDateStr);
    
        if (startDateStr && endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
    
            // lastdata를 줌 범위로 필터링
            const filteredData = lastdata.filter((item: { start_time: string; end_time: string }) => {
                const itemStartTime = new Date(item.start_time.replace(/-/g, '/')); // "-"를 "/"로 바꿔서 Date 객체로 변환
                const itemEndTime = new Date(item.end_time.replace(/-/g, '/'));   // "-"를 "/"로 바꿔서 Date 객체로 변환
                return itemStartTime >= startDate && itemEndTime <= endDate;
            });
    
            // 필터링된 데이터를 사용하여 새로운 Plotly 데이터 생성
            const newPlotlyData: Data[] = [
                {
                    x: filteredData.map((item: { start_time: string }) => item.start_time),
                    y: filteredData.map((item: { REM_sleep_duration: number }) => item.REM_sleep_duration ?? 0),
                    type: 'bar',
                    name: '렘수면',
                    marker: { color: '#DD5353' },
                    hoverinfo: 'x+y+name',
                    yaxis: 'y1',
                },
                {
                    x: filteredData.map((item: { start_time: string }) => item.start_time),
                    y: filteredData.map((item: { deep_sleep_duration: number }) => item.deep_sleep_duration ?? 0),
                    type: 'bar',
                    name: '깊은 수면',
                    marker: { color: '#5F9DF7' },
                    hoverinfo: 'x+y+name',
                    yaxis: 'y1',
                },
                {
                    x: filteredData.map((item: { start_time: string }) => item.start_time),
                    y: filteredData.map((item: { light_sleep_duration: number }) => item.light_sleep_duration ?? 0),
                    type: 'bar',
                    name: '얕은 수면',
                    marker: { color: '#FF7F0E' },
                    hoverinfo: 'x+y+name',
                    yaxis: 'y1',
                },
                {
                    x: filteredData.map((item: { start_time: string }) => item.start_time),
                    y: filteredData.map((item: { awake_duration: number }) => item.awake_duration ?? 0),
                    type: 'bar',
                    name: '각성 상태',
                    marker: { color: '#0F0F70' },
                    hoverinfo: 'x+y+name',
                    yaxis: 'y1',
                },
            ];
    
            setPlotlyData2(newPlotlyData); // 새로운 데이터로 업데이트
    
            // 줌 이벤트 후 x축 레이블을 날짜 + 시간 단위로 변경
            setLayout2({
                ...layout2,
                xaxis: {
                    ...layout2.xaxis,
                    tickformat: '%Y-%m-%d %H:%M', // 날짜와 시간 형식으로 레이블 표시
                    showticklabels: true, // x축 레이블 활성화
                    tickmode: 'auto',
                },
                yaxis: {
                    ...layout2.yaxis,
                    range: [0, 30], // y축 최대값을 30으로 설정
                },
            });
        }
    };
    
    














    const initialLayout1: Partial<Layout> = {
        xaxis: {
            title: '',
            tickformat: '%Y-%m-%d',
            tickmode: 'linear',
        },
        yaxis: {
            title: '심박수',
            rangemode: 'tozero',
            tickformat: '.0f',
        },
        yaxis2: {
            title: '산소포화도',
            overlaying: 'y',
            side: 'right',
            rangemode: 'tozero',
            tickformat: '.0f',
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.2,
            yanchor: 'bottom',
        },
        autosize: true,
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
    };


    // 상태로 초기값 설정
    const [layout1, setLayout1] = useState<Partial<Layout>>(initialLayout1);

    const handleZoom1 = (event: any) => {
        if (event["xaxis.autorange"] && event["yaxis.autorange"]) {
            setLayout1(initialLayout1);

            const processedData2 = calculateAverages(lastdata).map(item => ({
                date: item.date,
                HR: item.HR,
                oxygen_saturation: item.oxygen_saturation
            }));
            // HR와 oxygen_saturation에 대한 통계 값 계산
            const totalHR = processedData2.reduce((sum, item) => sum + item.HR, 0);
            const totalOxygenSaturation = processedData2.reduce((sum, item) => sum + item.oxygen_saturation, 0);
            const dataCount2 = processedData2.length;

            // 평균값 계산
            const avgHRValue = parseFloat((totalHR / dataCount2).toFixed(2));
            const avgOxygenSaturationValue = parseFloat((totalOxygenSaturation / dataCount2).toFixed(2));

            // 최소값, 최대값 계산
            const minHR = parseFloat(Math.min(...processedData2.map(item => item.HR)).toFixed(2));
            const maxHR = parseFloat(Math.max(...processedData2.map(item => item.HR)).toFixed(2));
            const minOxygenSaturation = parseFloat(Math.min(...processedData2.map(item => item.oxygen_saturation)).toFixed(2));
            const maxOxygenSaturation = parseFloat(Math.max(...processedData2.map(item => item.oxygen_saturation)).toFixed(2));

            // 표준편차 계산 (HR)
            const hrVariance = processedData2.reduce((sum, item) => sum + Math.pow(item.HR - avgHRValue, 2), 0) / dataCount2;
            const hrStdDev = parseFloat(Math.sqrt(hrVariance).toFixed(2));

            // 표준편차 계산 (oxygen_saturation)
            const oxygenSaturationVariance = processedData2.reduce((sum, item) => sum + Math.pow(item.oxygen_saturation - avgOxygenSaturationValue, 2), 0) / dataCount2;
            const oxygenSaturationStdDev = parseFloat(Math.sqrt(oxygenSaturationVariance).toFixed(2));

            setAvgHR(avgHRValue);
            setMinHR(minHR);
            setMaxHR(maxHR);
            setStdDevHR(hrStdDev);

            setAvgOxygenSaturation(avgOxygenSaturationValue);
            setMinOxygenSaturation(minOxygenSaturation);
            setMaxOxygenSaturation(maxOxygenSaturation);
            setStdDevOxygenSaturation(oxygenSaturationStdDev);
            setDataChart2(processedData2);

            return;
        }
        const startDateStr = event["xaxis.range[0]"];
        const endDateStr = event["xaxis.range[1]"];

        if (startDateStr && endDateStr) {

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            setLayout1(prevLayout => ({
                ...prevLayout,
                xaxis: {
                    ...prevLayout.xaxis,
                    tickformat: '%Y-%m-%d %H:%M', // 확대된 상태에서는 날짜와 시간을 표시
                    type: 'date', // x축을 날짜 타입으로 설정
                    tickmode: 'auto', // 자동으로 tick 간격 조정
                },
                yaxis: {
                    ...prevLayout.yaxis,
                    range: [0, 200], // 심박수 최대값을 200으로 설정
                },
            }));

            const filteredData = lastdata.filter(item => {
                const itemStartTime = new Date(item.start_time.replace(/-/g, '/')); // "-"를 "/"로 바꿔서 Date 객체로 변환
                const itemEndTime = new Date(item.end_time.replace(/-/g, '/'));   // "-"를 "/"로 바꿔서 Date 객체로 변환
                return itemStartTime >= startDate && itemEndTime <= endDate;
            });

            const groupedData = groupDataByTenMinutes(filteredData);

            // 그룹화된 데이터를 차트 데이터 형식으로 변환
            const plotlyData = [
                {
                    x: groupedData.map(item => item.date),
                    y: groupedData.map(item => item.HR),
                    type: 'scatter',
                    mode: 'lines',
                    name: '심박수',
                    line: { color: '#DD5353' },
                    yaxis: 'y1',
                },
                {
                    x: groupedData.map(item => item.date),
                    y: groupedData.map(item => item.oxygen_saturation),
                    type: 'scatter',
                    mode: 'lines',
                    name: '산소포화도',
                    line: { color: '#5F9DF7' },
                    yaxis: 'y2',
                },
            ];

            // 업데이트된 데이터를 Plotly 차트에 반영
            setPlotlyData1(plotlyData);
        }
    };


    // 초기 레이아웃 정의
    const initialLayout: Partial<Layout> = {
        xaxis: {
            title: '',
            tickformat: '%Y-%m-%d', // 기본적으로 날짜만 표시
            tickmode: 'linear', // 'linear'는 Plotly.js에서 valid한 값입니다.
            // rangeslider: {
            //     visible: true, // 슬라이더를 보이게 설정
            // },
        },
        yaxis: {
            title: '걸음수',
            rangemode: 'tozero', // 'tozero'는 Plotly.js에서 valid한 값입니다.
            tickformat: '.0f',
        },
        yaxis2: {
            title: '활동 시간(분)',
            overlaying: 'y', // 'y'는 valid한 값입니다.
            side: 'right',
            rangemode: 'tozero', // 'tozero'는 Plotly.js에서 valid한 값입니다.
            tickformat: '.0f',
        },
        showlegend: true,
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.2, // 범례를 그래프 위로 이동
            yanchor: 'bottom',
        },
        autosize: true,
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
    };


    // 상태로 초기값 설정
    const [layout, setLayout] = useState<Partial<Layout>>(initialLayout);

    // 드래그 또는 확대 시 해당 범위에 맞는 데이터를 로드
    const handleZoom = (event: any) => {
        // console.log("Relayout 이벤트 발생:", event);
        if (event["xaxis.autorange"] && event["yaxis.autorange"]) {
            // console.log("홈 버튼 클릭 감지: 초기 상태로 되돌립니다.");

            setLayout(initialLayout); // 초기 레이아웃으로 복원

            // 데이터를 날짜별로 집계하고 필터링 후 최종 데이터 처리
            const dailyData = lastdata.reduce((acc, item) => {
                const date = item.start_time.split(" ")[0]; // 'YYYY-MM-DD' 형식
                const stepsSum = item.activity_steps + item.exercise_steps;

                if (!acc[date]) {
                    acc[date] = {
                        totalSteps: 0,
                        records: [],
                    };
                }
                acc[date].totalSteps += stepsSum;
                acc[date].records.push(item);

                return acc;
            }, {} as Record<string, { totalSteps: number; records: any[] }>);

            // 필터링 조건에 맞는 데이터만 저장
            const processedData = Object.keys(dailyData)
                .filter(date => dailyData[date].totalSteps) // 총 걸음수가 있는 날짜만
                .map(date => {
                    const dayData = dailyData[date];
                    const totalSteps = dayData.totalSteps;
                    const activityDuration = dayData.records.reduce((sum: any, record: { activity_duration: any; }) => sum + record.activity_duration, 0); // 활동 시간 합계

                    return {
                        date: date, // 날짜
                        totalSteps: totalSteps, // 총 걸음수
                        activity_duration: activityDuration, // 활동 시간 합계
                    };
                });

            setDataChart1(processedData); // 필터링된 데이터 상태로 설정
            // console.log("줌인전 데이터 저장:", processedData);

            return;
        }

        // Zoom된 날짜 범위 가져오기
        const startDateStr = event["xaxis.range[0]"];
        const endDateStr = event["xaxis.range[1]"];

        if (startDateStr && endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            setLayout(prevLayout => ({
                ...prevLayout,
                xaxis: {
                    ...prevLayout.xaxis,
                    tickformat: '%Y-%m-%d %H:%M', // 확대된 상태에서는 날짜와 시간을 표시
                    type: 'date', // x축을 날짜 타입으로 설정
                    tickmode: 'auto', // 자동으로 tick 간격 조정
                },
            }));

            const filteredData = lastdata.filter(item => {
                const itemStartTime = new Date(item.start_time.replace(/-/g, '/')); // "-"를 "/"로 바꿔서 Date 객체로 변환
                const itemEndTime = new Date(item.end_time.replace(/-/g, '/'));   // "-"를 "/"로 바꿔서 Date 객체로 변환
                return itemStartTime >= startDate && itemEndTime <= endDate;
            });

            const groupedData = groupDataByTenMinutes(filteredData);
            const plotlyData = [
                {
                    x: groupedData.map(item => item.date),
                    y: groupedData.map(item => item.totalSteps),
                    type: 'scatter',
                    mode: 'lines',
                    name: '하루 총 걸음수',
                    line: { color: '#DD5353' },
                    yaxis: 'y1',
                },
                {
                    x: groupedData.map(item => item.date),
                    y: groupedData.map(item => item.activityDuration),
                    type: 'scatter',
                    mode: 'lines',
                    name: '하루 총 활동 시간(분)',
                    line: { color: '#5F9DF7' },
                    yaxis: 'y2',
                },
            ];
            setPlotlyData(plotlyData);



        }




    };

    const groupDataByTenMinutes = (data: any[]) => {
        const grouped: any[] = [];
        let currentGroup: any = null;
        let currentHRCount = 0;
        let currentOxygenSaturationCount = 0;

        data.forEach((item) => {
            const itemDate = new Date(item.start_time);
            const roundedTime = new Date(Math.floor(itemDate.getTime() / (10 * 60 * 1000)) * (10 * 60 * 1000));
            if (!currentGroup || currentGroup.date.getTime() !== roundedTime.getTime()) {
                if (currentGroup) {
                    currentGroup.HR = currentGroup.HR / currentHRCount || 0;
                    currentGroup.oxygen_saturation = currentGroup.oxygen_saturation / currentOxygenSaturationCount || 0;
                    grouped.push(currentGroup);
                }
                currentGroup = {
                    date: roundedTime,
                    totalSteps: 0,
                    activityDuration: 0,
                    HR: 0,
                    oxygen_saturation: 0
                };
                currentHRCount = 0;
                currentOxygenSaturationCount = 0;
            }

            currentGroup.totalSteps += (item.activity_steps || 0) + (item.exercise_steps || 0);
            currentGroup.activityDuration += item.activity_duration || 0;

            if (item.HR) {
                currentGroup.HR += item.HR || 0;
                currentHRCount += 1;
            }

            if (item.oxygen_saturation) {
                currentGroup.oxygen_saturation += item.oxygen_saturation || 0;
                currentOxygenSaturationCount += 1;
            }
        });

        if (currentGroup) {
            currentGroup.HR = currentGroup.HR / currentHRCount || 0;
            currentGroup.oxygen_saturation = currentGroup.oxygen_saturation / currentOxygenSaturationCount || 0;
            grouped.push(currentGroup);
        }

        return grouped;
    };

    const mixData3 = {
        labels: mergedData.map((_, idx) => idx + 1),
        datasets: [
            {
                label: '램수면',
                data: mergedData.map((item) => item.REM_sleep_duration || 0),
                backgroundColor: '#D62728',
            },
            {
                label: '깊은 수면',
                data: mergedData.map((item) => item.deep_sleep_duration || 0),
                backgroundColor: '#2CA02C',
            },
            {
                label: '얕은 수면',
                data: mergedData.map((item) => item.light_sleep_duration || 0),
                backgroundColor: '#FF7F0E',
            },
            {
                label: '각성 상태',
                data: mergedData.map((item) => item.awake_duration || 0),
                backgroundColor: '#0F0F70',
            },
        ],
    };



    const maxYValue = Math.max(
        ...mergedData.map(item =>
            Math.max(
                item.REM_sleep_duration || 0,
                item.deep_sleep_duration || 0,
                item.light_sleep_duration || 0,
                item.awake_duration || 0
            )
        )
    );
    const options3: ChartOptions<'bar'> = {
        plugins: {
            tooltip: {
                callbacks: {
                    title: (tooltipItems: TooltipItem<'bar'>[]) => {
                        const index = tooltipItems[0]?.dataIndex;
                        if (index !== undefined && mergedData[index]?.date) {
                            return `Date: ${mergedData[index].date}`;
                        }
                        return 'No date available';
                    },
                    label: (tooltipItem: TooltipItem<'bar'>) => {
                        const datasetLabel = tooltipItem.dataset.label || '';
                        const value = tooltipItem.raw;
                        return `${datasetLabel}: ${value}`;
                    },
                },
            },
        },
        scales: {
            y: {
                min: 0,
                max: maxYValue + 500,
                ticks: {
                    stepSize: 2500,
                },
            },
            x: {
                stacked: true,
                ticks: {
                    autoSkip: false,
                    callback: function (value: any, index: number) {
                        if (mergedData[index]) {
                            const dateString = mergedData[index].date;
                            let date;

                            if (dateString) {
                                const parts = dateString.split('-');
                                date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
                            } else {
                                date = new Date(); // 기본값
                            }

                            const yearMonth = `${date.getFullYear()}.${date.getMonth() + 1}`;
                            return index % 32 === 16 ? yearMonth : '';
                        }
                        return '';
                    },
                    maxRotation: 0,
                    minRotation: 0,
                },
                grid: {
                    color: (context: { index: number }) => {
                        const index = context.index;
                        const monthLengths = Object.values(monthDays);
                        let monthStartIndex = 0;

                        for (const monthLength of monthLengths) {
                            if (index === monthStartIndex) {
                                return 'black';
                            }
                            monthStartIndex += monthLength;
                        }
                        return 'rgba(0, 0, 0, 0.1)';
                    },
                    lineWidth: (context: { index: number }) => {
                        const index = context.index;
                        const monthLengths = Object.values(monthDays);
                        let monthStartIndex = 0;

                        for (const monthLength of monthLengths) {
                            if (index === monthStartIndex) {
                                return 0.5;
                            }
                            monthStartIndex += monthLength;
                        }
                        return 1;
                    },
                },
            },
        },
    };


    return (
        <div className="main-content d-flex" style={{ flexDirection: 'row' }}>
            <div
                className="dataexploration_box"
                style={{
                    flex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',

                }}
            >
                {/* 활동 데이터 */}
                <div style={{ flexGrow: 1, height: '400px', marginBottom: "50px" }}>
                    <h3 style={{ margin: 0, padding: '0 0 10px 0' }}>활동 데이터</h3>
                    <Plot
                        data={plotlyData}
                        layout={layout}
                        config={{ responsive: true }}
                        style={{ width: '100%', height: '100%' }}
                        onRelayout={handleZoom}
                    />
                </div>
                {/* 생체 데이터 */}
                <div style={{ flexGrow: 1, height: '400px', marginBottom: "50px" }}>
                    <h3 style={{ margin: 0, padding: '0 0 10px 0' }}>생체 데이터</h3>
                    <Plot
                        data={plotlyData1}
                        layout={layout1}
                        config={{ responsive: true }}
                        style={{ width: '100%', height: '100%' }}
                        onRelayout={handleZoom1}
                    />
                </div>
                {/* 수면 데이터 */}
                <div style={{ flexGrow: 1, height: '400px', marginBottom: "50px" }}>
                    <h3 style={{ margin: 0, padding: '0 0 10px 0' }}>수면 데이터</h3>
                    <Plot
                        data={plotlyData2}  // Use the correct data for sleep
                        layout={layout2}    // Use the correct layout for sleep data
                        config={{ responsive: true }}
                        style={{ width: '100%', height: '100%' }}
                        onRelayout={handleZoom2}  // Use the correct zoom handler for sleep data
                    />
                </div>
            </div>

            <div
                className="dataexploration_info_box"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0 20px',
                }}
            >
                <div className="summary-section">
                    {/* 활동 데이터 요약 */}
                    <div className="summary-box mb-4 p-1 border">
                        <h5>활동 데이터 요약</h5>
                        <p>선택한 날짜, 기준 반영</p>
                        <h6>활동 시간 요약</h6>
                        <div style={{ border: '1px solid black', padding: '10px' }}>
                            <p>
                                평균:{' '}
                                {isNaN(avgSteps) || !isFinite(avgSteps)
                                    ? 0
                                    : avgSteps}
                                , 표준편차:{' '}
                                {isNaN(stdDevSteps) || !isFinite(stdDevSteps)
                                    ? 0
                                    : stdDevSteps}
                            </p>
                            <p>
                                최대값:{' '}
                                {isNaN(maxSteps) || !isFinite(maxSteps)
                                    ? 0
                                    : maxSteps}
                                , 최소값:{' '}
                                {isNaN(minSteps) || !isFinite(minSteps)
                                    ? 0
                                    : minSteps}
                            </p>
                        </div>
                        <h6>걸음 수 요약</h6>
                        <div style={{ border: '1px solid black', padding: '10px' }}>
                            <p>
                                평균:{' '}
                                {isNaN(avgDuration) || !isFinite(avgDuration)
                                    ? 0
                                    : avgDuration}
                                , 최대값:{' '}
                                {isNaN(maxDuration) || !isFinite(maxDuration)
                                    ? 0
                                    : maxDuration}
                            </p>
                            <p>
                                표준편차:{' '}
                                {isNaN(stdDevDuration) || !isFinite(stdDevDuration)
                                    ? 0
                                    : stdDevDuration}
                                , 최소값:{' '}
                                {isNaN(minDuration) || !isFinite(minDuration)
                                    ? 0
                                    : minDuration}
                            </p>
                        </div>
                    </div>

                    {/* 생체 데이터 요약 */}
                    <div className="summary-box mb-4 p-1 border">
                        <h5>생체 데이터 요약</h5>
                        <p>선택한 날짜, 기준 반영</p>
                        <h6>심박수 요약</h6>
                        <div style={{ border: '1px solid black', padding: '10px' }}>
                            <p>
                                평균:{' '}
                                {isNaN(avgHR) || !isFinite(avgHR) ? 0 : avgHR},
                                최대값:{' '}
                                {isNaN(maxHR) || !isFinite(maxHR) ? 0 : maxHR}
                            </p>
                            <p>
                                표준편차:{' '}
                                {isNaN(stdDevHR) || !isFinite(stdDevHR)
                                    ? 0
                                    : stdDevHR}
                                , 최소값:{' '}
                                {isNaN(minHR) || !isFinite(minHR) ? 0 : minHR}
                            </p>
                        </div>
                        <h6>산소포화도 요약</h6>
                        <div style={{ border: '1px solid black', padding: '10px' }}>
                            <p>
                                평균:{' '}
                                {isNaN(avgOxygenSaturation) ||
                                    !isFinite(avgOxygenSaturation)
                                    ? 0
                                    : avgOxygenSaturation}
                                , 최대값:{' '}
                                {isNaN(maxOxygenSaturation) ||
                                    !isFinite(maxOxygenSaturation)
                                    ? 0
                                    : maxOxygenSaturation}
                            </p>
                            <p>
                                표준편차:{' '}
                                {isNaN(stdDevOxygenSaturation) ||
                                    !isFinite(stdDevOxygenSaturation)
                                    ? 0
                                    : stdDevOxygenSaturation}
                                , 최소값:{' '}
                                {isNaN(minOxygenSaturation) ||
                                    !isFinite(minOxygenSaturation)
                                    ? 0
                                    : minOxygenSaturation}
                            </p>
                        </div>
                    </div>

                    {/* 수면 데이터 요약 */}
                    <div className="summary-box mb-4 p-1 border">
                        <h5>수면 데이터 요약</h5>
                        <p>선택한 날짜, 기준 반영</p>
                        <h6>수면 시간 요약</h6>
                        <div style={{ border: '1px solid black', padding: '10px' }}>
                            <p>
                                평균:{' '}
                                {isNaN(avgSleep) || !isFinite(avgSleep)
                                    ? 0
                                    : avgSleep}
                                , 최대값:{' '}
                                {isNaN(maxSleep) || !isFinite(maxSleep)
                                    ? 0
                                    : maxSleep}
                            </p>
                            <p>
                                표준편차:{' '}
                                {isNaN(stdDevSleep) || !isFinite(stdDevSleep)
                                    ? 0
                                    : stdDevSleep}
                                , 최소값:{' '}
                                {isNaN(minSleep) || !isFinite(minSleep)
                                    ? 0
                                    : minSleep}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default DataExploration;
