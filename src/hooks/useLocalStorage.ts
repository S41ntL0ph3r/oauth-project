'use client'

import { useState, useEffect } from 'react'

type SetValue<T> = T | ((val: T) => T)

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  // State to store our value
  // Sempre inicia com initialValue para evitar hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  
  // Sincroniza com localStorage após a hidratação
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
    }
  }, [key])

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
