import {useState} from 'react'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <>
      <div className='flex justify-center items-center'>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo items-center" alt="Vite logo" />
        </a>
      </div>
      <h1 className='text-3xl font-semibold mb-8'>Worsin AI</h1>
      <div className="card flex flex-col justify-center items-center">
        <input type="text" placeholder='Enter OpenAI secret key' className='w-fit text-[1.2rem] bg-[#333] rounded-full px-4 py mb-2'/>
        <button className='text-[1.1rem] bg-[#555] rounded-full w-fit px-4 py cursor-pointer'>Enter</button>
      </div>
    </>
  )
}

export default App
