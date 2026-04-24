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
import {
  getStoredLinkToken,
  getStoredShipmentId,
  isOtpVerified,
  redirectToOtpPage,
} from "@/lib/customer-session";

const ORCHESTRATION_API_BASE =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_ORCHESTRATION_API_URL ||
  "http://localhost:8000";

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

      const payload = (await response.json()) as ShipmentCustomerDetailsResponse & { code?: string };
      if (payload.code === "OTP_EXPIRED" || payload.code === "OTP_REQUIRED") {
        redirectToOtpPage();
        return;
      }
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
    <div className="min-h-screen flex flex-col">
      <TopBar onLogout={() => alert("Logged out")} />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {activeTab === "My Shipment" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ShipmentCard
                {...shipmentData}
                shipmentType={shipmentData.shipmentType}
                serviceType={shipmentData.serviceType}
                senderName={shipmentData.senderName}
                managementDeadline={shipmentData.managementDeadline}
                packages={shipmentData.packages}
              />
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
              <div className="rounded-2xl border border-[#d8e1ec] bg-white p-5 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8798]">
                  Shipment Details
                </h3>
                <div className="mt-4 space-y-3 text-sm text-[#203142]">
                  <p><span className="text-[#6b7b8d]">Shipment type:</span> {shipmentData.shipmentType}</p>
                  <p><span className="text-[#6b7b8d]">Service type:</span> {shipmentData.serviceType}</p>
                  <p><span className="text-[#6b7b8d]">Service indicator:</span> {shipmentData.serviceIndicator}</p>
                  <p><span className="text-[#6b7b8d]">Account number:</span> {shipmentData.accountNumber}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8e1ec] bg-white p-5 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8798]">
                  Receiver
                </h3>
                <div className="mt-4 space-y-3 text-sm text-[#203142]">
                  <p><span className="text-[#6b7b8d]">Name:</span> {shipmentData.receiver}</p>
                  <p><span className="text-[#6b7b8d]">Mobile:</span> {shipmentData.receiverMobile}</p>
                  <p><span className="text-[#6b7b8d]">Email:</span> {shipmentData.receiverEmail}</p>
                  <p><span className="text-[#6b7b8d]">Address:</span> {shipmentData.deliveryAddress}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8e1ec] bg-white p-5 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8798]">
                  Sender
                </h3>
                <div className="mt-4 space-y-3 text-sm text-[#203142]">
                  <p><span className="text-[#6b7b8d]">Name:</span> {shipmentData.senderName}</p>
                  <p><span className="text-[#6b7b8d]">Mobile:</span> {shipmentData.senderMobile}</p>
                  <p><span className="text-[#6b7b8d]">Email:</span> {shipmentData.senderEmail}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#d8e1ec] bg-white p-5 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8798]">
                Packages
              </h3>
              <div className="mt-4 grid gap-3">
                {shipmentData.packages.length > 0 ? (
                  shipmentData.packages.map((pkg) => (
                    <div
                      key={pkg.packageId}
                      className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4 text-sm text-[#203142]"
                    >
                      <p className="font-semibold text-[#132235]">
                        {pkg.packageId} {pkg.isPrimary ? "(Primary)" : ""}
                      </p>
                      <p className="mt-1 text-[#6b7b8d]">{pkg.description}</p>
                      <p className="mt-2"><span className="text-[#6b7b8d]">Weight:</span> {pkg.weight}</p>
                      <p><span className="text-[#6b7b8d]">Dimensions:</span> {pkg.dimensions}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#6b7b8d]">No package details available.</p>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "Contact Hub" && (
          <div className="flex flex-col gap-6 py-8">
            <section className="hero-panel relative overflow-hidden rounded-[32px] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-white/8 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#c55a11]/20 blur-3xl" />
              <div className="relative max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Contact Hub</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Reach the ParcelPoint support team</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                  Get help with delivery changes, shipment visibility, and service questions through a cleaner support experience.
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="surface-card rounded-[28px] p-6 sm:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8798]">
                  Support Channels
                </h3>
                <div className="mt-5 grid gap-4">
                  <div className="soft-panel rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#7a8798]">Customer Care</p>
                    <p className="mt-2 text-lg font-semibold text-[#132235]">+94 11 234 5678</p>
                    <p className="mt-1 text-sm text-[#526277]">Weekdays 8:30 AM to 6:00 PM</p>
                  </div>
                  <div className="soft-panel rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#7a8798]">Email Support</p>
                    <p className="mt-2 text-lg font-semibold text-[#132235]">support@parcelpoint.com</p>
                    <p className="mt-1 text-sm text-[#526277]">For tracking, billing, and delivery option support</p>
                  </div>
                  <div className="soft-panel rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#7a8798]">Response Target</p>
                    <p className="mt-2 text-lg font-semibold text-[#132235]">Within 1 business day</p>
                    <p className="mt-1 text-sm text-[#526277]">Priority issues are reviewed faster</p>
                  </div>
                </div>
              </div>

              <form className="surface-card rounded-[28px] p-6 sm:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8798]">
                  Send a Message
                </h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#203142]">Your Name</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-[#d8e1ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#132235] outline-none transition focus:border-[#c55a11]"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#203142]">Email Address</label>
                    <input
                      type="email"
                      className="mt-2 w-full rounded-2xl border border-[#d8e1ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#132235] outline-none transition focus:border-[#c55a11]"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#203142]">Message</label>
                    <textarea
                      className="mt-2 w-full rounded-2xl border border-[#d8e1ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#132235] outline-none transition focus:border-[#c55a11]"
                      rows={5}
                      placeholder="Tell us what you need help with"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-[#132235] py-3 text-sm font-semibold text-white transition hover:bg-[#0d1a2b]"
                >
                  Send Message
                </button>
              </form>
            </section>
          </div>
        )}

        {activeTab === "About Hub" && (
          <div className="flex flex-col gap-8 py-8">
            <section className="hero-panel relative overflow-hidden rounded-[32px] px-6 py-8 text-white sm:px-10 sm:py-12">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="relative max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">About ParcelPoint</p>
                <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Clean logistics, visible progress, reliable delivery.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                  ParcelPoint is built to give customers confidence during the last-mile journey with secure access, clear delivery options, and modern tracking.
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div
                className="surface-card relative min-h-[280px] overflow-hidden rounded-[28px]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(16,35,60,0.72) 0%, rgba(34,70,109,0.58) 100%), url('/background.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="flex h-full items-end p-8">
                  <div className="max-w-2xl text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">Our Promise</p>
                    <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Delivering confidence across Sri Lanka</h2>
                    <p className="mt-3 text-sm leading-7 text-white/78">
                      Every screen is designed to reduce uncertainty and give customers a smoother, more trustworthy delivery experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[28px] p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8798]">What We Focus On</p>
                <div className="mt-5 space-y-4">
                  <div className="soft-panel rounded-2xl p-4">
                    <p className="font-semibold text-[#132235]">Secure customer access</p>
                    <p className="mt-2 text-sm leading-6 text-[#526277]">Token access and OTP verification keep shipment actions protected.</p>
                  </div>
                  <div className="soft-panel rounded-2xl p-4">
                    <p className="font-semibold text-[#132235]">Flexible delivery control</p>
                    <p className="mt-2 text-sm leading-6 text-[#526277]">Customers can adapt delivery with clearer options and nearby collection visibility.</p>
                  </div>
                  <div className="soft-panel rounded-2xl p-4">
                    <p className="font-semibold text-[#132235]">Transparent progress</p>
                    <p className="mt-2 text-sm leading-6 text-[#526277]">Tracking and package summaries help users understand what is happening next.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <div className="surface-card rounded-[28px] p-6 text-center">
                <h2 className="text-xl font-bold text-[#132235]">Parcel Delivery</h2>
                <p className="mt-3 text-sm leading-6 text-[#526277]">
                  Reliable islandwide parcel transportation with controlled handoff points.
                </p>
              </div>
              <div className="surface-card rounded-[28px] p-6 text-center">
                <h2 className="text-xl font-bold text-[#132235]">Express Shipping</h2>
                <p className="mt-3 text-sm leading-6 text-[#526277]">
                  Faster service options for urgent shipments and time-sensitive deliveries.
                </p>
              </div>
              <div className="surface-card rounded-[28px] p-6 text-center">
                <h2 className="text-xl font-bold text-[#132235]">Real-Time Tracking</h2>
                <p className="mt-3 text-sm leading-6 text-[#526277]">
                  More visible shipment progress with delivery preference context built in.
                </p>
              </div>
            </section>

            <section className="surface-card rounded-[32px] p-8 sm:p-10">
              <h2 className="text-center text-2xl font-bold text-[#132235]">Our Team</h2>
              <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-7 text-[#526277]">
                Our team combines logistics operations, product design, and engineering to make shipment management feel simple, polished, and dependable for every customer.
              </p>
            </section>
          </div>
        )}

        {activeTab === "FAQs" && (
          <div className="py-8 max-w-4xl mx-auto w-full">
            <div className="hero-panel rounded-[32px] px-6 py-8 text-center text-white sm:px-10 sm:py-10">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="mt-3 text-sm text-white/78 sm:text-base">
                Find quick answers about shipment access, tracking, and delivery options.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="surface-card overflow-hidden rounded-[24px]"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between px-5 py-5 text-left font-medium text-[#132235]"
                  >
                    {faq.question}
                    <span className="text-[#c55a11] text-xl">{openFAQ === index ? "-" : "+"}</span>
                  </button>

                  {openFAQ === index && (
                    <div className="px-5 pb-5 text-sm leading-7 text-[#526277]">
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
