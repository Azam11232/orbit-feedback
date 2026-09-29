import { useRef, useState, type FormEvent } from 'react'
import { supabase } from './supabase'
import './App.css'

const usageOptions = [
  'Portfolio',
  'Send / Receive',
  'Bridge',
  'Swap',
  'Security',
  'Unified Balance',
  'Just exploring',
]

const issueOptions = [
  'No issues',
  'Something was confusing',
  "Something didn't work",
  'Transaction issue',
  'UI issue',
]

function App() {
  const [selectedUsage, setSelectedUsage] = useState<string[]>([])
  const [rating, setRating] = useState('')
  const [issue, setIssue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submissionInProgress = useRef(false)

  function toggleUsage(option: string) {
    setSelectedUsage((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionInProgress.current) return

    submissionInProgress.current = true
    setIsSubmitting(true)
    setSubmitError('')

    const formData = new FormData(event.currentTarget)
    const ratingValue = formData.get('rating')
    const contactValue = String(formData.get('contact') ?? '').trim()

    try {
      const { error } = await supabase.from('feedback').insert({
        usage: selectedUsage,
        rating: ratingValue ? Number(ratingValue) : null,
        liked: String(formData.get('liked') ?? ''),
        better: String(formData.get('improve') ?? ''),
        next_build: String(formData.get('buildNext') ?? ''),
        issue: String(formData.get('issue') ?? '') || null,
        contact: contactValue || null,
      })

      if (error) {
        setSubmitError('We couldn’t submit your feedback. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setSubmitError('We couldn’t submit your feedback. Please try again.')
    } finally {
      submissionInProgress.current = false
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setSelectedUsage([])
    setRating('')
    setIssue('')
    setSubmitError('')
    setSubmitted(false)
  }

  return (
    <div className="site-shell">
      <header className="site-header page-width">
        <a className="brand" href="#top" aria-label="ORBIT feedback home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>ORBIT</span>
        </a>
        <div className="header-context" aria-label="ORBIT Feedback">
          <span>ORBIT</span>
          <span>Feedback</span>
        </div>
      </header>

      <main id="top" className="page-width">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> ORBIT FEEDBACK</p>
            <h1 id="hero-title">Help shape <span>ORBIT.</span></h1>
            <p className="hero-description">
              Your feedback helps us understand what works, what needs improvement,
              and what should come next.
            </p>
          </div>
          <div className="orbit-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core"><span /></div>
            <span className="orbit-signal" />
            <span className="orbit-star star-one" />
            <span className="orbit-star star-two" />
          </div>
        </section>

        <section className="feedback-panel" aria-labelledby="form-title">
          {submitted ? (
            <div className="success-state" role="status" aria-live="polite">
              <div className="success-mark" aria-hidden="true">✓</div>
              <p className="eyebrow">RESPONSE RECEIVED</p>
              <h2>Thanks for helping<br />shape ORBIT.</h2>
              <p className="success-copy">
                Your feedback has been recorded for this session. We'll use it to
                understand what to improve next.
              </p>
              <button className="secondary-button" type="button" onClick={resetForm}>
                Send another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">YOUR PERSPECTIVE</p>
                  <h2 id="form-title">Tell us what you think.</h2>
                </div>
                <span className="form-note"><span className="required-dot" /> All fields optional</span>
              </div>

              <div className="form-content">
                <fieldset className="form-section">
                  <legend>How are you using ORBIT?</legend>
                  <div className="choice-list">
                    {usageOptions.map((option) => (
                      <button
                        className={`choice-chip${selectedUsage.includes(option) ? ' is-selected' : ''}`}
                        type="button"
                        key={option}
                        aria-pressed={selectedUsage.includes(option)}
                        onClick={() => toggleUsage(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="form-section rating-section">
                  <legend>How was your overall experience?</legend>
                  <div className="rating-options" role="radiogroup" aria-label="Overall experience rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label className={`rating-option${rating === String(value) ? ' is-selected' : ''}`} key={value}>
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          checked={rating === String(value)}
                          onChange={(event) => setRating(event.target.value)}
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field-hint">1 = needs work <span aria-hidden="true">·</span> 5 = excellent</p>
                </fieldset>

                <div className="form-section textarea-section">
                  <label htmlFor="liked">What did you like?</label>
                  <textarea id="liked" name="liked" placeholder="Tell us what felt useful, fast, clear, or enjoyable..." rows={3} />
                </div>

                <div className="form-section textarea-section">
                  <label htmlFor="improve">What could be better?</label>
                  <textarea id="improve" name="improve" placeholder="Tell us what felt confusing, slow, missing, or frustrating..." rows={3} />
                </div>

                <div className="form-section textarea-section">
                  <label htmlFor="build-next">What should ORBIT build next?</label>
                  <textarea id="build-next" name="buildNext" placeholder="Describe a feature or improvement you'd like to see..." rows={3} />
                </div>

                <fieldset className="form-section issue-section">
                  <legend>Did you run into an issue?</legend>
                  <div className="issue-options">
                    {issueOptions.map((option) => (
                      <label className={`issue-option${issue === option ? ' is-selected' : ''}`} key={option}>
                        <input
                          type="radio"
                          name="issue"
                          value={option}
                          checked={issue === option}
                          onChange={(event) => setIssue(event.target.value)}
                        />
                        <span className="radio-indicator" aria-hidden="true" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="form-section contact-section">
                  <label htmlFor="contact">Want us to follow up?</label>
                  <input
                    id="contact"
                    name="contact"
                    type="text"
                    autoComplete="off"
                    placeholder="Email or X username (optional)"
                    aria-describedby="contact-hint"
                  />
                  <p className="field-hint" id="contact-hint">Optional. Only provide this if you'd like a response.</p>
                </div>
              </div>

              <div className="submit-area">
                {submitError && <p className="submit-error" role="alert">{submitError}</p>}
                <button className="submit-button" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit feedback'} <span aria-hidden="true">↗</span>
                </button>
                <p>Your feedback is private and used to improve ORBIT.</p>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="site-footer page-width">
        <div className="footer-brand">
          <span className="footer-wordmark">ORBIT</span>
          <span>Web3 Onchain Command Center</span>
        </div>
        <div className="footer-meta">
          <span>Feedback Portal</span>
          <span>© 2026 ORBIT</span>
        </div>
      </footer>
    </div>
  )
}

export default App
