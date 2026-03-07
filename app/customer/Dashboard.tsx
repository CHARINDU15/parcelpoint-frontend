"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import ShipmentCard from "@/components/ShipmentCard";
import NotificationsCard from "@/components/NotificationsCard";
import DeliveryOptions from "@/components/DeliveryOptions";
import BottomBar from "@/components/BottomBar";

const shipmentData = {
estimatedDelivery: "Mon, 21 Feb 2024",
receiver: "Kasun Kalhara",
shippingNumber: "1Z662F412GS535527",
numberOfPackages: 2,
deliveryAddress: "37 Vishwa, Katuka, 800, Sri Lanka",
currentDeliveryOption: "Collect from Parcel",
};

export default function Dashboard() {
const [activeTab, setActiveTab] = useState("My Shipment");
const [openFAQ, setOpenFAQ] = useState<number | null>(null);

const faqData = [
{
question: "How can I track my parcel?",
answer:
"You can track your parcel by entering the shipment number in the tracking section. The system will show the real-time status of your delivery.",
},
{
question: "What delivery options are available?",
answer:
"Parcel Hub provides home delivery, hub collection, and scheduled delivery options depending on your location.",
},
{
question: "How long does delivery take?",
answer:
"Most islandwide deliveries are completed within 1–3 business days depending on the distance and delivery option selected.",
},
{
question: "Can I change my delivery address?",
answer:
"Yes. You can update your delivery address before the management deadline shown in your shipment dashboard.",
},
{
question: "What should I do if my parcel is delayed?",
answer:
"If your parcel is delayed beyond the expected date, please contact our support team through the Contact Hub page.",
},
];

const toggleFAQ = (index: number) => {
setOpenFAQ(openFAQ === index ? null : index);
};

return (
<div
className="min-h-screen flex flex-col"
style={{ backgroundColor: "#1a2332" }}
>
<TopBar onLogout={() => alert("Logged out")} /> <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

  <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">

    {/* ================= MY SHIPMENT ================= */}
    {activeTab === "My Shipment" && (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ShipmentCard {...shipmentData} />
          <NotificationsCard />
        </div>

        <DeliveryOptions managementDeadline="25/02/2024 11:59 PM" />
      </>
    )}

    {/* ================= CONTACT HUB ================= */}
    {activeTab === "Contact Hub" && (
      <div className="py-12 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-[#f1f5f9]">
          Contact Hub
        </h2>
        <p className="mt-2 text-center text-sm text-[#94a3b8]">
          We're here to help – reach out anytime.
        </p>

        <form className="mt-8 w-full max-w-xl space-y-4 bg-[#243044] p-6 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-[#f1f5f9]">
              Your Name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded bg-[#1a2332] border border-[#2c3a52] px-3 py-2 text-sm text-[#f1f5f9]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f1f5f9]">
              Email Address
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded bg-[#1a2332] border border-[#2c3a52] px-3 py-2 text-sm text-[#f1f5f9]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f1f5f9]">
              Message
            </label>
            <textarea
              className="mt-1 w-full rounded bg-[#1a2332] border border-[#2c3a52] px-3 py-2 text-sm text-[#f1f5f9]"
              rows={4}
              placeholder="How can we help?"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#f97316] rounded text-black font-semibold hover:bg-[#fb923c] transition"
          >
            Send Message
          </button>
        </form>
      </div>
    )}

    {/* ================= ABOUT HUB ================= */}
    {activeTab === "About Hub" && (
      <div className="flex flex-col gap-20 py-16">

        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9]">
            About Parcel Hub
          </h1>
          <p className="mt-4 text-[#94a3b8] text-sm sm:text-base">
            Parcel Hub is a modern parcel delivery platform designed to make
            shipping simple, secure, and reliable across Sri Lanka.
          </p>
        </div>

        <div className="flex justify-center">
          <div
            className="w-full max-w-4xl h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl relative"
            style={{
              backgroundImage: "url('/background.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center px-4">
                Delivering Happiness Across Sri Lanka
              </h2>
            </div>
          </div>
        </div>

        {/* OUR SERVICES */}
        <div>
          <h2 className="text-center text-2xl font-bold text-[#f1f5f9]">
            Our Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            <div className="bg-[#243044] p-6 rounded-xl text-center">
              📦 Parcel Delivery
              <p className="text-sm text-[#94a3b8] mt-2">
                Reliable islandwide parcel transportation with safe handling.
              </p>
            </div>

            <div className="bg-[#243044] p-6 rounded-xl text-center">
              🚚 Express Shipping
              <p className="text-sm text-[#94a3b8] mt-2">
                Fast delivery services for urgent shipments.
              </p>
            </div>

            <div className="bg-[#243044] p-6 rounded-xl text-center">
              📍 Real-Time Tracking
              <p className="text-sm text-[#94a3b8] mt-2">
                Monitor your parcel location anytime.
              </p>
            </div>
          </div>
        </div>

        {/* CORE VALUES */}
        <div>
          <h2 className="text-center text-2xl font-bold text-[#f1f5f9]">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-[#243044] p-6 rounded-xl text-center">
              🔒 Security
              <p className="text-sm text-[#94a3b8] mt-2">
                Every parcel is protected with secure logistics operations.
              </p>
            </div>

            <div className="bg-[#243044] p-6 rounded-xl text-center">
              ⚡ Efficiency
              <p className="text-sm text-[#94a3b8] mt-2">
                Optimized delivery routes for faster shipping.
              </p>
            </div>

            <div className="bg-[#243044] p-6 rounded-xl text-center">
              🤝 Trust
              <p className="text-sm text-[#94a3b8] mt-2">
                Building long-term relationships with customers and partners.
              </p>
            </div>
          </div>
        </div>

        {/* OUR TEAM */}
        <div className="bg-[#243044] p-10 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold text-[#f1f5f9] text-center">
            Our Team
          </h2>

          <p className="mt-6 text-center text-sm text-[#cbd5e1] max-w-3xl mx-auto leading-relaxed">
            Our team consists of logistics specialists, technology experts,
            and customer support professionals dedicated to providing the
            best parcel delivery experience. We continuously innovate our
            platform to improve delivery speed, transparency, and customer
            satisfaction.
          </p>
        </div>

      </div>
    )}

    {/* ================= FAQs ================= */}
    {activeTab === "FAQs" && (
      <div className="py-16 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#f1f5f9]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-[#94a3b8]">
            Find answers to common questions about Parcel Hub services.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-[#243044] rounded-xl border border-[#2c3a52] overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-5 py-4 text-left text-[#f1f5f9] font-medium"
              >
                {faq.question}
                <span className="text-[#f97316] text-xl">
                  {openFAQ === index ? "−" : "+"}
                </span>
              </button>

              {openFAQ === index && (
                <div className="px-5 pb-4 text-sm text-[#cbd5e1] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

  </main>

  <BottomBar />
</div>
)}