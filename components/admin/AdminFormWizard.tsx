"use client"

import { Children, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function AdminFormWizard({
  steps,
  submitLabel,
  cancel,
  children,
}: {
  steps: Array<{ title: string; description?: string }>
  submitLabel: string
  cancel: React.ReactNode
  children: React.ReactNode
}) {
  const panels = useMemo(() => Children.toArray(children), [children])
  const [current, setCurrent] = useState(0)
  const [furthest, setFurthest] = useState(0)
  const fieldsets = useRef<Array<HTMLDivElement | null>>([])
  const last = current === panels.length - 1
  const progress = panels.length > 1 ? ((current + 1) / panels.length) * 100 : 100

  function currentStepIsValid() {
    const controls = Array.from(fieldsets.current[current]?.querySelectorAll("input, select, textarea") ?? [])
    return controls.every(control => control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement ? control.reportValidity() : true)
  }

  function goToStep(index: number) {
    if (index <= current || index <= furthest) {
      setCurrent(index)
      return
    }
    if (!currentStepIsValid()) return
    const next = Math.min(index, current + 1)
    setFurthest(value => Math.max(value, next))
    setCurrent(next)
  }

  return (
    <div className="admin-wizard">
      <div className="admin-wizard__progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="admin-wizard__steps" aria-label="Form progress">
        {steps.map((step, index) => (
          <button
            key={step.title}
            type="button"
            className={`admin-wizard__step${index === current ? " is-active" : ""}${index < current ? " is-done" : ""}`}
            onClick={() => goToStep(index)}
            disabled={index > furthest + 1}
          >
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
          </button>
        ))}
      </div>

      <section className="admin-wizard__panel">
        <div className="admin-wizard__panel-head">
          <span className="eyebrow">Step {current + 1} of {panels.length}</span>
          <h2>{steps[current]?.title}</h2>
          {steps[current]?.description && <p>{steps[current].description}</p>}
        </div>
        <div className="admin-wizard__fields">
          {panels.map((panel, index) => (
            <div
              key={index}
              ref={node => { fieldsets.current[index] = node }}
              className="admin-wizard__fieldset"
              data-active={index === current ? "true" : "false"}
              aria-hidden={index === current ? undefined : true}
            >
              {panel}
            </div>
          ))}
        </div>
      </section>

      <div className="admin-wizard__actions">
        <div>{cancel}</div>
        <div>
          {current > 0 && (
            <button type="button" className="btn btn--ghost" onClick={() => setCurrent(value => Math.max(0, value - 1))}>
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {!last ? (
            <button type="button" className="btn btn--primary" onClick={() => goToStep(current + 1)}>
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn btn--primary">{submitLabel}</button>
          )}
        </div>
      </div>
    </div>
  )
}
