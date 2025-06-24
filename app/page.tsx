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


  return (
    <>
    </>
  );
}