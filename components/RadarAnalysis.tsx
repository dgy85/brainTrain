import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
}

const RadarAnalysis: React.FC<Props> = ({ stats }) => {
  const data = [
    { subject: 'Calculation', A: stats.calculation, fullMark: 100 },
    { subject: 'Execution', A: stats.execution, fullMark: 100 },
    { subject: 'Memory', A: stats.memory, fullMark: 100 },
    { subject: 'Attention', A: stats.attention, fullMark: 100 },
    { subject: 'Visual', A: stats.visual, fullMark: 100 },
    { subject: 'Abstraction', A: stats.abstraction, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 sm:h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Brain Power"
            dataKey="A"
            stroke="#10b981"
            strokeWidth={3}
            fill="#10b981"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#10b981' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Center Score Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        <div className="w-24 h-24 bg-accent rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default RadarAnalysis;