import React, { useEffect, useState } from 'react';
import { getStatusIconComponent, names } from '../services/expoService';

function formatDateToYMD() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

const str2date = (time) => {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2, 4);
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date;
}

const PavilionTable = ({ pavilions, setIsOpen, ticketIds, settings, errMsg }) => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [opacity, setOpacity] = useState(1);

    const openWindow = (pavilionCode) => {
        if (window.history.length < 4) {
            alert("予約ボタンから設定していただけますと、直接予約画面に飛べるようになります。");
        } else if (ticketIds == "") {
            alert("チケットIDを入力してください。");
        } else {
            setOpacity(0.5);
            window.location.href = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`;
        }
    };

    useEffect(() => {
        const handlePageShow = () => setOpacity(1);
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    useEffect(() => {
        let minDate = new Date();
        minDate.setHours(8, 45, 0, 0);
        let maxDate = new Date();
        maxDate.setHours(21, 59, 0, 0);

        const interval = 15 * 60 * 1000;
        const times = [];
        const timesCount = [];
        const availableTimesCount = [];
        for (let t = minDate.getTime(); t <= maxDate.getTime(); t += interval) {
            times.push(new Date(t));
            timesCount.push(0);
            availableTimesCount.push(0);
        }

        const tableDataTmp = [];
        for (let i = 0; i < pavilions.length; i++) {
            if (pavilions[i].n == "") continue;

            const timeData = {};
            for (let j = 0; j < pavilions[i].s.length; j++) {
                const time = str2date(pavilions[i].s[j].t);
                for (let k = 0; k < times.length - 1; k++) {
                    if (times[k] <= time && time < times[k + 1]) {
                        timesCount[k]++;
                        const key = times[k].getTime();
                        if (!(key in timeData)) timeData[key] = 2;
                        if (pavilions[i].s[j].s < timeData[key]) timeData[key] = pavilions[i].s[j].s;
                        if (Number(pavilions[i].s[j].s) <= 1) availableTimesCount[k]++;
                        break;
                    }
                }
            }

            tableDataTmp.push({
                code: pavilions[i].c,
                name: pavilions[i].c in names ? names[pavilions[i].c][0].replaceAll(names[pavilions[i].c][1], "") : pavilions[i].n,
                category: pavilions[i].c in names ? names[pavilions[i].c][1] : '',
                url: pavilions[i].u,
                timeData: timeData
            })
        }

        const start = timesCount.findIndex(x => x !== 0);
        const end = timesCount.length - 1 - [...timesCount].reverse().findIndex(x => x !== 0);
        const newTimes = times.slice(start, end + 1);
        setTimeSlots(newTimes);

        const now = new Date();
        if (newTimes.length == 0 ||
            // (now.getHours() < 9 && now.toTimeString().slice(0, 8) < newTimes[0].toTimeString().slice(0, 8)) ||
            now.getHours() < 8 ||
            (now.getHours() == 8 && now.getMinutes() < 45) ||
            (now.getHours() >= 21 && newTimes[newTimes.length - 1].toTimeString().slice(0, 8) < now.toTimeString().slice(0, 8))) {
            setTableData([]);
            setIsOpen(false);
        } else {
            if (settings.showAvailableOnly) {
                setTimeSlots(times.filter((_, i) => availableTimesCount[i] > 0));
            }
            setTableData(tableDataTmp);
            setIsOpen(true);
        }

    }, [pavilions]);

    return (
        <div className="table-container">
            {tableData && tableData.length > 0 ? (
                <table className="reservation-table" style={{ opacity: opacity }}>
                    <thead>
                        <tr>
                            <th>施設名</th>
                            {timeSlots.map(time => {
                                const hhmm = time.toTimeString().slice(0, 5);
                                return <th key={`header-${hhmm}`}>{`${hhmm}`}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((pavilion) => (
                            <tr key={pavilion.code}>
                                <td>
                                    {pavilion.url ? (
                                        <a href={pavilion.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue)' }}>
                                            {pavilion.name}
                                        </a>
                                    ) : (
                                        pavilion.name
                                    )}
                                    <span className="pavilion-category">{pavilion.category}</span>
                                </td>
                                {timeSlots.map(time => {
                                    const hhmm = time.toTimeString().slice(0, 5);
                                    const status = time.getTime() in pavilion.timeData ? pavilion.timeData[time.getTime()].toString() : '';

                                    const uniqueCellKey = `${pavilion.code}-${hhmm}`;

                                    return (
                                        <td key={uniqueCellKey}>
                                            <span
                                                className={`status-icon ${(status === '0' || status === '1') ? 'status-icon-hover' : ''}`}
                                                onClick={() => {
                                                    if (status === '0' || status === '1') {
                                                        openWindow(pavilion.code);
                                                    }
                                                }}
                                                role="button"
                                                tabIndex={(status === '0' || status === '1') ? 0 : -1}
                                                onKeyDown={(e) => {
                                                    if ((e.key === 'Enter' || e.key === ' ') && (status === '0' || status === '1')) {
                                                        openWindow(pavilion.code);
                                                    }
                                                }}
                                            >
                                                {getStatusIconComponent(status)}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="no-data-message" style={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'rgb(102, 102, 102)',
                    backgroundColor: 'rgb(245, 245, 245)',
                }}>
                    {(() => {
                        if (errMsg) return errMsg;

                        const now = new Date();
                        const hour = now.getHours();
                        if (hour < 9 || hour >= 21) {
                            return "営業時間外です";
                        }
                        return "表示できるデータがありません";
                    })()}
                </div>
            )}
        </div>
    );
};

export default PavilionTable;