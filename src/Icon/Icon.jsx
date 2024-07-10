import React from 'react'
import classnames from 'classnames'
import styles from './Icon.css'

function Icon(props) {
  const {
    icon: IconComponent,
    label,
    className,
    focusable,
    ariaHidden,
    iconAsImage,
    role,
  } = props

  if (iconAsImage) {
    return (
      <span
        className={classnames([styles.root, styles.image, className])}
        aria-hidden={ariaHidden}
      >
        <img
          width="100%"
          height="100%"
          alt={label}
          aria-label={label}
          src={iconAsImage}
        />
      </span>
    )
  }
  return (
    <span
      className={classnames([styles.root, className])}
      aria-hidden={ariaHidden}
    >
      <IconComponent
        role={role}
        width="1em"
        height="1em"
        aria-label={label}
      />
    </span>
  )
}

export default Icon
