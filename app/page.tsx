// app/page.js
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);

  // Fungsi untuk memanggil API GET
  const fetchData = async () => {
    const res = await fetch('/api/quiz');
    const result = await res.json();
    setMessage(result.data.question);
  };

  // Fungsi untuk memanggil API POST
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    });
    const result = await res.json();
    setResponse(result);
  };

  return (
    <div>
      <h1>Fundamental API di Next.js</h1>

      <hr />

      <h2>Test API GET</h2>
      <button onClick={fetchData}>Panggil /api/quiz</button>
      <p>Pesan dari Server: <strong>{message}</strong></p>

      <hr />

      <h2>Test API POST</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama Anda"
        />
        <button type="submit">Kirim ke /api/answer</button>
      </form>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}