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
    
    // <div className='flex justify-center min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-blue-400 items-center'>
    <div className='flex justify-center min-h-screen bg-black items-center'>
      <h1 className='text-fuchsia-50 text-2xl'>Halaman Utama</h1>

    </div>
    
  );
}