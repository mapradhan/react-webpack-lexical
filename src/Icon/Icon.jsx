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
          focusable={focusable.toString()}
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
        focusable={focusable.toString()}
      />
    </span>
  )
}

// Icon.propTypes = {
//   /* actual icon svg component */
//   icon: PropTypes.func.isRequired,
//   /* The aria label of the icon */
//   label: PropTypes.string,
//   /* Use your own class  */
//   className: PropTypes.string,
//   /* Set icon focusable or not */
//   focusable: PropTypes.bool,
//   /* Make icon hidden for AT reader */
//   ariaHidden: PropTypes.bool,
//   iconAsImage: PropTypes.string,
//   role: PropTypes.string,
// }

// Icon.defaultProps = {
//   label: null,
//   className: null,
//   focusable: false,
//   ariaHidden: null,
//   iconAsImage: null,
//   role: null,
// }

export default Icon
