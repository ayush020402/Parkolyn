"use client";

import { useActionForm } from "@/components/useActionForm";
import { btnDanger, btnGhost, btnGold, btnPrimary, Field, Notice, inputCls } from "@/components/admin/ui";
import {
  createCourierAction,
  deleteCourierAction,
  toggleCourierAction,
  updateCourierAction,
} from "./actions";

function Result({ state }) {
  if (!state) return null;
  if (state.error) return <Notice tone="error">{state.error}</Notice>;
  if (state.message) return <Notice tone="success">{state.message}</Notice>;
  return null;
}

export function AddCourierForm() {
  const { state, pending, onSubmit } = useActionForm(createCourierAction);

  // Remounting the form after a successful add clears its fields.
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2" key={state?.ok ? state.message : "add"}>
      <Field label="Courier name">
        <input name="name" required minLength={2} maxLength={60} placeholder="e.g. Trackon Couriers" className={inputCls} />
      </Field>
      <Field label="Tracking link (optional)" hint="Use {awb} where the tracking number goes — customers get a working link.">
        <input name="tracking_url_template" placeholder="https://example.com/track?no={awb}" className={inputCls} />
      </Field>
      <div className="sm:col-span-2">
        <Result state={state} />
      </div>
      <div>
        <button type="submit" disabled={pending} className={btnGold}>{pending ? "Adding…" : "Add courier"}</button>
      </div>
    </form>
  );
}

export function CourierRow({ courier }) {
  const { state: saveState, pending: saving, onSubmit: onSave } = useActionForm(updateCourierAction);
  const { state: toggleState, pending: toggling, onSubmit: onToggle } = useActionForm(toggleCourierAction);
  const { state: deleteState, pending: deleting, onSubmit: onDelete } = useActionForm(deleteCourierAction);
  const error = saveState?.error || toggleState?.error || deleteState?.error;

  return (
    <li className={`p-4 ${courier.active ? "" : "bg-stone-50"}`}>
      <div className="flex flex-wrap items-start gap-3">
        <form onSubmit={onSave} className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto]">
          <input type="hidden" name="id" value={courier.id} />
          <input
            name="name"
            defaultValue={courier.name}
            required
            minLength={2}
            maxLength={60}
            aria-label="Courier name"
            className={`${inputCls} ${courier.active ? "" : "text-stone-400"}`}
          />
          <input
            name="tracking_url_template"
            defaultValue={courier.tracking_url_template ?? ""}
            placeholder="Tracking link with {awb} (optional)"
            aria-label="Tracking link template"
            className={`${inputCls} font-mono text-xs`}
          />
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Save"}</button>
        </form>

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs text-stone-500">
            {courier.orderCount} order{courier.orderCount === 1 ? "" : "s"}
          </span>
          <form onSubmit={onToggle}>
            <input type="hidden" name="id" value={courier.id} />
            <input type="hidden" name="active" value={String(!courier.active)} />
            <button type="submit" disabled={toggling} className={btnGhost}>{courier.active ? "Switch off" : "Switch on"}</button>
          </form>
          <form
            onSubmit={(e) => {
              if (!window.confirm(`Delete ${courier.name} from the list?`)) {
                e.preventDefault();
                return;
              }
              onDelete(e);
            }}
          >
            <input type="hidden" name="id" value={courier.id} />
            <button type="submit" disabled={deleting || courier.orderCount > 0} title={courier.orderCount > 0 ? "Used on orders — switch it off instead" : "Delete"} className={btnDanger}>
              Delete
            </button>
          </form>
        </div>
      </div>
      {!courier.active && <p className="mt-2 text-xs text-stone-400">Switched off — not offered when shipping new orders.</p>}
      {(error || saveState?.message) && (
        <div className="mt-3">
          {error ? <Notice tone="error">{error}</Notice> : <Notice tone="success">{saveState.message}</Notice>}
        </div>
      )}
    </li>
  );
}
