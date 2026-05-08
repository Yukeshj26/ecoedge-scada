import { useDevices } from '../hooks/useFirebase';
import NodeCard from '../components/NodeCard';

const FALLBACK_NODES = {
  node_001: { name: 'Node Alpha', location: 'Village A', type: 'solar_hybrid' },
  node_002: { name: 'Node Beta', location: 'Village B', type: 'wind_solar' },
  node_003: { name: 'Node Gamma', location: 'Village C', type: 'solar_only' },
};

export default function Nodes() {
  const { devices } = useDevices();
  const resolvedDevices = Object.keys(devices).length > 0 ? devices : FALLBACK_NODES;
  const nodeIds = Object.keys(resolvedDevices);

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#e8edf2',
        }}>
          Node Registry
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Mono'",
          fontSize: 11,
          color: '#455060',
          marginTop: 4,
        }}>
          All registered microgrid edge nodes · live telemetry + CSI
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {nodeIds.map(nodeId => (
          <NodeCard
            key={nodeId}
            nodeId={nodeId}
            deviceMeta={resolvedDevices[nodeId]}
            selected={false}
          />
        ))}
      </div>
    </div>
  );
}
