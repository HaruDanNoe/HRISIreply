export default function DashboardSidebar({
  avatar,
  roleLabel,
  userName,
  navItems,
  onLogout,
}) {
  const renderNavItem = item => {
    const className = `nav-item${item.active ? " active" : ""}`;
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    return (
      <div key={item.label} className="nav-group">
        {item.onClick ? (
          <button className={className} type="button" onClick={item.onClick}>
            <span>{item.label}</span>
            {hasChildren ? <span className="nav-caret">{item.expanded ? "▾" : "▸"}</span> : null}
          </button>
        ) : (
          <div className={className}>
            <span>{item.label}</span>
            {hasChildren ? <span className="nav-caret">{item.expanded ? "▾" : "▸"}</span> : null}
          </div>
        )}

        {hasChildren && item.expanded ? (
          <div className="nav-submenu" role="group" aria-label={`${item.label} submenu`}>
            {item.children.map(child => {
              const childClassName = `nav-subitem${child.active ? " active" : ""}`;
              return (
                <button
                  key={`${item.label}-${child.label}`}
                  className={childClassName}
                  type="button"
                  onClick={child.onClick}
                >
                  {child.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

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
        {navItems.map(renderNavItem)}
      </nav>

      <button className="sidebar-footer" type="button" onClick={onLogout}>
        Log Out
      </button>
    </aside>
  );
}
