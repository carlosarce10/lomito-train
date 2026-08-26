import './Button.scss';

export default function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled = false, className = '' }) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    disabled ? 'button--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
