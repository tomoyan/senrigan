import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import { Eye, Activity } from 'lucide-react';

const CustomNode = ({ data, isConnectable }) => {
  return (
    <div className={`senrigan-node ${data.type === 'function' ? 'func-node' : ''} ${data.isActive ? 'active-glow' : ''}`}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ opacity: 0 }} />
      <div className="node-title">{data.type === 'function' ? 'Function' : 'File'}</div>
      <div className="node-name">{data.label}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastNodeId, setLastNodeId] = useState(null);

  // Layout engine (very simple vertical/horizontal spread)
  const getLayoutedElements = useCallback((pulseData, currentNodes, currentEdges, prevNodeId) => {
    let newNodes = [...currentNodes];
    let newEdges = [...currentEdges];
    
    const fileId = `file-${pulseData.file}`;
    const funcId = `func-${pulseData.file}-${pulseData.functionName}`;
    
    let fileNode = newNodes.find(n => n.id === fileId);
    let funcNode = newNodes.find(n => n.id === funcId);
    
    // Create File Node if missing
    if (!fileNode) {
      const fileCount = newNodes.filter(n => n.data.type !== 'function').length;
      fileNode = {
        id: fileId,
        type: 'custom',
        position: { x: 250 * fileCount + 100, y: 100 },
        data: { label: pulseData.file, type: 'file', isActive: false },
      };
      newNodes.push(fileNode);
    }
    
    // Create Function Node if missing
    if (!funcNode && pulseData.functionName) {
      const parentFuncsCount = newNodes.filter(n => n.id.startsWith(`func-${pulseData.file}`)).length;
      funcNode = {
        id: funcId,
        type: 'custom',
        position: { x: fileNode.position.x, y: fileNode.position.y + 150 + (parentFuncsCount * 100) },
        data: { label: pulseData.functionName, type: 'function', isActive: false },
      };
      newNodes.push(funcNode);
      
      // Edge from File to Function
      const fileToFuncEdge = {
        id: `e-${fileId}-${funcId}`,
        source: fileId,
        target: funcId,
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.2)' }
      };
      if (!newEdges.find(e => e.id === fileToFuncEdge.id)) {
        newEdges.push(fileToFuncEdge);
      }
    }
    
    // Reset active states
    newNodes = newNodes.map(n => ({
      ...n,
      data: { ...n.data, isActive: false }
    }));
    
    // Set current nodes active
    newNodes = newNodes.map(n => {
      if (n.id === fileId || n.id === funcId) {
        return { ...n, data: { ...n.data, isActive: true } };
      }
      return n;
    });

    const currentNodeId = funcId || fileId;

    // Create execution pathway edge from previous node if exists
    if (prevNodeId && prevNodeId !== currentNodeId) {
      const pathwayEdgeId = `path-${prevNodeId}-${currentNodeId}-${Date.now()}`;
      newEdges.push({
        id: pathwayEdgeId,
        source: prevNodeId,
        target: currentNodeId,
        type: 'bezier',
        animated: true,
        className: 'pulse-active',
        style: { stroke: 'var(--accent-cyan)', zIndex: 1000 },
      });
      
      // Cleanup old pathways so we don't spam the DOM
      const pathwayEdges = newEdges.filter(e => e.id.startsWith('path-'));
      if (pathwayEdges.length > 10) {
        const toRemove = pathwayEdges[0].id;
        newEdges = newEdges.filter(e => e.id !== toRemove);
      }
    }

    return { nodes: newNodes, edges: newEdges, currentNodeId };
  }, []);

  // Safe handler that avoids stale closures
  const handlePulse = useCallback((pulse) => {
    setNodes(nds => {
      setEdges(eds => {
        setLastNodeId(prevId => {
          const { nodes: newNodes, edges: newEdges, currentNodeId } = getLayoutedElements(pulse, nds, eds, prevId);
          setTimeout(() => {
            setNodes(newNodes);
            setEdges(newEdges);
          }, 0);
          return currentNodeId;
        });
        return eds;
      });
      return nds;
    });
  }, [getLayoutedElements]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000?client=dashboard');
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'pulse') {
        handlePulse(data.data);
      }
    };
    return () => ws.close();
  }, [handlePulse]);

  return (
    <>
      <div className="header">
        <Eye size={28} color="var(--accent-cyan)" />
        <h1>Senrigan Visualizer</h1>
        <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulsing-dot" style={{ animationPlayState: isConnected ? 'running' : 'paused', backgroundColor: isConnected ? 'var(--accent-cyan)' : '#ef4444' }}></div>
          {isConnected ? 'Collector Connected' : 'Disconnected'}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
        >
          <Background color="#333" gap={16} />
          <MiniMap nodeColor={(n) => n.data.type === 'function' ? 'var(--accent-purple)' : 'var(--bg-panel)'} maskColor="rgba(0,0,0,0.5)" />
          <Controls />
        </ReactFlow>
      </div>
    </>
  );
}

export default App;
