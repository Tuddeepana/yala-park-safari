import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Check,
  Clock,
  Users,
  Car,
  UtensilsCrossed,
  Calendar as CalendarIcon,
  CheckCircle2,
  Info,
  FileText,
  Shield,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatLkr,
  approxUsd,
  approxEur,
  JEEP_CAPACITY,
  PARK_TICKET_PRICE_LKR,
  SAFARI_PACKAGES,
  VEHICLE_DETAILS,
  type SafariId,
  type VehicleType,
  type PackageTier,
} from "@/data/safaris";
import { siteConfig, whatsappReady, whatsappUrl } from "@/data/site-config";
import { cn } from "@/lib/utils";

const todayInColombo = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: siteConfig.timezone }).format(new Date());

const fmtDate = (d: string) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

type Errors = Partial<Record<"date" | "guests", string>>;

export function BookingForm({
  selected,
  onSelect,
}: {
  selected: SafariId;
  onSelect: (id: SafariId) => void;
}) {
  const [packageKey, setPackageKey] = useState<string>("full-day");
  const [vehicleType, setVehicleType] = useState<VehicleType>("luxury");
  const [packageTier, setPackageTier] = useState<PackageTier>("all-inclusive");
  const [sharedPayment, setSharedPayment] = useState<"eur" | "lkr">("eur");
  const [halfDaySession, setHalfDaySession] = useState<"Morning" | "Afternoon">("Morning");

  const [minDate, setMinDate] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMinDate(todayInColombo());
  }, []);

  // Sync external selected state with packageKey
  useEffect(() => {
    if (selected === "full-day") setPackageKey("full-day");
    else if (selected === "half-day") setPackageKey("half-day-7h");
    else if (selected === "shared") setPackageKey("shared");
  }, [selected]);

  const currentPkg = SAFARI_PACKAGES[packageKey] || SAFARI_PACKAGES["full-day"];

  // Price calculations - exactly keeping original pricing
  const calculation = useMemo(() => {
    const isShared = currentPkg.type === "Shared";
    let baseLkr = 0;
    let baseEur = 0;
    let mealsTotalLkr = 0;
    const jeepCount = !isShared && guests > JEEP_CAPACITY ? 2 : 1;

    if (isShared) {
      if (sharedPayment === "eur") {
        baseEur = currentPkg.sharedPriceEur * guests;
      } else {
        baseLkr = currentPkg.sharedPriceLkr * guests;
      }
    } else {
      const perJeepPrice =
        vehicleType === "luxury" ? currentPkg.luxuryPrice : currentPkg.superLuxuryPrice;
      baseLkr = perJeepPrice * jeepCount;
      if (packageTier === "all-inclusive") {
        mealsTotalLkr = currentPkg.mealPricePerPerson * guests;
      }
    }

    const totalLkr = baseLkr + mealsTotalLkr;

    return {
      isShared,
      jeepCount,
      baseLkr,
      baseEur,
      mealsTotalLkr,
      totalLkr,
      vehicleName: isShared
        ? "Shared 4x4 Jeep"
        : `${jeepCount > 1 ? "2x " : ""}${VEHICLE_DETAILS[vehicleType].name}`,
      planName: isShared
        ? sharedPayment === "eur"
          ? "€45 All-Inclusive (Ticket Included)"
          : "Rs. 8,000 Advance Seat"
        : packageTier === "all-inclusive"
          ? "All-Inclusive (Meals Included)"
          : "Jeep Only",
    };
  }, [currentPkg, vehicleType, packageTier, sharedPayment, guests]);

  // Construct structured booking enquiry
  const message = useMemo(() => {
    const lines = [
      "🌿 *YALA PARK SAFARI BOOKING REQUEST* 🌿",
      "Hello Yala Park Safari, I would like to reserve a safari.",
      "",
      `📦 *Package:* ${currentPkg.name}`,
      `⏱️ *Duration:* ${currentPkg.durationLabel} (${packageKey === "half-day-5h" ? halfDaySession : currentPkg.timingLabel})`,
      `🚙 *Vehicle:* ${calculation.vehicleName}`,
      `🍽️ *Plan:* ${calculation.planName}`,
      `📅 *Date:* ${fmtDate(date)}`,
      `👥 *Guests:* ${guests} ${guests === 1 ? "guest" : "guests"}`,
      "",
      "💰 *PRICE BREAKDOWN:*",
    ];

    if (calculation.isShared) {
      if (sharedPayment === "eur") {
        lines.push(
          `• All-Inclusive Rate: €${currentPkg.sharedPriceEur} × ${guests} = €${calculation.baseEur} EUR`,
        );
        lines.push(`• Official National Park Entrance Tickets: INCLUDED`);
      } else {
        lines.push(
          `• Shared Seat Advance: ${formatLkr(currentPkg.sharedPriceLkr)} × ${guests} = ${formatLkr(calculation.baseLkr)}`,
        );
        lines.push(
          `• Park Entry Tickets: ${formatLkr(PARK_TICKET_PRICE_LKR)} × ${guests} (paid at park entrance)`,
        );
      }
    } else {
      lines.push(
        `• Safari Jeep (${calculation.vehicleName}): ${formatLkr(calculation.baseLkr)} ${
          calculation.jeepCount > 1 ? "(2 jeeps for 7-8 guests)" : "(covers whole group)"
        }`,
      );
      if (packageTier === "all-inclusive") {
        lines.push(
          `• Meals & Drinks: ${formatLkr(currentPkg.mealPricePerPerson)} × ${guests} = ${formatLkr(calculation.mealsTotalLkr)}`,
        );
        lines.push(`  (${currentPkg.mealPackDetails})`);
      }
      lines.push(
        `⭐ *Total Package:* ${formatLkr(calculation.totalLkr)} (~$${approxUsd(calculation.totalLkr)} USD / ~€${approxEur(calculation.totalLkr)} EUR)`,
      );
      lines.push(
        `ℹ️ *Park Tickets:* ~Rs. 15,000 LKR ($45) per foreign adult paid at park entrance gate with driver assistance.`,
      );
    }

    lines.push("");
    lines.push("Please confirm availability and pickup details. Thank you!");

    return lines.join("\n");
  }, [
    currentPkg,
    packageKey,
    halfDaySession,
    calculation,
    date,
    guests,
    sharedPayment,
    packageTier,
  ]);

  function validate(): Errors {
    const e: Errors = {};
    const min = minDate || todayInColombo();
    if (!date) e.date = "Please choose a safari date.";
    else if (date < min) e.date = "Please choose today or a future date.";
    if (!(guests >= 1 && guests <= 8)) e.guests = "Please select valid guest count.";
    return e;
  }

  function handleBooking(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`bf-${first}`)?.focus();
      return;
    }

    if (whatsappReady()) {
      window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    } else {
      setCopied(false);
      setPreview(message);
    }
  }

  function handleOpenPreview() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`bf-${first}`)?.focus();
      return;
    }
    setCopied(false);
    setPreview(message);
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`bf-${k}-err`} className="mt-1 text-xs font-semibold text-destructive">
        {errors[k]}
      </p>
    ) : null;

  // text-base on mobile prevents iOS Safari auto-zoom bug (<16px triggers zoom)
  const inputClass =
    "w-full rounded-lg border border-input bg-card px-3.5 h-11 text-base sm:text-sm text-foreground transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <div
      id="book"
      tabIndex={-1}
      className="w-full rounded-2xl border border-border/80 bg-card p-4 sm:p-6 text-card-foreground shadow-[var(--shadow-card)]"
    >
      {/* Header with Trust Badges */}
      <div className="mb-4 border-b border-border/60 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl font-display">
            Book Your Safari
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pay on arrival
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3 w-3 text-accent" /> Free cancellation
          </span>
          <span>·</span>
          <span>No credit card needed</span>
          <span>·</span>
          <span>Direct local pricing</span>
        </p>
      </div>

      <form onSubmit={handleBooking} noValidate className="space-y-4">
        {/* Safari Package Selection (Responsive 2-column grid) */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Select Safari Package
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {Object.values(SAFARI_PACKAGES).map((pkg) => {
              const active = packageKey === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    setPackageKey(pkg.id);
                    onSelect(pkg.category);
                  }}
                  className={cn(
                    "relative flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 text-left transition-all cursor-pointer min-h-[92px]",
                    active
                      ? "border-accent bg-gold-soft/50 text-primary ring-2 ring-accent shadow-sm"
                      : "border-border bg-card text-foreground hover:border-accent/60 hover:bg-muted/40",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs sm:text-sm font-bold leading-tight">
                        {pkg.short}
                      </span>
                      {active ? (
                        <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      ) : pkg.badge ? (
                        <span className="shrink-0 rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent-foreground">
                          {pkg.badge}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground leading-snug">
                      {pkg.durationLabel}
                    </span>
                  </div>

                  <div className="mt-2 border-t border-border/40 pt-1.5">
                    <div className="flex items-baseline justify-between gap-1 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {pkg.id === "shared"
                          ? "From €45"
                          : `From Rs. ${pkg.luxuryPrice.toLocaleString()}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {pkg.type === "Private" ? "per jeep" : "per seat"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inline Session Toggle for 5-Hour standard half-day */}
          {packageKey === "half-day-5h" && (
            <div className="mt-2.5 rounded-lg bg-muted/40 p-1.5 border border-border/60">
              <div className="grid grid-cols-2 gap-1.5">
                {(["Morning", "Afternoon"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHalfDaySession(s)}
                    className={cn(
                      "flex items-center justify-center gap-1 rounded-md py-1.5 px-2 text-xs font-semibold transition-all cursor-pointer",
                      halfDaySession === s
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{s === "Morning" ? "Morning 5am–10am" : "Afternoon 2pm–6:30pm"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date & Guests Selection (Responsive stack on tiny mobile, 2 cols on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="bf-date"
              className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-accent" />
              Safari Date <span className="text-destructive">*</span>
            </label>
            <input
              id="bf-date"
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "bf-date-err" : undefined}
              className={inputClass}
            />
            {err("date")}
          </div>

          <div>
            <label
              htmlFor="bf-guests"
              className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              <Users className="h-3.5 w-3.5 text-accent" />
              Guests
            </label>
            <select
              id="bf-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Guest" : "Guests"}{" "}
                  {currentPkg.type === "Private" && n <= 6 && n === JEEP_CAPACITY
                    ? "(Full Jeep)"
                    : currentPkg.type === "Private" && n > 6
                      ? "(2 Jeeps included)"
                      : ""}
                </option>
              ))}
            </select>
            {err("guests")}
          </div>
        </div>

        {/* Advisory for 7-8 guests on private safari */}
        {currentPkg.type === "Private" && guests > JEEP_CAPACITY && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 border border-amber-500/20">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              For 7–8 guests, 2 dedicated safari jeeps are provided so everyone has comfortable
              window seats.
            </span>
          </div>
        )}

        {/* Vehicle & Extras Section */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3 sm:p-3.5 space-y-3">
          {currentPkg.type === "Private" ? (
            <>
              {/* Jeep Tier Selection */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Safari Jeep Tier
                  </span>
                  <span className="text-[11px] text-muted-foreground">Up to 6 guests/jeep</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["luxury", "super-luxury"] as const).map((vt) => {
                    const active = vehicleType === vt;
                    const diff =
                      vt === "super-luxury"
                        ? currentPkg.superLuxuryPrice - currentPkg.luxuryPrice
                        : 0;
                    return (
                      <button
                        key={vt}
                        type="button"
                        onClick={() => setVehicleType(vt)}
                        className={cn(
                          "rounded-lg border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between",
                          active
                            ? "border-accent bg-gold-soft/50 text-primary ring-2 ring-accent"
                            : "border-border bg-card text-foreground hover:border-accent/60",
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold flex items-center gap-1 truncate">
                            <Car className="h-3.5 w-3.5 text-accent shrink-0" />
                            {vt === "luxury" ? "Luxury Jeep" : "Super Luxury"}
                          </span>
                          {active && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                        </div>
                        <div className="mt-1 flex items-baseline justify-between gap-1">
                          <span className="text-[10px] text-muted-foreground truncate">
                            {vt === "luxury" ? "Open 4x4 Cruiser" : "Cushioned ride"}
                          </span>
                          <span className="text-[11px] font-bold text-primary shrink-0">
                            {diff > 0 ? `+${formatLkr(diff)}` : "Included"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meals Add-on Checkbox */}
              <div>
                <label
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border p-2.5 sm:p-3 text-xs transition-all cursor-pointer",
                    packageTier === "all-inclusive"
                      ? "border-accent bg-gold-soft/50 ring-1 ring-accent/60 shadow-sm"
                      : "border-border/80 bg-card hover:border-accent/60",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={packageTier === "all-inclusive"}
                    onChange={(e) =>
                      setPackageTier(e.target.checked ? "all-inclusive" : "jeep-only")
                    }
                    className="mt-0.5 h-4 w-4 rounded border-input accent-accent shrink-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <UtensilsCrossed className="h-3.5 w-3.5 text-accent" />
                        Add Meals & Drinks Pack
                      </span>
                      <span className="font-bold text-primary">
                        +{formatLkr(currentPkg.mealPricePerPerson)} / person
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                      {currentPkg.id === "full-day"
                        ? "Packed breakfast, authentic Sri Lankan rice & curry lunch, fresh fruit & 1L chilled water"
                        : "Packed safari breakfast (sandwiches, eggs, fruit) & chilled bottled water"}
                    </p>
                  </div>
                </label>
              </div>
            </>
          ) : (
            /* Shared Safari Choice */
            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Shared Option
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSharedPayment("eur")}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between",
                    sharedPayment === "eur"
                      ? "border-accent bg-gold-soft/50 text-primary ring-2 ring-accent"
                      : "border-border bg-card text-foreground hover:border-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">€45 All-Inclusive</span>
                    <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent-foreground">
                      Ticket Included
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
                    Jeep Seat + National Park Entrance Ticket
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSharedPayment("lkr")}
                  className={cn(
                    "rounded-lg border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between",
                    sharedPayment === "lkr"
                      ? "border-accent bg-gold-soft/50 text-primary ring-2 ring-accent"
                      : "border-border bg-card text-foreground hover:border-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Rs. 8,000 Advance</span>
                    <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-bold text-muted-foreground">
                      Seat Only
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-snug">
                    Park ticket (~15,000 LKR) paid at park gate
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Transparent Price Box */}
        <div
          className="rounded-xl border border-accent/40 bg-gold-soft/40 p-3.5 sm:p-4"
          aria-live="polite"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                {currentPkg.name}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {calculation.vehicleName} · {calculation.planName} · {guests}{" "}
                {guests === 1 ? "guest" : "guests"}
              </span>
            </div>

            <div className="text-left sm:text-right">
              {calculation.isShared && sharedPayment === "eur" ? (
                <div>
                  <span className="font-display text-2xl font-bold text-primary block leading-tight">
                    €{calculation.baseEur} EUR
                  </span>
                  <span className="text-[10px] text-muted-foreground">Park Tickets Included</span>
                </div>
              ) : (
                <div>
                  <span className="font-display text-xl sm:text-2xl font-bold text-primary block leading-tight">
                    {formatLkr(calculation.totalLkr)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ≈ ${approxUsd(calculation.totalLkr)} USD · €{approxEur(calculation.totalLkr)} EUR
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
            <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
            <span>
              {calculation.isShared && sharedPayment === "eur"
                ? "All-inclusive package: 4x4 safari jeep seat and official wildlife national park entrance ticket are pre-arranged."
                : "National park entrance tickets (~Rs. 15,000 LKR / ~$45 per adult foreign guest) are paid at the official park counter on arrival with driver assistance."}
            </span>
          </div>
        </div>

        {/* Submission CTAs */}
        <div className="space-y-2 pt-1">
          <Button
            type="submit"
            variant="whatsapp"
            size="lg"
            className="h-12 sm:h-14 w-full text-base font-bold shadow-md transition-transform hover:scale-[1.01] cursor-pointer"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Book Safari via WhatsApp
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 mr-1 text-accent" />
            Review & Copy Booking Details
          </Button>

          <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
            Direct reservation with local team · Instant response
          </p>
        </div>
      </form>

      {/* Enquiry Review & Copy Modal */}
      <EnquiryPreview
        message={preview}
        onClose={() => setPreview(null)}
        copied={copied}
        setCopied={setCopied}
      />
    </div>
  );
}

export function EnquiryPreview({
  message,
  onClose,
  copied,
  setCopied,
}: {
  message: string | null;
  onClose: () => void;
  copied: boolean;
  setCopied: (b: boolean) => void;
}) {
  return (
    <Dialog open={message !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Your Safari Booking Enquiry</DialogTitle>
          <DialogDescription>
            You can review your complete safari reservation details below or copy them to send via
            WhatsApp, email, or any messenger.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-72 sm:max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs font-mono text-foreground leading-relaxed border border-border">
          {message}
        </pre>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 cursor-pointer"
            onClick={async () => {
              if (message) await navigator.clipboard.writeText(message);
              setCopied(true);
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied to Clipboard" : "Copy Enquiry"}
          </Button>
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
