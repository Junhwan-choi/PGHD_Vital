import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Home.css'; // CSS 파일 임포트
import { CustomResponse } from '../types/user.type';
import { CustomAxios } from '../services/api';
import DownloadIcon from '@mui/icons-material/Download';
import ReactPaginate from 'react-paginate';
import CSVReader from 'react-csv-reader';
import Preprocess from './Preprocess';
import { useRecoilState } from 'recoil'; // Recoil을 사용하기 위해 추가
import { filecreatetimeSave, preprocessStatusState, tokenSave, savelastdata, saverowlastdata } from '../atoms';
import DataStatus from './DataStatus';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // 꺽쇠 아이콘 임포트
import ArrowRightIcon from '@mui/icons-material/ArrowRight'; // 오른쪽 화살표 아이콘 임포트
import DataOverview from './DataOverview'; // DataOverview 컴포넌트 임포트
import DataExploration from './DataExploration';
import DataQualityIndex from './DataQualityIndex';
import CorrelationAnalysis from './CorrelationAnalysis';
import ExportData from './ExportData';
import VitalInfo from './VitalInfo';
import PreprocessComplet from './PreprocessComplet';
import { saveemail } from '../atoms';
import { red } from '@mui/material/colors';
const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지당 표시할 항목 수
  const [selectedModule, setSelectedModule] = useState('dataProcessing');
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(true); // 하위 메뉴 표시 상태
  const [preprocessStatus, setPreprocessStatus] = useRecoilState(preprocessStatusState);
  const [filecreatetime, setFilecreatetime] = useRecoilState(filecreatetimeSave);
  const [token, setToken] = useRecoilState(tokenSave);
  const [data, setData] = useState<{ number: string; uploadday: string; filename: string }[]>([]);
  const [isExplorationPeriodVisible, setIsExplorationPeriodVisible] = useState(true); // 탐색기간 토글 상태
  const [isDataQualityVisible, setIsDataQualityVisible] = useState(true); // 데이터 질관리 토글 상태
  const [loginemail, setLoginEmail] = useRecoilState(saveemail);
  const [lastdata, setLastdata] = useRecoilState(savelastdata);
  const [rowlastdata, setRowLastdata] = useRecoilState(saverowlastdata);

  const today = new Date().toISOString().split("T")[0]; // 오늘 날짜 가져오기

  const [startDate1, setStartDate1] = useState('');
  const [endDate1, setEndDate1] = useState('');
  const [selectDate1, setSelectDate1] = useState('');
  const [startDate2, setStartDate2] = useState('');
  const [endDate2, setEndDate2] = useState('');
  const [selectDate2, setSelectDate2] = useState('');
  const [filters, setFilters] = useState({
    startDate: '', // 날짜 필터 시작일
    endDate: '',   // 날짜 필터 종료일
    stepThreshold: 0, // 걸음수 필터 기준값
    activeHourThreshold: 0, // 착용 시간 필터 기준값
  });


  interface DataItem {
    start_time: string;
    end_time: string;
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
    applyFilters();
  }, [filters]);



  const updateFilter = (key: string, value: any) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, [key]: value };
      return updatedFilters;
    });
  };
  const applyFilters = () => {
    let filteredData = rowlastdata;

    // 날짜 필터
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.start_time);
        itemDate.setHours(0, 0, 0, 0);

        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    if (filters.stepThreshold > 0) {

      const dailyData = filteredData.reduce((acc, item) => {
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
      const filteredDates = Object.keys(dailyData)
        .filter(date => {
          const isAboveThreshold = dailyData[date].totalSteps > filters.stepThreshold;
          return isAboveThreshold;
        });
      filteredData = filteredDates.flatMap(date => {
        return dailyData[date].records;
      });
    }

    if (filters.activeHourThreshold > 0) {
      const dailyHours = calculateDailyActiveHours(filteredData);
      const filteredDates = Object.entries(dailyHours)
        .filter(([date, hours]) => parseFloat(hours) > filters.activeHourThreshold)
        .map(([date]) => date);
      filteredData = filteredData.filter(item => {
        const itemDate = item.start_time.split(' ')[0];
        const isIncluded = filteredDates.includes(itemDate);
        return isIncluded;
      });
    }
    setLastdata(filteredData);
  };

  useEffect(() => {
    setToken(location.state?.token);
  }, []);


  type DailyHours = { [date: string]: string };

  const calculateDailyActiveHours = (data: DataItem[]): DailyHours => {
    const dailyActiveMinutes = new Map<string, number>();

    data.forEach((item) => {
      const date = item.start_time.split(' ')[0];
      const hasActiveData = Object.keys(item).some(
        (key) =>
          key !== 'start_time' &&
          key !== 'end_time' &&
          (item as any)[key] !== 0
      );
      if (hasActiveData) {
        dailyActiveMinutes.set(date, (dailyActiveMinutes.get(date) || 0) + 10);
      }
    });
    const dailyHours: DailyHours = {};
    dailyActiveMinutes.forEach((minutes, date) => {
      dailyHours[date] = (minutes / 60).toFixed(2); // 시간을 소수점 2자리까지 표시
    });

    return dailyHours;
  };

  useEffect(() => {
    if (rowlastdata.length > 0) {
      const firstDate = lastdata[0].start_time;
      const lastDate = lastdata[lastdata.length - 1].start_time;
      const formatDate = (dateString: string) => {
        const dateParts = dateString.split(' ')[0].split('-'); // 'YYYY-MM-DD' 형식으로 분리
        const year = dateParts[0];
        const month = String(dateParts[1]).padStart(2, '0'); // 월을 2자리로
        const day = String(dateParts[2]).padStart(2, '0'); // 일을 2자리로
        return `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 변환
      };

      const formattedFirstDate = formatDate(firstDate);
      const formattedLastDate = formatDate(lastDate);
      setFilters((prevFilters) => ({
        ...prevFilters,
        startDate: formattedFirstDate,
        endDate: formattedLastDate,
      }));

      setSelectDate1(formattedFirstDate);
      setSelectDate2(formattedLastDate);

      setStartDate1(formattedFirstDate); // 첫 날짜 설정
      setEndDate1(formattedLastDate); // 마지막 날짜 설정
      setStartDate2(formattedFirstDate); // 두 번째 날짜 선택의 시작 날짜 설정
      setEndDate2(formattedLastDate); // 두 번째 날짜 선택의 종료 날짜 설정
    }
  }, [rowlastdata]);

  useEffect(() => {
    setStartDate2(selectDate1)
  }, [selectDate1]);
  const handleModuleClick = () => {
    if (isSubMenuVisible) {
      setIsSubMenuVisible(false); // 하위 메뉴를 숨깁니다.
    } else {
      setSelectedModule('vitalInfo'); // 기본으로 Vital분석모듈을 선택합니다.
      setIsSubMenuVisible(true); // 하위 메뉴 표시

    }
  };


  const handleCSVFile = (data: any) => {
    const filteredData = data.slice(1).map((row: any[]) => {
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
    });
    setLastdata(filteredData)
    setRowLastdata(filteredData)
  }

  return (
    <div className="layout">
      <nav className="sidebar">

        <ul style={{ marginLeft: "-6px", marginTop: "100px" }}>
          <img style={{ marginBottom: "50px" }} src="/asset/homeicon.svg" className="icon" />
          <img style={{ marginBottom: "50px" }} src="/asset/vitalicon.svg" className="icon" />
          <img style={{ marginBottom: "50px" }} src="/asset/usericon.svg" className="icon" />
        </ul>
      </nav>

      <nav className={`secondary-sidebar`}>
      <img src="/asset/logo.svg" alt="" className="icon" style={{ width: "200px", height: "100px",marginLeft:"10px" }} />

        <ul>
          <li className={selectedModule === 'dataProcessing' ? 'active' : ''} onClick={() => {
            setSelectedModule('dataProcessing');
          }}>
            데이터 전처리
          </li>
          <li className={selectedModule === 'analysisModule' ? 'active' : ''} onClick={handleModuleClick}>

            분석 모듈
            {isSubMenuVisible ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
          </li>
          {isSubMenuVisible && (
            <ul className="sub-menu">
              <li className={selectedModule === 'vitalInfo' ? 'active' : ''} onClick={() => setSelectedModule('vitalInfo')}>Vital분석모듈이란</li>
              <li className={selectedModule === 'dataOverview' ? 'active' : ''} onClick={() => setSelectedModule('dataOverview')}>데이터 오버뷰</li>
              <li className={selectedModule === 'dataExploration' ? 'active' : ''} onClick={() => setSelectedModule('dataExploration')}>데이터 탐색</li>
              <li className={selectedModule === 'dataQualityIndex' ? 'active' : ''} onClick={() => setSelectedModule('dataQualityIndex')}>데이터 질지표</li>
              <li className={selectedModule === 'correlationAnalysis' ? 'active' : ''} onClick={() => setSelectedModule('correlationAnalysis')}>상관 분석</li>
              <li className={selectedModule === 'exportData' ? 'active' : ''} onClick={() => setSelectedModule('exportData')}>데이터 내보내기</li>
            </ul>
          )}
        </ul>
        <ul style={{ backgroundColor: '#FFFFFF', marginTop: "100px", boxShadow: '1px 3px 4px 6px rgba(0, 0, 0, 0.1)', width: "90%", height: "100vh" }}>
          {/* 탐색 기간 */}
          <li className={selectedModule === 'explorationPeriod' ? 'active' : ''} onClick={() => { setIsExplorationPeriodVisible(!isExplorationPeriodVisible); }}>
            탐색기간 {isExplorationPeriodVisible ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
          </li>
          {isExplorationPeriodVisible && (
            <div style={{ width: "98%" }} className="dropdown-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <p style={{ fontSize: "12px" }}>데이터 탐색 기간 </p>
                <button
                  onClick={() => {
                    setLastdata(rowlastdata); // 원본 데이터를 lastdata로 설정
                    setSelectDate1('');       // 선택된 날짜를 초기화
                    setSelectDate2('');       // 선택된 종료 날짜를 초기화
                    setStartDate1('');        // 시작 날짜 초기화
                    setStartDate2('');        // 종료 날짜 초기화
                    setEndDate1('');          // 최대 종료 날짜 초기화
                    setEndDate2('');          // 종료 날짜 초기화
                  }}
                  style={{ width: "80px", height: "26px", fontSize: "12px", backgroundColor: "#0F0F70" }}
                >
                  설정 초기화
                </button>

              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  type="date"
                  placeholder="날짜 선택"
                  style={{ marginBottom: '5px', width: "180px", height: "28px", fontSize: "12px" }}
                  min={startDate1}
                  max={endDate1}
                  value={filters.startDate}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                />
                <span style={{ margin: '5px 0' }}>~</span>
                <input
                  type="date"
                  placeholder="날짜 선택"
                  style={{ marginBottom: '5px', width: "180px", height: "28px", fontSize: "12px" }}
                  min={startDate2}
                  max={endDate2}
                  value={filters.endDate}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                />
              </div>


            </div>
          )}

          {/* 데이터 질 관리 */}
          <li className={selectedModule === 'dataQuality' ? 'active' : ''} onClick={() => { setIsDataQualityVisible(!isDataQualityVisible); }}>
            데이터 질관리 {isDataQualityVisible ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
          </li>

          {isDataQualityVisible && (
            <div style={{ width: "98%" }} className="dropdown-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: "12px", margin: 0 }}>데이터 질관리</p>
                <button
                  onClick={() => {
                    setLastdata(rowlastdata); // 원본 데이터를 lastdata로 설정
                    setSelectDate1('');       // 선택된 날짜를 초기화
                    setSelectDate2('');       // 선택된 종료 날짜를 초기화
                    setStartDate1('');        // 시작 날짜 초기화
                    setStartDate2('');        // 종료 날짜 초기화
                    setEndDate1('');          // 최대 종료 날짜 초기화
                    setEndDate2('');          // 종료 날짜 초기화
                  }}
                  style={{ width: "80px", height: "26px", fontSize: "12px", backgroundColor: "#0F0F70" }}
                >
                  설정 초기화
                </button>
              </div>
              <p style={{ color: 'red', fontSize: "10px" }}>* 파일 업로드 후 조작</p>
              <label style={{ color: '#0F0F70', fontSize: "12px" }}>
                걸음수
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: "10px", marginRight: '10px' }}>
                  하루 최소 걸음수
                </label>
                <div className="input-wrapper" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid black', padding: '5px' }}>
                  <input onChange={(e) => updateFilter('stepThreshold', Number(e.target.value))} value={filters.stepThreshold} type="text" placeholder="EX. 1000" style={{ fontSize: "12px", border: 'none', outline: 'none', width: '60px' }} />
                  <span style={{ fontSize: "10px", marginLeft: '5px' }}>걸음</span>
                </div>
              </div>

              <p style={{ fontSize: "10px" }}>ex 하루 최소 1000 걸음 이상 걷는 날을 유효한 날로 간주합니다.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <label style={{ color: '#0F0F70', fontSize: "12px" }}>
                  디바이스 착용시간
                </label>
                <label style={{ color: '#0F0F70', fontSize: "10px", marginLeft: '5px' }}>
                  (timestamp기반)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: "10px" }}>
                  착용시간
                </label>
                <div className="input-wrapper" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid black', padding: '5px' }}>
                  <input value={filters.activeHourThreshold} onChange={(e) => updateFilter('activeHourThreshold', Number(e.target.value))} type="number" placeholder="EX. 1000" style={{ fontSize: "12px", border: 'none', outline: 'none', width: '60px' }} />
                  <span style={{ fontSize: "10px", marginLeft: '5px' }}>시간</span>
                </div>
              </div>


              <p style={{ fontSize: "10px" }}>ex 하루 최소 1시간 이상 착용 시 유효한 날로 간주합니다.</p>
            </div>
          )}

          {/* <h5>CSV 파일 업로드</h5>
            <CSVReader onFileLoaded={handleCSVFile} /> */}

        </ul>
      </nav>

      {/* 모듈별 렌더링 처리 */}
      {
        selectedModule === 'dataProcessing' && preprocessStatus === "" && (
          <Preprocess />
        )
      }

      {
        selectedModule === 'dataProcessing' && preprocessStatus === "firstcompleted" && (
          <DataStatus />
        )
      }
      {
        selectedModule === 'dataProcessing' && preprocessStatus === "secondcompleted" && (
          <PreprocessComplet />
        )
      }

      {
        selectedModule === 'dataOverview' && (
          <DataOverview />
        )
      }

      {
        selectedModule === 'dataExploration' && (
          <DataExploration />
        )
      }
      {
        selectedModule === 'dataQualityIndex' && (
          <DataQualityIndex />
        )
      }
      {
        selectedModule === 'vitalInfo' && (
          <VitalInfo />
        )
      }
      {
        selectedModule === 'correlationAnalysis' && (
          <CorrelationAnalysis />
        )
      }
      {
        selectedModule === 'exportData' && (
          <ExportData />
        )
      }

    </div >
  );
};

export default Home;
