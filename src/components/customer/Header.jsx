import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm p-6 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Burger Factory</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full shadow-md">
          Chamar Garçom
        </button>
      </div>
    </header>
  );
}