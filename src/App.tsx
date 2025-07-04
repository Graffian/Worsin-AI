import { useState } from 'react'
import viteLogo from '/vite.svg'
import styles from './App.module.css'

function App() {

  return (
    <>
      <div className={styles.container}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className={styles.logo} alt="Vite logo" />
        </a>
      </div>
      <h1 className={styles.title}>Worsin AI</h1>
      <div className={styles.card}>
        <input
          type="text"
          placeholder="Enter OpenAI secret key"
          className={styles.input}
        />
        <button className={styles.button}>Enter</button>
      </div>
    </>
  )
}

export default App
