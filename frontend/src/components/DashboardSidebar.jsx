export default function DashboardSidebar({
  avatar,
  roleLabel,
  userName,
  navItems,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="avatar">{avatar}</div>
        <div>
          <div>{roleLabel}</div>
          <div className="user-meta">{userName ?? roleLabel}</div>
        </div>
      </div>

      <nav className="nav">
        {navItems.map(item => {
          const className = `nav-item${item.active ? " active" : ""}`;
          if (item.onClick) {
            return (
              <button key={item.label} className={className} type="button" onClick={item.onClick}>
                {item.label}
              </button>
            );
          }

          return (
            <div key={item.label} className={className}>
              {item.label}
            </div>
          );
        })}
      </nav>

      <button className="sidebar-footer" type="button" onClick={onLogout}>
        Log Out
      </button>
    </aside>
  );
}
