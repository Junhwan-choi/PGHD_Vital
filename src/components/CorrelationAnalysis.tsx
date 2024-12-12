import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Row, Col, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/CorrelationAnalysis.css'; // CSS 파일 임포트
import 'chart.js/auto';
import { savelastdata } from '../atoms';
import { useRecoilState } from 'recoil';
import { ChartData } from 'chart.js';
import jStat from 'jstat'; // P-Value 계산에 필요한 jStat 라이브러리

interface DataPoint {
    [key: string]: number;
}

const CorrelationAnalysis: React.FC = () => {
    const [xVariable, setXVariable] = useState<string>('활동 걸음 수');
    const [yVariable, setYVariable] = useState<string>('운동 걸음 수');
    const [showTrendLine, setShowTrendLine] = useState<boolean>(true);
    const [scatterData, setScatterData] = useState<ChartData<'scatter'>>({
        datasets: [],
    });
    const [lastdata, setLastdata] = useRecoilState(savelastdata);
    const [correlationInfo, setCorrelationInfo] = useState({
        correlation: 0,
        pValue: 0,
    });

    const variableMapping: { [key: string]: string } = {
        '활동 걸음 수': 'activity_steps',
        '운동 걸음 수': 'exercise_steps',
        '심박수': 'HR',
        '산소포화도 수치': 'oxygen_saturation',
        '수면 시간': 'total_sleep_duration',
    };

    const getEnglishVariable = (variable: string): string => variableMapping[variable];

    const mean = (arr: number[]): number => arr.reduce((sum, value) => sum + value, 0) / arr.length;

    const covariance = (x: number[], y: number[], xMean: number, yMean: number): number =>
        x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0) / x.length;

    const variance = (arr: number[], mean: number): number =>
        arr.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / arr.length;

    const correlation = (x: number[], y: number[]): number => {
        const xMean = mean(x);
        const yMean = mean(y);
        const cov = covariance(x, y, xMean, yMean);
        return cov / (Math.sqrt(variance(x, xMean)) * Math.sqrt(variance(y, yMean)));
    };

    const linearRegression = (x: number[], y: number[]) => {
        const xMean = mean(x);
        const yMean = mean(y);
        const slope = covariance(x, y, xMean, yMean) / variance(x, xMean);
        const intercept = yMean - slope * xMean;
        return { slope, intercept };
    };

    const calculatePValue = (n: number, r: number): number => {
        const tStatistic = Math.abs(r * Math.sqrt((n - 2) / (1 - r * r)));
        return 2 * (1 - jStat.studentt.cdf(tStatistic, n - 2));
    };

    useEffect(() => {
        if (lastdata.length > 0) {
            const filteredData = lastdata.filter((item) => {
                const xValue = item[getEnglishVariable(xVariable)];
                const yValue = item[getEnglishVariable(yVariable)];
                return (
                    !isNaN(xValue) &&
                    !isNaN(yValue) &&
                    xValue !== 0 &&
                    yValue !== 0
                );
            });

            const xData = filteredData.map((item) => item[getEnglishVariable(xVariable)]);
            const yData = filteredData.map((item) => item[getEnglishVariable(yVariable)]);

            if (xData.length && yData.length) {
                const { slope, intercept } = linearRegression(xData, yData);
                const regressionLine = xData.map((x) => ({
                    x,
                    y: slope * x + intercept,
                }));

                const corr = correlation(xData, yData);
                const pValue = calculatePValue(xData.length, corr);

                setCorrelationInfo({ correlation: corr, pValue });

                setScatterData({
                    datasets: [
                        {
                            label: '상관관계 데이터',
                            data: xData.map((x, i) => ({ x, y: yData[i] })),
                            backgroundColor: 'rgba(75,192,192,1)',
                            pointRadius: 5,
                        },
                        ...(showTrendLine
                            ? [
                                {
                                    label: '회귀선',
                                    data: regressionLine,
                                    type: 'line',
                                    borderColor: 'rgba(255,99,132,1)',
                                    fill: false,
                                    borderWidth: 2,
                                    pointRadius: 0,
                                } as any,
                            ]
                            : []),
                    ],
                });
            }
        }
    }, [lastdata, xVariable, yVariable, showTrendLine]);

    const handleXVariableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedX = e.target.value;
        if (selectedX !== yVariable) setXVariable(selectedX);
    };

    const handleYVariableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedY = e.target.value;
        if (selectedY !== xVariable) setYVariable(selectedY);
    };

    const handleTrendLineToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowTrendLine(e.target.checked);
    };

    return (
        <div className="main-content d-flex flex-column">
            <div className="CorrelationAnalysis_box">
                <h3>상관분석</h3>
                <p>X, Y 축 변수를 선택하고 추세선 표시 여부를 조정하세요.</p>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="xVariable">
                            <Form.Label>X축 변수</Form.Label>
                            <Form.Select value={xVariable} onChange={handleXVariableChange}>
                                {Object.keys(variableMapping).map((variable) => (
                                    <option key={variable} value={variable}>
                                        {variable}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="yVariable">
                            <Form.Label>Y축 변수</Form.Label>
                            <Form.Select value={yVariable} onChange={handleYVariableChange}>
                                {Object.keys(variableMapping).map((variable) => (
                                    <option key={variable} value={variable}>
                                        {variable}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group controlId="trendLineToggle" className="mt-3">
                    <Form.Check
                        type="checkbox"
                        label="추세선 표시"
                        checked={showTrendLine}
                        onChange={handleTrendLineToggle}
                    />
                </Form.Group>
            </div>

            <div className="CorrelationAnalysis_box">
                <div style={{ width: '70%', height: '300px' }}>
                    <Scatter data={scatterData} options={{ responsive: true }} />
                </div>
                <div className="mt-3">
                    <p>
                        상관계수: {correlationInfo.correlation.toFixed(2)}{' '}
                        (P-Value: {correlationInfo.pValue < 0.001 ? correlationInfo.pValue.toFixed(2) : correlationInfo.pValue.toFixed(2)})
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CorrelationAnalysis;
