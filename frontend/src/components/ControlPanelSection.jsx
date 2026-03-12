import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/api";

export default function ControlPanelSection() {
  const [activeTab, setActiveTab] = useState("General");
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRole, setSelectedRole] = useState(null);
  const [tempPermissions, setTempPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  const loadRoles = async () => {
    const response = await apiFetch("api/control_panel/get_roles_with_permissions.php");
    if (response.success) setRoles(Array.isArray(response.data) ? response.data : []);
  };

  const loadUsers = async () => {
    const response = await apiFetch("api/control_panel/get_users_with_permissions.php");
    if (response.success) setUsers(Array.isArray(response.data) ? response.data : []);
  };

  const loadLogs = async () => {
    const response = await apiFetch("api/control_panel/get_logs.php");
    if (response.success) setLogs(Array.isArray(response.logs) ? response.logs : []);
  };

  const loadArchivedUsers = async () => {
    const response = await apiFetch("api/control_panel/get_archived_users.php");
    if (response.success) setArchivedUsers(Array.isArray(response.users) ? response.users : []);
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "Logs") loadLogs();
    if (activeTab === "User Archives") loadArchivedUsers();
  }, [activeTab]);

  const filteredUsers = useMemo(
    () =>
      users.filter(user =>
        Object.values(user)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

  const allPermissions = useMemo(
    () => [...new Set(roles.flatMap(role => (Array.isArray(role.permissions) ? role.permissions : [])))],
    [roles]
  );

  const openRoleEditor = role => {
    setSelectedRole(role);
    setTempPermissions(Array.isArray(role.permissions) ? [...role.permissions] : []);
  };

  const toggleRolePermission = permission => {
    setTempPermissions(previous =>
      previous.includes(permission) ? previous.filter(item => item !== permission) : [...previous, permission]
    );
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;

    await apiFetch("api/control_panel/update_role_permissions.php", {
      method: "POST",
      body: JSON.stringify({
        role_id: selectedRole.role_id,
        permissions: tempPermissions
      })
    });

    setSelectedRole(null);
    await Promise.all([loadRoles(), loadUsers()]);
  };

  const openUserPermissions = async user => {
    const response = await apiFetch(`api/control_panel/get_user_permissions.php?user_id=${user.id}`);
    if (response.success) {
      setSelectedUser(user);
      setUserPermissions(Array.isArray(response.permissions) ? response.permissions : []);
    }
  };

  const toggleUserPermission = permissionId => {
    setUserPermissions(previous =>
      previous.map(permission =>
        permission.permission_id === permissionId
          ? { ...permission, allowed: permission.allowed === 1 ? 0 : 1 }
          : permission
      )
    );
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;

    const response = await apiFetch("api/control_panel/update_user_permissions.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: selectedUser.id,
        permissions: userPermissions
      })
    });

    if (response.success) {
      setSelectedUser(null);
      await loadUsers();
    }
  };

  const restoreUser = async employeeId => {
    await apiFetch("api/control_panel/restore_user.php", {
      method: "POST",
      body: JSON.stringify({ employee_id: employeeId })
    });

    await loadArchivedUsers();
  };

  const deleteUser = async employeeId => {
    const response = await apiFetch(`api/control_panel/delete_user_permanently.php?employee_id=${employeeId}`, {
      method: "POST"
    });

    if (response.success) await loadArchivedUsers();
  };

  return (
    <section className="content control-panel-content">
      <div className="control-panel-header">
        <h2>Control Panel</h2>
        <p>Manage role-based permissions</p>
      </div>

      <div className="control-panel-tabs" role="tablist" aria-label="Control panel tabs">
        {["General", "Search", "Logs", "User Archives"].map(tab => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tab === activeTab}
            className={`control-panel-tab ${tab === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "General" && (
        <div className="permission-card-grid">
          {roles.map(role => (
            <article key={role.role_id} className="permission-card">
              <header className="permission-card-header">{role.role_name}</header>
              <div className="permission-card-body">
                <p className="permission-card-label">Permissions:</p>
                <ul>
                  {(role.permissions ?? []).map(permission => (
                    <li key={`${role.role_id}-${permission}`}>{permission}</li>
                  ))}
                </ul>
                <button type="button" className="btn permission-edit-btn" onClick={() => openRoleEditor(role)}>
                  Edit Permissions
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeTab === "Search" && (
        <>
          <input
            className="control-panel-search"
            type="search"
            placeholder="Search a User..."
            aria-label="Search a User"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
          <div className="control-panel-table-wrap" role="table" aria-label="Search results table">
            <div className="control-panel-table-header" role="row">
              <span role="columnheader">ID</span>
              <span role="columnheader">Full Name</span>
              <span role="columnheader">Role</span>
              <span role="columnheader">Position</span>
              <span role="columnheader">Action</span>
            </div>
            {filteredUsers.map(user => (
              <div key={`search-row-${user.id}`} className="control-panel-table-row" role="row">
                <span role="cell">{user.id}</span>
                <span role="cell">{user.fullName}</span>
                <span role="cell">{user.role}</span>
                <span role="cell">{user.position}</span>
                <span role="cell">
                  <button type="button" className="btn permission-edit-btn" onClick={() => openUserPermissions(user)}>
                    Permissions
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "Logs" && (
        <div className="control-panel-table-wrap" role="table" aria-label="Control panel logs table">
          <div className="control-panel-table-header" role="row">
            <span role="columnheader">ID</span>
            <span role="columnheader">User</span>
            <span role="columnheader">Action</span>
            <span role="columnheader">Target</span>
            <span role="columnheader">Date</span>
          </div>
          {logs.map(log => (
            <div key={`log-${log.id}`} className="control-panel-table-row" role="row">
              <span role="cell">{log.id}</span>
              <span role="cell">{log.user}</span>
              <span role="cell">{log.action}</span>
              <span role="cell">{log.target}</span>
              <span role="cell">{log.date}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "User Archives" && (
        <div className="control-panel-table-wrap" role="table" aria-label="User archives table">
          <div className="control-panel-table-header" role="row">
            <span role="columnheader">ID</span>
            <span role="columnheader">Full Name</span>
            <span role="columnheader">Position</span>
            <span role="columnheader">Action</span>
          </div>
          {archivedUsers.map(user => (
            <div key={`archive-row-${user.employee_id}`} className="control-panel-table-row" role="row">
              <span role="cell">{user.employee_id}</span>
              <span role="cell">{user.fullName}</span>
              <span role="cell">{user.position}</span>
              <span role="cell">
                <button type="button" className="btn secondary" onClick={() => restoreUser(user.employee_id)}>
                  Restore
                </button>
                <button type="button" className="btn" onClick={() => deleteUser(user.employee_id)}>
                  Delete Permanently
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedRole && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelectedRole(null)}>
          <div
            className="modal-card permission-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${selectedRole.role_name} permissions`}
            onClick={event => event.stopPropagation()}
          >
            <h3 className="permission-modal-title">{selectedRole.role_name}</h3>
            <div className="permission-modal-list" role="group" aria-label={`${selectedRole.role_name} permissions`}>
              {allPermissions.map(permission => (
                <label key={`permission-toggle-${selectedRole.role_id}-${permission}`} className="permission-modal-item">
                  <input
                    type="checkbox"
                    checked={tempPermissions.includes(permission)}
                    onChange={() => toggleRolePermission(permission)}
                  />
                  <span>{permission}</span>
                </label>
              ))}
            </div>
            <div className="permission-modal-actions">
              <button type="button" className="btn secondary" onClick={() => setSelectedRole(null)}>
                Cancel
              </button>
              <button type="button" className="btn permission-save-btn" onClick={saveRolePermissions}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelectedUser(null)}>
          <div
            className="modal-card permission-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${selectedUser.fullName} permissions`}
            onClick={event => event.stopPropagation()}
          >
            <h3 className="permission-modal-title">{selectedUser.fullName}</h3>
            <div className="permission-modal-list" role="group" aria-label={`${selectedUser.fullName} permissions`}>
              {userPermissions.map(permission => (
                <label key={`user-permission-toggle-${permission.permission_id}`} className="permission-modal-item">
                  <input
                    type="checkbox"
                    checked={permission.allowed === 1}
                    onChange={() => toggleUserPermission(permission.permission_id)}
                  />
                  <span>{permission.permission_name}</span>
                </label>
              ))}
            </div>
            <div className="permission-modal-actions">
              <button type="button" className="btn secondary" onClick={() => setSelectedUser(null)}>
                Cancel
              </button>
              <button type="button" className="btn permission-save-btn" onClick={saveUserPermissions}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
