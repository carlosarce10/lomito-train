import './Button.scss';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'c-button',
  disabled = false,
  className = '',
}) {
  const classes = [
    'c-button',
    `c-button--${variant}`,
    `c-button--${size}`,
    disabled ? 'c-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
