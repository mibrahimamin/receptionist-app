"use client";

import { useState } from "react";
import type { Faq, Service } from "@/lib/types";
import QuickActions from "./QuickActions";
import FaqPanel from "./FaqPanel";
import ContactForm from "./ContactForm";
import BookingFlow from "./BookingFlow";

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
};

type Panel = "menu" | "faq" | "contact" | "booking";

type BusinessInfo = {
  id: string;
  slug: string;
  name: string;
  greeting: string;
  timezone: string;
};

let idCounter = 0;
const nextId = () => `msg-${idCounter++}`;

export default function ChatWidget({
  business,
  services,
  faqs,
}: {
  business: BusinessInfo;
  services: Service[];
  faqs: Faq[];
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      role: "bot",
      text: business.greeting,
    },
  ]);

  const [panel, setPanel] = useState<Panel>("menu");

  const addBotMessage = (text: string) =>
    setMessages((messages) => [
      ...messages,
      {
        id: nextId(),
        role: "bot",
        text,
      },
    ]);

  const addUserMessage = (text: string) =>
    setMessages((messages) => [
      ...messages,
      {
        id: nextId(),
        role: "user",
        text,
      },
    ]);

  function handleQuickAction(
    action: "faq" | "booking" | "contact"
  ) {
    if (action === "faq") {
      addUserMessage("I have a question.");
      addBotMessage("Sure — what would you like to know?");
      setPanel("faq");
    } else if (action === "booking") {
      addUserMessage("I'd like to book an appointment.");
      addBotMessage(
        "Happy to help. Let's start with which service you're after."
      );
      setPanel("booking");
    } else {
      addUserMessage("I'd like to leave my contact info.");
      addBotMessage(
        "Of course — leave your details and we'll get back to you."
      );
      setPanel("contact");
    }
  }

  function handleFaqAsked(
    question: string,
    answer: string | null
  ) {
    addUserMessage(question);

    if (answer) {
      addBotMessage(answer);
    } else {
      addBotMessage(
        "I don't have an exact answer for that on file. Leave your details below and we'll follow up personally."
      );

      setPanel("contact");
      return;
    }

    setPanel("menu");
  }

  function handleContactSubmitted(name: string) {
    addUserMessage(`${name} left their contact details.`);

    addBotMessage(
      `Thanks, ${
        name.split(" ")[0]
      } — we'll be in touch shortly. Anything else I can help with?`
    );

    setPanel("menu");
  }

  function handleBookingConfirmed(summary: string) {
    addUserMessage("Booked an appointment.");

    addBotMessage(
      `You're booked! ${summary} We look forward to seeing you. Anything else?`
    );

    setPanel("menu");
  }

  return (
    <div className="ledger-card p-6 sm:p-8">
      <span className="ledger-tab">Front Desk</span>

      <div className="space-y-3 mb-6 max-h-[420px] overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-ink text-paper rounded-br-sm"
                  : "bg-paperDark text-ink rounded-bl-sm"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10 pt-5">
        {panel === "menu" && (
          <QuickActions onSelect={handleQuickAction} />
        )}

        {panel === "faq" && (
          <FaqPanel
            faqs={faqs}
            onAsked={handleFaqAsked}
            onBack={() => setPanel("menu")}
          />
        )}

        {panel === "contact" && (
          <ContactForm
  businessId={business.id}
  businessSlug={business.slug}
  onSubmitted={handleContactSubmitted}
  onBack={() => setPanel("menu")}
/>
        )}

        {panel === "booking" && (
          <BookingFlow
            services={services}
            businessId={business.id}
            businessSlug={business.slug}
            timezone={business.timezone}
            onConfirmed={handleBookingConfirmed}
            onBack={() => setPanel("menu")}
          />
        )}
      </div>
    </div>
  );
}