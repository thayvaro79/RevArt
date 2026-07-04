import { useState } from "react";
import { createInquiry } from "../../api/inquiriesApi";

export default function InquirySection() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    subscribeToNewsletter: false,
  });

  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      setErrorMessage("Please complete first name, last name, email, and message.");
      return;
    }

    try {
      setSending(true);

      await createInquiry({
        tenantId: 1,
        vehicleId: null,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        message: form.message,
        subscribeToNewsletter: form.subscribeToNewsletter,
        sourcePage: "Garage",
      });

      setSuccessMessage("Thank you. Someone from RevArt will be in touch soon.");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        subscribeToNewsletter: false,
      });
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="inquiry-section">
      <div className="inquiry-copy">
        <h2>Looking for something else?</h2>

        <p>
          Tell us what you are looking for. We will notify you when a matching
          vehicle becomes available.
        </p>
      </div>

      <form className="inquiry-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            First Name
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
          </label>

          <label>
            Last Name
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
          </label>
        </div>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label>
          Message
          <textarea
            name="message"
            rows="6"
            value={form.message}
            onChange={handleChange}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="subscribeToNewsletter"
            checked={form.subscribeToNewsletter}
            onChange={handleChange}
          />
          Subscribe to our newsletter
        </label>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}