import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import DashboardSidebar from "../components/DashboardSidebar";
import useLiveDateTime from "../hooks/useLiveDateTime";
import useCurrentUser from "../hooks/useCurrentUser";

export default function EmployeeAttendancePage() {
  const [activeCluster, setActiveCluster] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState({
    timeInAt: null,
    timeOutAt: null,
    tag: null
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyDateStartFilter, setHistoryDateStartFilter] = useState("");
  const [historyDateEndFilter, setHistoryDateEndFilter] = useState("");
  const dateTimeLabel = useLiveDateTime();
  const { user } = useCurrentUser();

  const navItems = [
    { label: "Dashboard", onClick: () => (window.location.href = "/employee") },
    { label: "Team" },
    { label: "Attendance", active: true },
    { label: "Schedule" }
  ];

  const normalizeSchedule = schedule => {
    if (!schedule) return schedule;
    if (typeof schedule === "string") {
      try {
        return JSON.parse(schedule);
      } catch {
        return schedule;
      }
    }
    return schedule;
  };

  const parseSqlDateTime = value => {
    if (!value || typeof value !== "string") return null;
    const [datePart, timePart] = value.trim().split(" ");
    if (!datePart || !timePart) return new Date(value);

    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    if ([year, month, day, hours, minutes].some(Number.isNaN)) {
      return new Date(value);
    }

    return new Date(year, month - 1, day, hours, minutes, Number.isNaN(seconds) ? 0 : seconds);
  };

  const toMinutes = (time, period) => {
    const [hourPart, minutePart] = String(time).split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 1 ||
      hour > 12 ||
      ![0, 30].includes(minute)
    ) {
      return null;
    }

    const normalizedHour = hour % 12;
    const periodOffset = period === "PM" ? 12 * 60 : 0;
    return normalizedHour * 60 + minute + periodOffset;
  };

  const toLocalSqlDateTime = date => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    const seconds = `${date.getSeconds()}`.padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatDateTimeLabel = value => {
    const parsedDate = value instanceof Date ? value : parseSqlDateTime(value);
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return "—";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(parsedDate);
  };

  const toDateInputValue = value => {
    const parsedDate = value instanceof Date ? value : parseSqlDateTime(value);
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return null;

    const year = parsedDate.getFullYear();
    const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
    const day = `${parsedDate.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodaySchedule = () => {
    const schedule = activeCluster?.schedule;
    if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
      return null;
    }

    const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
    const assignedDays = Array.isArray(schedule.days) ? schedule.days : [];
    if (!assignedDays.includes(currentDay)) return null;

    return schedule.daySchedules?.[currentDay] ?? null;
  };

  const persistAttendance = async nextAttendance => {
    if (!activeCluster?.cluster_id) {
      setAttendanceLog(nextAttendance);
      return;
    }

    const response = await apiFetch("api/save_attendance.php", {
      method: "POST",
      body: JSON.stringify({
        cluster_id: activeCluster.cluster_id,
        ...nextAttendance,
        timeInAt: nextAttendance.timeInAt ? toLocalSqlDateTime(nextAttendance.timeInAt) : null,
        timeOutAt: nextAttendance.timeOutAt ? toLocalSqlDateTime(nextAttendance.timeOutAt) : null
      })
    });

    const savedAttendance = response.attendance ?? {};
    setAttendanceLog({
      timeInAt: parseSqlDateTime(savedAttendance.timeInAt),
      timeOutAt: parseSqlDateTime(savedAttendance.timeOutAt),
      tag: savedAttendance.tag ?? null
    });

    const history = await apiFetch("api/employee_attendance_history.php");
    setAttendanceHistory(history);
  };

  const handleTimeIn = async () => {
    if (!canUseAttendanceControls) return;
    if (attendanceLog.timeInAt && !attendanceLog.timeOutAt) return;

    const now = new Date();
    const daySchedule = getTodaySchedule();

    if (!daySchedule) {
      await persistAttendance({ timeInAt: now, timeOutAt: null, tag: "Late" });
      return;
    }

    const scheduledStartMinutes = toMinutes(daySchedule.startTime, daySchedule.startPeriod);
    if (scheduledStartMinutes === null) {
      await persistAttendance({ timeInAt: now, timeOutAt: null, tag: "Late" });
      return;
    }

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const lateThreshold = scheduledStartMinutes + 15;
    const tag = nowMinutes <= lateThreshold ? "On Time" : "Late";

    await persistAttendance({ timeInAt: now, timeOutAt: null, tag });
  };

  const handleTimeOut = async () => {
    if (!canUseAttendanceControls) return;
    if (!attendanceLog.timeInAt || attendanceLog.timeOutAt) return;

    await persistAttendance({
      ...attendanceLog,
      timeOutAt: new Date()
    });
  };

  const hasScheduleToday = Boolean(getTodaySchedule());
  const hasTeamCluster = Boolean(activeCluster?.cluster_id);
  const canUseAttendanceControls = hasTeamCluster && hasScheduleToday;
  const hasActiveTimeIn = Boolean(attendanceLog.timeInAt && !attendanceLog.timeOutAt);

  useEffect(() => {
    apiFetch("api/employee_clusters.php").then(response => {
      const normalized = response.map(cluster => ({
        ...cluster,
        schedule: normalizeSchedule(cluster.schedule)
      }));
      const currentCluster = normalized[0] ?? null;
      setActiveCluster(currentCluster);

      if (currentCluster) {
        setAttendanceLog({
          timeInAt: parseSqlDateTime(currentCluster.time_in_at),
          timeOutAt: parseSqlDateTime(currentCluster.time_out_at),
          tag: currentCluster.attendance_tag ?? null
        });
      }
    });

    apiFetch("api/employee_attendance_history.php").then(response => {
      setAttendanceHistory(response);
    });
  }, []);

  const filteredAttendanceHistory =
    !historyDateStartFilter && !historyDateEndFilter
      ? attendanceHistory
      : attendanceHistory.filter(item => {
          const entryDate = toDateInputValue(item.time_in_at ?? item.time_out_at ?? item.updated_at);
          if (!entryDate) return false;

          if (historyDateStartFilter && entryDate < historyDateStartFilter) return false;
          if (historyDateEndFilter && entryDate > historyDateEndFilter) return false;
          return true;
        });

  const handleLogout = async () => {
    try {
      await apiFetch("auth/logout.php", { method: "POST" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("teamClusterUser");
      window.location.href = "/login";
    }
  };

  return (
    <div className="dashboard">
      <DashboardSidebar
        avatar="EM"
        roleLabel="Employee"
        userName={user?.fullname}
        navItems={navItems}
        onLogout={handleLogout}
      />

      <main className="main">
        <header className="topbar">
          <div>
            <h2>ATTENDANCE</h2>
            <div className="section-title">Attendance history</div>
          </div>
          <span className="datetime">{dateTimeLabel}</span>
        </header>

        <section className="content content-muted">
          <div className="employee-card employee-attendance-card">
            <div className="employee-card-header employee-attendance-header">
              <div>
                <div className="employee-card-title">Attendance Tracking</div>
                <div className="employee-attendance-subtitle">
                  {canUseAttendanceControls
                    ? "Clock in and out for your assigned shift."
                    : "Attendance controls are available only on scheduled days."}
                </div>
              </div>
            </div>

            <div className="employee-card-body employee-attendance-body">
              <div className="employee-attendance-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTimeIn}
                  disabled={!canUseAttendanceControls || hasActiveTimeIn}
                >
                  Time In
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTimeOut}
                  disabled={!canUseAttendanceControls || !hasActiveTimeIn}
                >
                  Time Out
                </button>
              </div>
              <div className="employee-attendance-log-grid">
                <div className="employee-field">
                  <div className="employee-field-label">Time In</div>
                  <div className="employee-field-value">{formatDateTimeLabel(attendanceLog.timeInAt)}</div>
                </div>
                <div className="employee-field">
                  <div className="employee-field-label">Time Out</div>
                  <div className="employee-field-value">{formatDateTimeLabel(attendanceLog.timeOutAt)}</div>
                </div>
                <div className="employee-field">
                  <div className="employee-field-label">Tag</div>
                  <div className="employee-field-value">{attendanceLog.tag ?? "Pending"}</div>
                </div>
              </div>

              <div className="employee-attendance-history-filters">
                <label>
                  Start Date
                  <input
                    type="date"
                    value={historyDateStartFilter}
                    onChange={event => setHistoryDateStartFilter(event.target.value)}
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    value={historyDateEndFilter}
                    onChange={event => setHistoryDateEndFilter(event.target.value)}
                  />
                </label>
              </div>

              {filteredAttendanceHistory.length > 0 ? (
                <div className="employee-attendance-history-table" role="table" aria-label="Attendance history">
                  <div className="employee-attendance-history-header" role="row">
                    <span role="columnheader">Date</span>
                    <span role="columnheader">Cluster</span>
                    <span role="columnheader">Time In</span>
                    <span role="columnheader">Time Out</span>
                    <span role="columnheader">Tag</span>
                  </div>
                  {filteredAttendanceHistory.map(item => (
                    <div key={item.id} className="employee-attendance-history-row" role="row">
                      <span role="cell">{formatDateTimeLabel(item.time_in_at ?? item.updated_at)}</span>
                      <span role="cell">{item.cluster_name ?? "—"}</span>
                      <span role="cell">{formatDateTimeLabel(item.time_in_at)}</span>
                      <span role="cell">{formatDateTimeLabel(item.time_out_at)}</span>
                      <span role="cell">
                        <span className={`member-status-tag ${item.tag ? "is-active" : ""}`}>{item.tag ?? "Pending"}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No attendance records match the selected date range.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
