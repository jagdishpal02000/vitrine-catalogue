import { useId, useState, type SubmitEvent } from 'react';
import { useSendEnquiry } from '../api/catalogue';
import type { Product } from '../api/types';
import styles from './EnquiryForm.module.css';

/** The Enquire button, the contact form it opens, and the thank-you message once it is sent (R5). */
export function EnquiryForm({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const sendEnquiry = useSendEnquiry();
  const headingId = useId();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = form.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };

    sendEnquiry.mutate({
      productId: product.id,
      name: field('name'),
      email: field('email'),
      phone: field('phone') || undefined,
      message: field('message') || undefined,
    });
  }

  if (sendEnquiry.isSuccess) {
    return (
      <p role="status" className={styles.thanks}>
        Thank you! We've sent your enquiry about {product.title} to our sales team. They'll be in
        touch soon.
      </p>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Enquire
      </button>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-labelledby={headingId}>
      <h2 id={headingId}>Enquire about this product</h2>
      <label>
        Name
        <input name="name" autoComplete="name" required maxLength={100} autoFocus />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label>
        Phone (optional)
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          pattern="[0-9 ()+\-]*"
          title="Digits, spaces and + ( ) - only"
        />
      </label>
      <label>
        Message (optional)
        <textarea name="message" rows={4} maxLength={2000} />
      </label>

      {sendEnquiry.isError && (
        <p role="alert" className={styles.error}>
          {sendEnquiry.error.message}
        </p>
      )}
      <button type="submit" disabled={sendEnquiry.isPending}>
        {sendEnquiry.isPending ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
