"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import ShipmentCard from "@/components/ShipmentCard";
import NotificationsCard from "@/components/NotificationsCard";
import DeliveryOptions from "@/components/DeliveryOptions";
import BottomBar from "@/components/BottomBar";
import {
  emptyDashboardShipmentData,
  mapShipmentDetailsToDashboardData,
  type DashboardShipmentData,
  type ShipmentCustomerDetailsResponse,
} from "@/lib/access-link";
import { getStoredLinkToken, getStoredShipmentId, isOtpVerified } from "@/lib/customer-session";

const ORCHESTRATION_API_BASE =
  process.env.NEXT_PUBLIC_ORCHESTRATION_API_URL || "http://localhost:3002";

const loadDashboardShipmentData = (): DashboardShipmentData => {
  if (typeof window === "undefined") return emptyDashboardShipmentData;

  const stored = window.sessionStorage.getItem("parcelpoint_shipment_data");
  if (!stored) return emptyDashboardShipmentData;

  try {
    const parsed = JSON.parse(stored);
    return {
      ...emptyDashboardShipmentData,
      ...parsed,
      packages: Array.isArray(parsed.packages) ? parsed.packages : [],
    };
  } catch {
    return emptyDashboardShipmentData;
  }
};

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
      "Most islandwide deliveries are completed within 1-3 business days depending on the distance and delivery option selected.",
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

export default function Dashboard() {
  const initialShipmentData = loadDashboardShipmentData();
  const [activeTab, setActiveTab] = useState("My Shipment");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [shipmentData, setShipmentData] = useState<DashboardShipmentData>(initialShipmentData);
  const [managementDeadline, setManagementDeadline] = useState(initialShipmentData.managementDeadline);

  const refreshShipmentDetails = async () => {
    const shipmentId = getStoredShipmentId();
    const token = getStoredLinkToken();
    const verified = isOtpVerified();

    if (!shipmentId || !token || !verified) return;

    try {
      const response = await fetch(
        `${ORCHESTRATION_API_BASE}/api/consignments/${shipmentId}/customer-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = (await response.json()) as ShipmentCustomerDetailsResponse;
      if (!response.ok || !payload.success || !payload.data) {
        return;
      }

      const mapped = mapShipmentDetailsToDashboardData(payload.data);
      window.sessionStorage.setItem("parcelpoint_shipment_data", JSON.stringify(mapped));
      setShipmentData(mapped);
      setManagementDeadline(mapped.managementDeadline);
    } catch {
      // Keep cached data if live refresh fails
    }
  };

  useEffect(() => {
    void refreshShipmentDetails();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#1a2332" }}>
      <TopBar onLogout={() => alert("Logged out")} />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {activeTab === "My Shipment" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ShipmentCard {...shipmentData} />
              <NotificationsCard
                key={`${shipmentData.receiverEmail}-${shipmentData.receiverMobile}-${shipmentData.preferredNotificationChannel}`}
                mobileNumber={shipmentData.receiverMobile}
                emailAddress={shipmentData.receiverEmail}
                preferredChannel={shipmentData.preferredNotificationChannel}
              />
            </div>

            <DeliveryOptions
              managementDeadline={managementDeadline}
              estimatedDelivery={shipmentData.estimatedDelivery}
              deliveryAddress={shipmentData.deliveryAddress}
              onUpdated={refreshShipmentDetails}
            />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-2xl bg-[#243044] p-5 sm:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                  Shipment Details
                </h3>
                <div className="mt-4 space-y-3 text-sm text-[#e2e8f0]">
                  <p><span className="text-[#94a3b8]">Shipment type:</span> {shipmentData.shipmentType}</p>
                  <p><span className="text-[#94a3b8]">Service type:</span> {shipmentData.serviceType}</p>
                  <p><span className="text-[#94a3b8]">Service indicator:</span> {shipmentData.serviceIndicator}</p>
                  <p><span className="text-[#94a3b8]">Account number:</span> {shipmentData.accountNumber}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#243044] p-5 sm:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                  Receiver
                </h3>
                <div className="mt-4 space-y-3 text-sm text-[#e2e8f0]">
                  <p><span className="text-[#94a3b8]">Name:</span> {shipmentData.receiver}</p>
                  <p><span className="text-[#94a3b8]">Mobile:</span> {shipmentData.receiverMobile}</p>
                  <p><span className="text-[#94a3b8]">Email:</span> {shipmentData.receiverEmail}</p>
                  <p><span className="text-[#94a3b8]">Address:</span> {shipmentData.deliveryAddress}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#243044] p-5 sm:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                  Sender
                </h3>
                <div className="mt-4 space-y-3 text-sm text-[#e2e8f0]">
                  <p><span className="text-[#94a3b8]">Name:</span> {shipmentData.senderName}</p>
                  <p><span className="text-[#94a3b8]">Mobile:</span> {shipmentData.senderMobile}</p>
                  <p><span className="text-[#94a3b8]">Email:</span> {shipmentData.senderEmail}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-[#243044] p-5 sm:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Packages
              </h3>
              <div className="mt-4 grid gap-3">
                {shipmentData.packages.length > 0 ? (
                  shipmentData.packages.map((pkg) => (
                    <div
                      key={pkg.packageId}
                      className="rounded-xl border border-[#2c3a52] bg-[#1a2332] p-4 text-sm text-[#e2e8f0]"
                    >
                      <p className="font-semibold text-[#f8fafc]">
                        {pkg.packageId} {pkg.isPrimary ? "(Primary)" : ""}
                      </p>
                      <p className="mt-1 text-[#94a3b8]">{pkg.description}</p>
                      <p className="mt-2"><span className="text-[#94a3b8]">Weight:</span> {pkg.weight}</p>
                      <p><span className="text-[#94a3b8]">Dimensions:</span> {pkg.dimensions}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#94a3b8]">No package details available.</p>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "Contact Hub" && (
          <div className="py-12 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center text-[#f1f5f9]">Contact Hub</h2>
            <p className="mt-2 text-center text-sm text-[#94a3b8]">
              We&apos;re here to help - reach out anytime.
            </p>

            <form className="mt-8 w-full max-w-xl space-y-4 bg-[#243044] p-6 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-[#f1f5f9]">Your Name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded bg-[#1a2332] border border-[#2c3a52] px-3 py-2 text-sm text-[#f1f5f9]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f1f5f9]">Email Address</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded bg-[#1a2332] border border-[#2c3a52] px-3 py-2 text-sm text-[#f1f5f9]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f1f5f9]">Message</label>
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

        {activeTab === "About Hub" && (
          <div className="flex flex-col gap-20 py-16">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9]">About Parcel Hub</h1>
              <p className="mt-4 text-[#94a3b8] text-sm sm:text-base">
                Parcel Hub is a modern parcel delivery platform designed to make shipping simple,
                secure, and reliable across Sri Lanka.
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

            <div>
              <h2 className="text-center text-2xl font-bold text-[#f1f5f9]">Our Services</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                <div className="bg-[#243044] p-6 rounded-xl text-center">
                  Parcel Delivery
                  <p className="text-sm text-[#94a3b8] mt-2">
                    Reliable islandwide parcel transportation with safe handling.
                  </p>
                </div>

                <div className="bg-[#243044] p-6 rounded-xl text-center">
                  Express Shipping
                  <p className="text-sm text-[#94a3b8] mt-2">
                    Fast delivery services for urgent shipments.
                  </p>
                </div>

                <div className="bg-[#243044] p-6 rounded-xl text-center">
                  Real-Time Tracking
                  <p className="text-sm text-[#94a3b8] mt-2">
                    Monitor your parcel location anytime.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-center text-2xl font-bold text-[#f1f5f9]">Our Core Values</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-[#243044] p-6 rounded-xl text-center">
                  Security
                  <p className="text-sm text-[#94a3b8] mt-2">
                    Every parcel is protected with secure logistics operations.
                  </p>
                </div>

                <div className="bg-[#243044] p-6 rounded-xl text-center">
                  Efficiency
                  <p className="text-sm text-[#94a3b8] mt-2">
                    Optimized delivery routes for faster shipping.
                  </p>
                </div>

                <div className="bg-[#243044] p-6 rounded-xl text-center">
                  Trust
                  <p className="text-sm text-[#94a3b8] mt-2">
                    Building long-term relationships with customers and partners.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#243044] p-10 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-bold text-[#f1f5f9] text-center">Our Team</h2>

              <p className="mt-6 text-center text-sm text-[#cbd5e1] max-w-3xl mx-auto leading-relaxed">
                Our team consists of logistics specialists, technology experts, and customer
                support professionals dedicated to providing the best parcel delivery experience.
                We continuously innovate our platform to improve delivery speed, transparency, and
                customer satisfaction.
              </p>
            </div>
          </div>
        )}

        {activeTab === "FAQs" && (
          <div className="py-16 max-w-3xl mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#f1f5f9]">Frequently Asked Questions</h2>
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
                    <span className="text-[#f97316] text-xl">{openFAQ === index ? "-" : "+"}</span>
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
  );
}
