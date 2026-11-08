"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <Headphones className="w-3.5 h-3.5" />
            <span>Customer Concierge Desk</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            We Are Here to Assist You
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Have questions about jewellery styling, bespoke gift curation, or delivery tracking? Our concierge team is at your service.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Contact Details Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-champagne/60 p-6 sm:p-8 space-y-6 shadow-subtle">
              <h2 className="font-serif text-xl text-charcoal font-medium pb-2 border-b border-secondary-bg">
                Direct Touchpoints
              </h2>

              <div className="space-y-4 text-xs text-dark-brown/80">
                <div className="flex items-start gap-3.5">
                  <Phone className="w-4 h-4 text-muted-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-charcoal block">Telephone & WhatsApp</span>
                    <a href="tel:+918000123456" className="text-muted-gold font-medium hover:underline block mt-0.5">
                      +91 8000 123 456
                    </a>
                    <span className="text-[11px] text-dark-brown/60">Mon – Sat: 10:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-4 h-4 text-muted-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-charcoal block">Email Concierge</span>
                    <a href="mailto:care@tiniwish.com" className="text-muted-gold font-medium hover:underline block mt-0.5">
                      care@tiniwish.com
                    </a>
                    <span className="text-[11px] text-dark-brown/60">Guaranteed response within 4 hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="w-4 h-4 text-muted-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-charcoal block">Registered Headquarters</span>
                    <p className="text-[11px] text-dark-brown/70 mt-0.5 leading-relaxed">
                      TiniWish Luxury Retails LLP<br />
                      Plot 42, DLF Phase 5, Golf Course Road<br />
                      Gurugram, Haryana - 122002, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Grievance Redressal */}
              <div id="grievance" className="pt-4 border-t border-secondary-bg text-[11px] text-dark-brown/70 space-y-1">
                <span className="font-semibold text-charcoal block">Nodal & Grievance Redressal</span>
                <p>Officer: Priyadarshini Rao (Grievance Head)</p>
                <p>Email: <a href="mailto:grievance@tiniwish.com" className="text-muted-gold hover:underline">grievance@tiniwish.com</a></p>
                <p className="text-[10px] text-dark-brown/60">Redressal turn-around within 48 business hours as per Consumer Protection (E-Commerce) Rules 2020.</p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-2xl border border-champagne/60 p-6 sm:p-8 shadow-subtle">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-2xl text-charcoal">Your Note Has Been Received</h3>
                  <p className="text-xs sm:text-sm text-dark-brown/70 max-w-sm mx-auto leading-relaxed">
                    Thank you for writing to our concierge desk, {formData.name}. A customer specialist will attend to your inquiry shortly via email at <span className="font-medium text-charcoal">{formData.email}</span>.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
                    }}
                    variant="outline"
                    className="text-xs uppercase tracking-wider border-champagne text-charcoal cursor-pointer mt-4"
                  >
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif text-xl text-charcoal font-medium pb-2 border-b border-secondary-bg">
                    Send a Note to Our Stylists
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1">
                        Full Name *
                      </label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Radhika Sharma"
                        className="bg-white border-champagne text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. radhika@gmail.com"
                        className="bg-white border-champagne text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1">
                        Phone (Optional)
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="bg-white border-champagne text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-champagne bg-white text-xs text-charcoal outline-none focus:border-muted-gold"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Jewellery Sizing & Styling">Jewellery Sizing & Styling</option>
                        <option value="Bespoke Gifting & Wedding Hampers">Bespoke Gifting & Wedding Hampers</option>
                        <option value="Order Tracking & Logistics">Order Tracking & Logistics</option>
                        <option value="Returns & Exchanges">Returns & Exchanges</option>
                        <option value="Corporate Luxe Gifting">Corporate Luxe Gifting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1">
                      Message *
                    </label>
                    <Textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please let us know how we can assist you..."
                      className="bg-white border-champagne text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs h-11 font-sans uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Deliver Note</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
