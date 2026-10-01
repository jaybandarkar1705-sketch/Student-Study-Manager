export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {Icon && <Icon size={32} />}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
