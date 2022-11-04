import styles from './MenuButton.module.scss'

import * as OctIcon from '@primer/octicons-react'
import React, { useState } from 'react'

export default function MenuButton(props) {
    const Icon = OctIcon[props.icon] 
    return (
        <div className={`${props.className} ${styles.btn}  ${props.isOpen? styles.open: ''}`}>
            <div className={`${styles.btnHandle} ${styles[props.type]} `}  onClick={ e => props.onHandleClick(e) }><Icon ></Icon></div>
            <div className={`${styles.menu}`} >
                {props.children}
            </div>
        </div>
    )
}
