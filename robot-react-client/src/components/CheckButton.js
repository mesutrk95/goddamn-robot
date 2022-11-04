import React, { useState } from 'react'
import styles from './CheckButton.module.scss'

export default function CheckButton(props) { 
    const [value, setValue] = useState(props.value)

    function onChange(){
        const nv =!value;
        setValue(nv)
        props.onChange(nv)
    }
    return (
        <label className={styles.chk}>
            {props.label}
        <input type="checkbox"  name="radio" 
                onChange={e =>  onChange(e) } value={value} />
        <span  className={styles.checkmark} ></span>
        </label>
    )
}
