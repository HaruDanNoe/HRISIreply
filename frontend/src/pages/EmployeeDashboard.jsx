import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import DashboardSidebar from "../components/DashboardSidebar";
import useLiveDateTime from "../hooks/useLiveDateTime";
import useCurrentUser from "../hooks/useCurrentUser";
import { resolveAttendanceMainTag } from "../utils/attendanceTags";

export default function EmployeeDashboard() {
  const statusTags = ["On Time", "Late", "Scheduled", "Off Scheduled", "Not scheduled"];
  const [data, setData] = useState([]);
  const [attendanceLog, setAttendanceLog] = useState({
    timeInAt: null,
    timeOutAt: null,
    tag: null
  });
  const activeCluster = data[0];
  const dateTimeLabel = useLiveDateTime();
  const { user } = useCurrentUser();

  const navItems = [
    { label: "Dashboard", active: true },
    { label: "Team" },
    { label: "Attendance", onClick: () => (window.location.href = "/employee/attendance") },
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

  const formatScheduleTime = schedule => {
    if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
      return "Time TBD";
    }
    const startTime = schedule.startTime ?? "9:00";
    const startPeriod = schedule.startPeriod ?? "AM";
    const endTime = schedule.endTime ?? "5:00";
    const endPeriod = schedule.endPeriod ?? "PM";
    return `${startTime} ${startPeriod}–${endTime} ${endPeriod}`;
  };

  const formatBreakTimeRange = (startTime, startPeriod, endTime, endPeriod) => {
    if (!startTime || !endTime) return "—";
    return `${startTime} ${startPeriod ?? ""}–${endTime} ${endPeriod ?? ""}`.trim();
  };

  const formatEmployeeDayTime = day => {
    const schedule = activeCluster?.schedule;
    if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
      return "—";
    }

    const assignedDays = Array.isArray(schedule.days) ? schedule.days : [];
    if (!assignedDays.includes(day)) return "—";

    const daySchedule = schedule.daySchedules?.[day];
    if (!daySchedule || typeof daySchedule !== "object") {
      return {
        shift: formatScheduleTime(schedule),
        lunchBreak: "—",
        breakTime: "—"
      };
    }

    return {
      shift: formatScheduleTime(daySchedule),
      lunchBreak: formatBreakTimeRange(
        daySchedule.lunchBreakStartTime,
        daySchedule.lunchBreakStartPeriod,
        daySchedule.lunchBreakEndTime,
        daySchedule.lunchBreakEndPeriod
      ),
      breakTime: formatBreakTimeRange(
        daySchedule.breakStartTime,
        daySchedule.breakStartPeriod,
        daySchedule.breakEndTime,
        daySchedule.breakEndPeriod
      )
    };
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

  const isTimeWithinRange = (nowMinutes, startTime, startPeriod, endTime, endPeriod) => {
    const startMinutes = toMinutes(startTime, startPeriod);
    const endMinutes = toMinutes(endTime, endPeriod);

    if (startMinutes === null || endMinutes === null || startMinutes === endMinutes) {
      return false;
    }

    if (endMinutes < startMinutes) {
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    }

    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  };

  const getCurrentStatus = () => {
    const daySchedule = getTodaySchedule();
    if (!daySchedule) {
      return { label: "Not available", className: "status-not-available" };
    }

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (
      !isTimeWithinRange(
        nowMinutes,
        daySchedule.startTime,
        daySchedule.startPeriod,
        daySchedule.endTime,
        daySchedule.endPeriod
      )
    ) {
      return { label: "Not available", className: "status-not-available" };
    }

    if (
      isTimeWithinRange(
        nowMinutes,
        daySchedule.lunchBreakStartTime,
        daySchedule.lunchBreakStartPeriod,
        daySchedule.lunchBreakEndTime,
        daySchedule.lunchBreakEndPeriod
      )
    ) {
      return { label: "On lunch break", className: "status-lunch" };
    }

    if (
      isTimeWithinRange(
        nowMinutes,
        daySchedule.breakStartTime,
        daySchedule.breakStartPeriod,
        daySchedule.breakEndTime,
        daySchedule.breakEndPeriod
      )
    ) {
      return { label: "On break time", className: "status-break" };
    }

    return { label: "Available", className: "status-available" };
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

  const getStatusTag = (statusLabel, isScheduledToday) => {
    if (statusLabel === "On lunch break") return "Lunch Time";
    if (statusLabel === "On break time") return "Break Time";
    if (statusLabel === "Not available") {
      return isScheduledToday ? "Scheduled" : "Not scheduled";
    }
    if (statusLabel === "Available") return "On Time";
    return null;
  };

  const getActiveDays = schedule => {
    if (!schedule) return [];
    if (Array.isArray(schedule)) {
      return schedule.map(day => day.slice(0, 3));
    }
    if (typeof schedule === "object") {
      const days = Array.isArray(schedule.days) ? schedule.days : [];
      return days.map(day => day.slice(0, 3));
    }
    return [];
  };

  const scheduleDays = getActiveDays(activeCluster?.schedule);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hasScheduleToday = Boolean(getTodaySchedule());
  const currentStatus = getCurrentStatus();
  const activeAttendanceTag = resolveAttendanceMainTag({
    attendanceTag: attendanceLog.tag,
    schedule: activeCluster?.schedule,
    timeInAt: attendanceLog.timeInAt,
    fallbackTag: getStatusTag(currentStatus.label, hasScheduleToday)
  });

  useEffect(() => {
    apiFetch("api/employee_clusters.php").then(response => {
      const normalized = response.map(cluster => ({
        ...cluster,
        schedule: normalizeSchedule(cluster.schedule)
      }));
      setData(normalized);
      const active = normalized[0];
      if (active) {
        setAttendanceLog({
          timeInAt: parseSqlDateTime(active.time_in_at),
          timeOutAt: parseSqlDateTime(active.time_out_at),
          tag: active.attendance_tag ?? null
        });
      }
    });
  }, []);

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
            <h2>DASHBOARD</h2>
            <div className="section-title">My team cluster overview</div>
          </div>
          <span className="datetime">{dateTimeLabel}</span>
        </header>

        <section className="content content-muted">
          <div className="employee-card">
            <div className="employee-card-header">
              <div className="employee-card-title">My Team Cluster Details</div>
            </div>
            <div className="employee-card-body">
              <div className="employee-overview-grid">
                <div className="employee-field employee-highlight-field">
                  <div className="employee-field-label">Cluster Name</div>
                  <div className="employee-field-value">{activeCluster?.cluster_name ?? "Not assigned"}</div>
                </div>
                <div className="employee-field employee-highlight-field">
                  <div className="employee-field-label">Team Coach</div>
                  <div className="employee-field-value">{activeCluster?.coach_name ?? "Pending"}</div>
                </div>
                <div className="employee-field employee-inline-stat">
                  <div className="employee-field-label">Assigned Days</div>
                  <div className="employee-field-value employee-stat-value">{scheduleDays.length}</div>
                </div>
                <div className="employee-field employee-inline-stat">
                  <div className="employee-field-label">Weekly Status</div>
                  <div className="employee-field-value employee-stat-value">
                    {scheduleDays.length > 0 ? "Schedule set" : "Pending"}
                  </div>
                </div>
              </div>
            </div>
            <div className="employee-field employee-highlight-field">
              <div className="employee-field-label">Latest Attendance Tag</div>
              <div className="employee-field-value">
                <span className={`member-status-tag ${activeAttendanceTag ? "is-active" : ""}`}>
                  {activeAttendanceTag ?? (hasScheduleToday ? "Scheduled" : "Not scheduled")}
                </span>
              </div>
            </div>
            <div className="employee-card-footer"></div>
          </div>

          <div className="employee-card">
            <div className="employee-card-header">
              <div className="employee-card-title">My Schedule</div>
            </div>
            <div className="employee-card-body">
              <div className="active-members-schedule-table employee-schedule-table" role="table" aria-label="My schedule">
                <div className="active-members-schedule-header" role="row">
                  <span role="columnheader">Member</span>
                  {dayLabels.map(day => (
                    <span key={`${day}-header`} role="columnheader">{day}</span>
                  ))}
                  <span role="columnheader">Status and Tags</span>
                </div>
                <div className="active-members-schedule-row" role="row">
                  <div className="active-members-owner" role="cell">
                    {user?.fullname ?? "Employee"}
                  </div>
                  {dayLabels.map(day => {
                    const dayInfo = formatEmployeeDayTime(day);

                    if (typeof dayInfo === "string") {
                      return (
                        <div key={`${day}-value`} role="cell">{dayInfo}</div>
                      );
                    }

                    return (
                      <div key={`${day}-value`} role="cell" className="active-day-cell">
                        <div>{dayInfo.shift}</div>
                        <span className="active-day-tag lunch-tag">Lunch break: {dayInfo.lunchBreak}</span>
                        <span className="active-day-tag break-tag">Break time: {dayInfo.breakTime}</span>
                      </div>
                    );
                  })}
                  <div role="cell" className="member-status-and-tags-cell">
                    <span className={`member-status-pill ${currentStatus.className}`}>{currentStatus.label}</span>
                    <div className="member-status-tag-list" aria-label="Status tags">
                      {statusTags.map(tag => (
                        <span
                          key={`employee-${tag}`}
                          className={`member-status-tag ${activeAttendanceTag === tag ? "is-active" : ""}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="employee-schedule-caption"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
