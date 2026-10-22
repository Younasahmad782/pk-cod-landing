"use client";

import { useEffect, useMemo, useState } from "react";
import { product, packs, pakistaniCities, formatRs } from "@/lib/product";
import { t, type Lang } from "@/lib/i18n";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Sample recent-order activity for the demo popup (fictional).
const sampleOrders = [
  { name: "Areeba", city: "Lahore", pack: 2 },
  { name: "Danish", city: "Karachi", pack: 1 },
  { name: "Mahnoor", city: "Islamabad", pack: 3 },
  { name: "Ali", city: "Rawalpindi", pack: 2 },
  { name: "Zainab", city: "Faisalabad", pack: 1 },
  { name: "Hassan", city: "Multan", pack: 2 },
  { name: "Iqra", city: "Sialkot", pack: 3 },
  { name: "Usama", city: "Peshawar", pack: 1 },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-500 tracking-tight" aria-label={`${n} stars`}>
      {"★".repeat(n)}
      <span className="text-gray-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function Landing() {
  const [lang, setLang] = useState<Lang>("en");
  const d = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [packId, setPackId] = useState("p2");
  const selectedPack = useMemo(() => packs.find((p) => p.id === packId) ?? packs[0], [packId]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [popupIdx, setPopupIdx] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let step = 0;
    const cycle = () => {
      showTimer = setTimeout(() => {
        setPopupIdx(step % sampleOrders.length);
        setPopupVisible(true);
        step += 1;
        hideTimer = setTimeout(() => {
          setPopupVisible(false);
          cycle();
        }, 5000);
      }, 7000);
    };
    cycle();
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanMobile = mobile.replace(/[\s-]/g, "");
    if (name.trim().length < 3) return setError(d.errName);
    if (!/^03\d{9}$/.test(cleanMobile)) return setError(d.errMobile);
    if (!city) return setError(d.errCity);

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile: cleanMobile, city, packId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error("failed");
      setOrderId(data.orderId);
      // Meta Pixel Purchase event (fires only when a Pixel ID is configured)
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Purchase", {
          value: selectedPack.price,
          currency: "PKR",
          content_ids: [selectedPack.id],
        });
      }
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setError(d.errGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  const popup = sampleOrders[popupIdx];

  return (
    <div dir={dir} className="min-h-screen">
      {/* ── Top bar ─────────────────────────────── */}
      <div className="bg-brand-700 text-white text-center text-[13px] font-semibold py-2 px-3">
        {d.freeDeliveryBar}
      </div>

      {/* ── Header ──────────────────────────────── */}
      <header className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="font-extrabold tracking-wide text-brand-700">{product.brand}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="text-sm font-semibold border border-brand-600 text-brand-700 rounded-full px-3 py-1 hover:bg-brand-50"
          >
            {d.langLabel}
          </button>
          <a
            href="#order-form"
            className="bg-brand-600 text-white text-sm font-bold rounded-full px-4 py-1.5 hover:bg-brand-700"
          >
            {d.orderNow}
          </a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-2 pb-8 grid md:grid-cols-2 gap-6 items-center">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.heroImage}
            alt={product.name}
            className="w-full rounded-2xl shadow-md object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{product.name}</h1>
          <p className="text-brand-600 font-semibold mt-1">{product.tagline}</p>
          <p className="text-gray-600 mt-3 leading-relaxed">{d.heroSub}</p>

          <div className="flex flex-wrap gap-2 mt-4 text-[13px] font-semibold">
            <span className="bg-white border rounded-full px-3 py-1">💵 {d.codBadge}</span>
            <span className="bg-white border rounded-full px-3 py-1">✔ {d.genuineBadge}</span>
            <span className="bg-white border rounded-full px-3 py-1">🚚 {d.deliveryBadge}</span>
          </div>

          <div className="mt-5 space-y-2">
            {packs.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl border px-4 py-2.5">
                <span className="font-semibold">
                  {p.qty} × {d.bottles}
                  {p.badge && (
                    <span className="ms-2 text-[11px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5">
                      {p.badge === "popular" ? d.mostPopular : d.bestValue}
                    </span>
                  )}
                </span>
                <span>
                  <span className="font-extrabold text-brand-700">{formatRs(p.price)}</span>{" "}
                  <span className="line-through text-gray-400 text-sm">{formatRs(p.wasPrice)}</span>
                </span>
              </div>
            ))}
          </div>

          <a
            href="#order-form"
            className="animate-soft-pulse block text-center mt-5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-lg rounded-xl py-3.5 shadow"
          >
            {d.orderNow} — {d.codBadge}
          </a>
        </div>
      </section>

      {/* ── Benefits ────────────────────────────── */}
      <section className="bg-white border-y">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-extrabold text-center">{d.benefitsTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {d.benefits.map((b) => (
              <div key={b.title} className="border rounded-2xl p-4 bg-sand">
                <h3 className="font-bold text-brand-700">{b.title}</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.ingredientsImage} alt={d.ingredientsTitle} className="w-full rounded-2xl shadow-sm object-cover" />
            <div>
              <h3 className="text-xl font-extrabold">{d.ingredientsTitle}</h3>
              <p className="text-gray-600 mt-2 leading-relaxed">{d.ingredientsText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How to use ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-2xl font-extrabold">{d.howToTitle}</h2>
          <ol className="mt-5 space-y-4">
            {d.steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white font-extrabold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.howToImage} alt={d.howToTitle} className="w-full rounded-2xl shadow-md object-cover" />
      </section>

      {/* ── Product info ────────────────────────── */}
      <section className="bg-white border-y">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-extrabold text-center">{d.infoTitle}</h2>
          <div className="mt-6 border rounded-2xl overflow-hidden">
            {d.info.map(([k, v], i) => (
              <div key={k} className={`grid grid-cols-2 ${i % 2 ? "bg-sand" : "bg-white"}`}>
                <div className="px-4 py-3 font-semibold text-sm border-e">{k}</div>
                <div className="px-4 py-3 text-sm text-gray-700">{v}</div>
              </div>
            ))}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.bundlesImage} alt={product.name} className="w-full rounded-2xl shadow-sm object-cover mt-6" />
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-extrabold text-center">{d.reviewsTitle}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {d.reviews.map((r) => (
            <article key={r.name} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{r.name}</span>
                <Stars n={r.stars} />
              </div>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{r.text}</p>
            </article>
          ))}
          <article className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
            <h3 className="font-bold text-brand-700">{d.certsTitle}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
              {d.certs.map((c) => (
                <li key={c}>🛡 {c}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ── Returns ─────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <h2 className="text-xl font-extrabold">{d.returnsTitle}</h2>
        <ol className="list-decimal ms-5 mt-3 space-y-1.5 text-sm text-gray-700 leading-relaxed">
          {d.returns.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>

      {/* ── Order form ──────────────────────────── */}
      <section id="order-form" className="max-w-2xl mx-auto px-4 pb-24">
        <div className="bg-white border-2 border-brand-600 rounded-3xl shadow-lg p-5 md:p-7">
          {orderId ? (
            <div className="text-center py-6">
              <div className="text-5xl">✅</div>
              <h2 className="text-2xl font-extrabold mt-3">{d.successTitle}</h2>
              <p className="text-gray-600 mt-2 leading-relaxed">{d.successText}</p>
              <p className="mt-4 inline-block bg-brand-50 border border-brand-100 rounded-xl px-4 py-2 font-bold">
                {d.orderNumber}: <span className="text-brand-700">{orderId}</span>
              </p>
              <p className="mt-2 font-semibold">
                {d.totalToPay}: {formatRs(selectedPack.price)}
              </p>
              <button
                onClick={() => setOrderId(null)}
                className="mt-5 text-brand-700 font-bold underline"
              >
                {d.orderAgain}
              </button>
            </div>
          ) : (
            <form onSubmit={submitOrder} noValidate>
              <h2 className="text-xl md:text-2xl font-extrabold text-center">{d.formTitle}</h2>
              <p className="text-center text-gray-500 text-sm mt-1">{d.formSub}</p>

              <p className="font-bold mt-6 mb-2">{d.choosePack}</p>
              <div className="space-y-2">
                {packs.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 cursor-pointer ${
                      packId === p.id ? "border-brand-600 bg-brand-50" : "border-gray-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <input
                        type="radio"
                        name="pack"
                        checked={packId === p.id}
                        onChange={() => setPackId(p.id)}
                        className="accent-green-700 w-4 h-4"
                      />
                      {p.qty} × {d.bottles}
                      {p.badge && (
                        <span className="text-[11px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5">
                          {p.badge === "popular" ? d.mostPopular : d.bestValue}
                        </span>
                      )}
                    </span>
                    <span className="text-end">
                      <span className="font-extrabold text-brand-700">{formatRs(p.price)}</span>
                      <span className="block text-[12px] text-green-700 font-semibold">
                        {d.youSave} {formatRs(p.wasPrice - p.price)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <label className="font-bold text-sm">{d.fullName} *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={d.fullNamePh}
                    className="mt-1 w-full border rounded-xl px-3.5 py-3 outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm">{d.mobile} *</label>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder={d.mobilePh}
                    inputMode="tel"
                    className="mt-1 w-full border rounded-xl px-3.5 py-3 outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-sm">{d.city} *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full border rounded-xl px-3.5 py-3 outline-none focus:border-brand-600 bg-white"
                  >
                    <option value="">{d.selectCity}</option>
                    {pakistaniCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-red-600 font-semibold text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between mt-5 font-bold">
                <span>{d.totalToPay}</span>
                <span className="text-brand-700 text-lg">{formatRs(selectedPack.price)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="animate-soft-pulse w-full mt-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-extrabold text-lg rounded-xl py-4 shadow"
              >
                {submitting ? d.placing : d.confirmOrder}
              </button>
              <p className="text-center text-[13px] text-gray-500 mt-2">
                🚚 {d.deliveryBadge} · 💵 {d.codBadge}
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t bg-white">
        <p className="max-w-3xl mx-auto px-4 py-5 text-center text-[12px] text-gray-400 leading-relaxed">
          {d.footerNote}
        </p>
      </footer>

      {/* ── Sticky mobile CTA ───────────────────── */}
      <a
        href="#order-form"
        className="md:hidden fixed bottom-0 inset-x-0 bg-brand-600 text-white text-center font-extrabold py-3.5 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
      >
        {d.orderNow} — {formatRs(selectedPack.price)}
      </a>

      {/* ── Recent-order popup ──────────────────── */}
      {popupVisible && !orderId && (
        <div className="animate-slide-up fixed bottom-16 md:bottom-5 start-3 z-40 bg-white border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.heroImage} alt="" className="w-11 h-11 rounded-lg object-cover" />
          <p className="text-[13px] leading-snug">
            <strong>
              {popup.name} · {popup.city}
            </strong>{" "}
            {d.justOrdered} {popup.pack} × {product.name}
          </p>
        </div>
      )}
    </div>
  );
}
