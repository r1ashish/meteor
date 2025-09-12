import React, { useState } from "react";
import Modal from "./Modal";

export default function WhatsAppChat({ open, onClose }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Hi, I'm interested in your stationery products and need some help"
  );

  const startChat = () => {
    if (!phone) {
      alert("Please enter your phone number");
      return;
    }
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/+919876543210?text=${encoded}`;
    window.open(url, "_blank");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="💬 Chat with us on WhatsApp">
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Enter your phone number:</label>
          <input
            className="input"
            placeholder="+91 XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Message:</label>
          <textarea
            className="input min-h-24"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button className="btn btn-primary px-4 py-2" onClick={startChat}>
          Start Chat
        </button>
      </div>
    </Modal>
  );
}
