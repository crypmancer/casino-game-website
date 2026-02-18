'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BoomCityPage() {
  const [info, setInfo] = useState<{ coeff: string; players: number; sum: number }[]>([]);

  useEffect(() => {
    fetch('/api/boom_city/get', { method: 'POST' }).then((r) => r.json()).then((d) => d.info && setInfo(d.info));
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <p><Link href="/">← Back to home</Link></p>
      <h1>Boom City</h1>
      <p>Game server runs rounds. Bet data:</p>
      <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
        {info.map((i, idx) => (
          <li key={idx} style={{ padding: '0.25rem 0' }}>Mult. {i.coeff}: players {i.players}, sum {i.sum}</li>
        ))}
      </ul>
    </div>
  );
}
