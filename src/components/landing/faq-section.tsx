"use client";

import Accordion from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Can I create an invoice with VAT from Invoiceify?",
    answer:
      "Yes! When creating an invoice, you can add VAT or any tax rate to each line item. For Tax Invoices specifically, the tax breakdown is shown separately on the final document with totals per tax rate.",
  },
  {
    question: "How do I create a PDF invoice step by step?",
    answer:
      "It's simple: 1) Choose your document type (invoice, receipt, quote, etc.), 2) Fill in your business details and your client's details, 3) Add your line items with descriptions, quantities, and prices, 4) Choose a template design, and 5) Download your PDF. You can do all of this without creating an account.",
  },
  {
    question: "What types of documents can I generate besides invoices?",
    answer:
      "Invoiceify supports 11 document types: Invoice, Tax Invoice, Proforma Invoice, Receipt, Sales Receipt, Cash Receipt, Quote, Estimate, Credit Note, Purchase Order, and Delivery Note. Each has fields tailored to its purpose.",
  },
  {
    question: "Can I customize my invoices?",
    answer:
      "Yes! You can upload your company logo, choose from multiple professional templates, set your preferred currency, add custom notes and terms, and configure tax rates. Your business details are saved for quick reuse on future invoices.",
  },
  {
    question: "Can I invoice from different companies?",
    answer:
      "Yes. Each invoice you create can have different sender information, so you can create invoices on behalf of multiple businesses or brands from the same account.",
  },
  {
    question: "Do I need to register to create an invoice?",
    answer:
      "No! You can create and download invoices as a guest without signing up. However, creating a free account lets you save your invoices, track their status, manage clients, and access them from any device.",
  },
  {
    question: "Can I download the invoice as a PDF once it's created?",
    answer:
      "Absolutely. Every document you create can be downloaded as a professional PDF, ready to send to your client via email or print. The PDF includes all the details you entered, formatted in your chosen template design.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="bg-white py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-8">
          FAQ
        </h2>
        <Accordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
