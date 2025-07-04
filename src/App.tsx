import { useState } from 'react'
import wAILogo from '/final logo.svg'
import styles from './App.module.css'

function App() {

  return (
    <>
      <div className={styles.container}>
          <img src={wAILogo} className={styles.logo} alt="Worsin.AI logo" />
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
