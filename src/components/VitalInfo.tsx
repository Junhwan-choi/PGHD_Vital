import React from 'react';
import { FaChartLine, FaCloud, FaMedal } from 'react-icons/fa'; // 그래프, 클라우드, 메달 아이콘 임포트
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/VitalInfo.css'; // 스타일을 위한 CSS 파일 임포트

const VitalInfo: React.FC = () => {
    return (
        <div className="main-content">

            <div className="info-boxes d-flex justify-content-between" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ textAlign: 'left', width: '100%' }}>
                    VITAL(Validation and Inspection Tool for Armband-based Lifelog data)
                </h2>
                <div className="info-boxes d-flex justify-content-between" style={{ width: "100%" }}>

                    {/* 첫 번째 박스 */}
                    <div className="info-box1" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="/asset/bar_chart_4_bars.svg" alt="Bar Chart Icon" className="icon" />
                        <p>웨어러블 데이터를 시각화하여 그 추이를 그래프로 확인</p>
                    </div>

                    {/* 두 번째 박스 */}
                    <div className="info-box1" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="/asset/cloud_upload.svg" alt="Cloud Upload Icon" className="icon" />
                        <p>웨어러블 데이터를 원하는 기간과 항목을 설정하여 탐색</p>
                    </div>

                    {/* 세 번째 박스 */}
                    <div className="info-box1" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="/asset/social_leaderboard.svg" alt="Social Leaderboard Icon" className="icon" />
                        <p>데이터 품질 관리가 가능하며, 질지표를 확인</p>
                    </div>
                </div>
            </div>



            {/* Vital 분석모듈 사용 방법 */}

            <div className="info-boxes d-flex justify-content-between" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ textAlign: 'left', fontSize: "16px" }}>분석모듈 메뉴 설명</h3>
                <div className="instructions">

                    <div className="instruction-box">
                        <img src="/asset/visibility.svg" className="icon" />
                        <p style={{ color: '#0F0F70' }}>&nbsp;&nbsp;&nbsp;&nbsp;데이터 오버뷰&nbsp;&nbsp;&nbsp;&nbsp; -  &nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p>날짜별, 시간대 별로 수집된 데이터 수에 관한 전체적인 개요를 제공</p>
                    </div>

                    <div className="instruction-box">
                        <img src="/asset/mystery.svg" className="icon" />
                        <p style={{ color: '#0F0F70' }}>&nbsp;&nbsp;&nbsp;&nbsp;데이터 탐색&nbsp;&nbsp;&nbsp;&nbsp; -  &nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p>활동, 생체, 수면 데이터 항목 별로 시각화하여 추이를 확인</p>
                    </div>

                    <div className="instruction-box">
                        <img src="/asset/balance.svg" className="icon" />
                        <p style={{ color: '#0F0F70' }}>&nbsp;&nbsp;&nbsp;&nbsp;데이터 질지표&nbsp;&nbsp;&nbsp;&nbsp; -  &nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p>사용자 기준을 적용한 데이터 질관리가 가능하며, 그에 따른 질평가 지표를 확인할 수 있습니다.</p>
                    </div>

                    <div className="instruction-box">
                        <img src="/asset/calculate.svg" className="icon" />
                        <p style={{ color: '#0F0F70' }}>&nbsp;&nbsp;&nbsp;&nbsp;상관 분석&nbsp;&nbsp;&nbsp;&nbsp; -  &nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p>환자가 수집한 데이터 항목들 간에 간단한 상관 관계를 확인할 수 있습니다.</p>
                    </div>

                    <div className="instruction-box">
                        <img src="/asset/download.svg" className="icon" />
                        <p style={{ color: '#0F0F70' }}>&nbsp;&nbsp;&nbsp;&nbsp;데이터 내보내기&nbsp;&nbsp;&nbsp;&nbsp; -  &nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p>사용자가 원하는 데이터를 다운받을 수 있습니다.</p>
                    </div>
                    <div className="instruction-box">
                        <img src="/asset/dock_to_right.svg" className="icon" />
                        <p style={{ color: '#0F0F70' }}>&nbsp;&nbsp;&nbsp;&nbsp;탐색 기간 & 데이터 질관리 사이드바&nbsp;&nbsp;&nbsp;&nbsp; -  &nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p>원하는 데이터 기간, 사용자가 정의하는 데이터 질평가 기준에 따라 필터링을 적용</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default VitalInfo;
