import { useState } from 'react'
import styles from './RadioButton.module.scss'

export default function RadioButton(props) { 
  return (
    <label className={styles.radio}>
        {props.label}
      <input type="radio" defaultChecked={props.value === props.checked} name="radio" 
                onChange={e => props.onChange(props.value)}/>
      <span  className={styles.checkmark} ></span>
    </label>
  )
}
