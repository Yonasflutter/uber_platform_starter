
'use client';
import React, { useEffect, useState } from 'react';
import { sb } from '../lib/supabase';

export default function Home() {
  const [kpi, setKpi] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: mv } = await sb.from('mv_ops_kpi').select('*').order('bucket',{ascending:false}).limit(24);
      setKpi(mv||[]);
      const { data: rs } = await sb.from('rides').select('*').order('requested_at',{ascending:false}).limit(25);
      setRides(rs||[]);
    })();
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h1>Ops Dashboard</h1>
      <h2>KPI (laatste 24 uur)</h2>
      <pre>{JSON.stringify(kpi, null, 2)}</pre>
      <h2>Laatste ritten</h2>
      <pre>{JSON.stringify(rides, null, 2)}</pre>
    </div>
  );
}
