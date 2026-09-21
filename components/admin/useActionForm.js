"use client";

import { useActionState, useCallback, useEffect, useRef, useTransition } from "react";

// Wires a Server Action to a <form> WITHOUT React 19's automatic form reset.
//
// Passing an action straight to <form action={…}> empties every field once the
// action finishes — even when it failed validation, which would make people
// retype everything after each error. Submitting through onSubmit keeps what
// they typed; on success the page re-renders with fresh server data and the
// forms remount via their `key`.
//
// `resetKey` (optional) is any value that changes when the underlying record
// changes, e.g. order.updated_at. An error shown by this form is hidden once
// the key moves on — so "Add the courier first" doesn't linger after the
// courier has been added through a different box on the same page. Success
// messages are kept.
//
//   const { state, pending, onSubmit } = useActionForm(saveThingAction, order.updated_at);
//   <form onSubmit={onSubmit}> … {state?.error} … </form>
export function useActionForm(action, resetKey) {
  const keyRef = useRef(resetKey);
  useEffect(() => {
    keyRef.current = resetKey;
  }, [resetKey]);

  // Stamp each result with the key that was current when it came back.
  const stamped = useCallback(
    async (previous, formData) => {
      const result = await action(previous, formData);
      return { ...result, _key: keyRef.current };
    },
    [action]
  );

  const [raw, dispatch, pending] = useActionState(stamped, null);
  const [, startTransition] = useTransition();

  const state = raw && raw.error && raw._key !== resetKey ? null : raw;

  function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  }

  return { state, pending, onSubmit };
}
