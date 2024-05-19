'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'react-bootstrap-icons';

export default function NavbarSearch() {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  return (
    <div className='relative hidden md:block'>
      <div className='absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3'>
        <Search />
      </div>
      <input
        type='text'
        className='text-sm rounded-lg block w-full ps-10 p-2.5  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500'
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
