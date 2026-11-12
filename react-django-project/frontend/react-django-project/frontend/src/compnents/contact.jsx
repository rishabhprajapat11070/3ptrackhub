import { useState } from "react";
import axios from "axios";
import { HEAD, MUTED, INK, ACCENT, SURFACE, INK_BORDER, BTN_PRIMARY } from "./theme.js";

// Free key from https://web3forms.com (use the email that should receive the details).
// Put it in .env as VITE_WEB3FORMS_KEY=your_key, or paste it below.
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const FIELD = `w-full rounded-[10px] border-2 px-4 py-3 text-[16px] outline-none focus:border-[#0B7A55] dark:focus:border-[#4ADE9F] ${SURFACE} ${INK} ${INK_BORDER}`;
const LABEL = `${HEAD} mb-1.5 block text-[15px] font-bold`;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState(""); // "", "sending", "done", "error", "invalid"

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

async function onSubmit(e) {
  e.preventDefault();
  const ok =
    form.name.trim() &&
    /^\S+@\S+\.\S+$/.test(form.email) &&
    form.phone.replace(/\D/g, "").length >= 10;
  if (!ok) return setStatus("invalid");
  if (!ACCESS_KEY) return setStatus("error");

  setStatus("sending");
  try {
    const { data } = await axios.post(
      "https://api.web3forms.com/submit",
      {
        access_key: ACCESS_KEY,
        subject: `New enquiry from ${form.name}`,
        from_name: "Website Contact Form",
        replyto: form.email,
        botcheck: "",
        ...form,
      },
      { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );
    if (!data.success) throw new Error(data.message);
    setForm({ name: "", email: "", phone: "" });
    setStatus("done");
  } catch {
    setStatus("error");
  }
}

return (
    <section id="contact" className="py-14 md:py-20">
      <div className="grid items-start gap-10 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className={`${ACCENT} text-[15px] font-bold`}>Contact us</p>
          <h2 className={`${HEAD} mt-3 max-w-[12em] text-[clamp(30px,4vw,44px)] font-bold leading-[1.05]`}>
            Tell us what you need to track
          </h2>
          <p className={`${MUTED} mt-4 max-w-[28em] text-[18px]`}>
            Leave your name, email and phone number. Your details go straight to our team’s inbox and we will get in touch.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className={`space-y-5 rounded-[22px] border-2 p-6 md:p-8 ${SURFACE} ${INK_BORDER}`}>
          <div>
            <label htmlFor="name" className={LABEL}>Name</label>
            <input id="name" name="name" value={form.name} onChange={onChange} className={FIELD} placeholder="Full name" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email" className={LABEL}>Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} className={FIELD} placeholder="you@company.com" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="phone" className={LABEL}>Phone number</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} className={FIELD} placeholder="+91 98765 43210" autoComplete="tel" />
          </div>

          <button type="submit" disabled={status === "sending"} className={`${BTN_PRIMARY} w-full text-center disabled:opacity-70`}>
            {status === "sending" ? "Sending..." : "Send details"}
          </button>

          <p aria-live="polite" className={`font-semibold ${status === "done" ? INK : "text-[#C0392B] dark:text-[#FF8A7A]"}`}>
            {status === "done" && "Thank you. Your details have been sent and we will contact you soon."}
            {status === "invalid" && "Please enter your name, a valid email and a phone number."}
            {status === "error" && "Something went wrong. Please try again."}
          </p>
          <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

        </form>
      </div>
    </section>
  );
}
