"use client";

// A submit button that asks "are you sure?" first. Works inside a server-rendered <form>.
export default function ConfirmButton({ message, className, children }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
