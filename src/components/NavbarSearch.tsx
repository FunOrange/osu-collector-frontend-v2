'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'react-bootstrap-icons';

export default function NavbarSearch() {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  return (
    <div className='relative hidden md:block'>
      <div className='pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3'>
        <Search color='currentColor' />
      </div>
      <input
        type='text'
        className='block w-full rounded-lg border-gray-600 bg-gray-700 p-2.5 ps-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
        placeholder='tech, aim, speed...'
        required
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && userInput.trim()) {
            router.push(`/all?search=${encodeURIComponent(userInput.trim())}`);
          }
        }}
      />
    </div>
  );
}
