import Link from 'next/link';

export default function SlotsPage() {
  return (
    <div id="app" style={{ padding: '2rem' }}>
      <Link href="/" className="btn btn--blue d-flex align-center" style={{ marginBottom: '1rem' }}>
        <span>Back to home</span>
      </Link>
      <h1>Slots</h1>
      <p style={{ color: '#7485b7', marginTop: '0.5rem' }}>Coming soon.</p>
    </div>
  );
}
