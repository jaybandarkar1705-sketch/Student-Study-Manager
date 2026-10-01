export function SkeletonCard() {
  return (
    <div className="card card-body">
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '50%' }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      <td><div className="skeleton" style={{ height: 14, width: '70%' }} /></td>
      <td><div className="skeleton" style={{ height: 14, width: '50%' }} /></td>
      <td><div className="skeleton" style={{ height: 14, width: '40%' }} /></td>
      <td><div className="skeleton" style={{ height: 14, width: '30%' }} /></td>
    </tr>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 10 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: '60%' }} />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 14, width: `${60 + Math.random() * 30}%`, marginBottom: 8 }}
        />
      ))}
    </div>
  );
}
