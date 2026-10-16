import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Check,
  Clock,
  Users,
  Car,
  UtensilsCrossed,
  ShieldCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  Info,
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
  safaris,
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

type Errors = Partial<Record<"date" | "guests" | "name", string>>;

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
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
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

  // Price calculations
  const calculation = useMemo(() => {
    const isShared = currentPkg.type === "Shared";
    let baseLkr = 0;
    let baseEur = 0;
    let mealsTotalLkr = 0;

    if (isShared) {
      if (sharedPayment === "eur") {
        baseEur = currentPkg.sharedPriceEur * guests;
      } else {
        baseLkr = currentPkg.sharedPriceLkr * guests;
      }
    } else {
      baseLkr = vehicleType === "luxury" ? currentPkg.luxuryPrice : currentPkg.superLuxuryPrice;
      if (packageTier === "all-inclusive") {
        mealsTotalLkr = currentPkg.mealPricePerPerson * guests;
      }
    }

    const totalLkr = baseLkr + mealsTotalLkr;

    return {
      isShared,
      baseLkr,
      baseEur,
      mealsTotalLkr,
      totalLkr,
      vehicleName: isShared ? "Shared 4x4 Jeep" : VEHICLE_DETAILS[vehicleType].name,
      planName: isShared
        ? sharedPayment === "eur"
          ? "€45 All-Inclusive (Jeep + Park Ticket)"
          : "Rs. 8,000 Advance Seat"
        : packageTier === "all-inclusive"
          ? "All-Inclusive (Jeep + Meals & Drinks)"
          : "Safari Jeep Only",
    };
  }, [currentPkg, vehicleType, packageTier, sharedPayment, guests]);

  // Construct structured WhatsApp booking enquiry
  const message = useMemo(() => {
    const lines = [
      "🌿 *YALA PARK SAFARI BOOKING ENQUIRY* 🌿",
      "Hello Yala Park Safari, I would like to book a safari package.",
      "",
      `📦 *Package:* ${currentPkg.name}`,
      `⏱️ *Duration:* ${currentPkg.durationLabel} (${packageKey === "half-day-5h" ? halfDaySession : currentPkg.timingLabel})`,
      `🚙 *Vehicle:* ${calculation.vehicleName}`,
      `🍽️ *Plan Selected:* ${calculation.planName}`,
      `📅 *Preferred Date:* ${fmtDate(date)}`,
      `👥 *Guests:* ${guests} ${guests === 1 ? "guest" : "guests"}`,
      `👤 *Lead Guest:* ${name.trim() || "—"}`,
      `🏨 *Pickup Hotel/Location:* ${pickup.trim() || "To be confirmed"}`,
      "",
      "💰 *PACKAGE PRICING BREAKDOWN:*",
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
          `• Park Entry Tickets: ${formatLkr(PARK_TICKET_PRICE_LKR)} × ${guests} (payable at park entrance)`,
        );
      }
    } else {
      lines.push(
        `• Safari Jeep (${calculation.vehicleName}): ${formatLkr(calculation.baseLkr)} (covers whole group up to 6 guests)`,
      );
      if (packageTier === "all-inclusive") {
        lines.push(
          `• Meals & Drinks Package: ${formatLkr(currentPkg.mealPricePerPerson)} × ${guests} = ${formatLkr(calculation.mealsTotalLkr)}`,
        );
        lines.push(`  (${currentPkg.mealPackDetails})`);
      }
      lines.push(
        `⭐ *Total Safari Package:* ${formatLkr(calculation.totalLkr)} (~$${approxUsd(calculation.totalLkr)} USD / ~€${approxEur(calculation.totalLkr)} EUR)`,
      );
      lines.push(
        `ℹ️ *Park Tickets:* ~Rs. 15,000 LKR ($45) per foreign adult paid at park entrance gate with driver assistance.`,
      );
    }

    if (notes.trim()) {
      lines.push("");
      lines.push(`📝 *Special Requests:* ${notes.trim()}`);
    }

    lines.push("");
    lines.push("Please confirm availability and pickup time. Thank you!");

    return lines.join("\n");
  }, [currentPkg, packageKey, halfDaySession, calculation, date, guests, name, pickup, notes, sharedPayment, packageTier]);

  function validate(): Errors {
    const e: Errors = {};
    const min = minDate || todayInColombo();
    if (!date) e.date = "Please choose a safari date.";
    else if (date < min) e.date = "Please choose today or a future date.";
    if (!(guests >= 1 && guests <= 8)) e.guests = "Please select valid guest count.";
    if (!name.trim()) e.name = "Please enter your name.";
    else if (name.trim().length > 80) e.name = "Name is too long.";
    return e;
  }

  function submit(ev: React.FormEvent) {
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

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`bf-${k}-err`} className="mt-1 text-xs font-semibold text-destructive">
        {errors[k]}
      </p>
    ) : null;

  const fieldClass =
    "w-full rounded-lg border border-input bg-card px-3.5 h-11 text-sm text-foreground transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <div
      id="book"
      tabIndex={-1}
      className="rounded-2xl border border-border/80 bg-card p-5 text-card-foreground shadow-[var(--shadow-card)] sm:p-6"
    >
      <div className="mb-4 border-b border-border/60 pb-3.5">
        <span className="eyebrow block">Instant Reservation</span>
        <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
          Choose Your Safari Package
        </h2>
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        {/* Step 1: Package Selector Cards */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            1. Select Safari Package
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                    "flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all",
                    active
                      ? "border-accent bg-gold-soft text-primary ring-2 ring-accent shadow-sm"
                      : "border-border bg-card text-foreground hover:border-accent/60 hover:bg-muted/40",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold leading-tight">{pkg.short}</span>
                      {pkg.badge && (
                        <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent-foreground">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block text-[11px] text-muted-foreground leading-snug">
                      {pkg.durationLabel}
                    </span>
                  </div>
                  <div className="mt-2.5 border-t border-border/50 pt-1.5">
                    <span className="block text-xs font-bold text-primary">
                      {pkg.id === "shared" ? "From €45" : `From Rs. ${pkg.luxuryPrice.toLocaleString()}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {pkg.type === "Private" ? "per jeep" : "per seat"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Vehicle & Package Plan (Clean Grouped Cards) */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 sm:p-4 space-y-3.5">
          {/* For Private Safaris: Vehicle Tier Selection */}
          {currentPkg.type === "Private" && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Choose Vehicle Tier
                </span>
                <span className="text-xs text-muted-foreground">Up to 6 guests per jeep</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(["luxury", "super-luxury"] as const).map((vt) => {
                  const active = vehicleType === vt;
                  const price = vt === "luxury" ? currentPkg.luxuryPrice : currentPkg.superLuxuryPrice;
                  const info = VEHICLE_DETAILS[vt];
                  return (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setVehicleType(vt)}
                      className={cn(
                        "rounded-lg border p-2.5 text-left transition-all",
                        active
                          ? "border-accent bg-gold-soft text-primary ring-2 ring-accent"
                          : "border-border bg-card text-foreground hover:border-accent/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1">
                          <Car className="h-3.5 w-3.5 text-accent" />
                          {info.name}
                        </span>
                        <span className="text-xs font-bold text-primary">{formatLkr(price)}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                        {vt === "luxury" ? "Standard 4x4 open safari jeep" : "Ultra-comfort cushioned seats & ride"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Session selector for 5-hour safari */}
          {packageKey === "half-day-5h" && (
            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Safari Drive Time
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["Morning", "Afternoon"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHalfDaySession(s)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition-all",
                      halfDaySession === s
                        ? "border-accent bg-gold-soft text-primary ring-2 ring-accent"
                        : "border-border bg-card text-foreground hover:border-accent/60",
                    )}
                  >
                    <Clock className="h-3 w-3 mr-1 text-accent" />
                    {s === "Morning" ? "Morning (5am–10am)" : "Afternoon (2pm–6:30pm)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Package Inclusions (Bundled vs Jeep-Only) */}
          {currentPkg.type === "Private" ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Package Inclusions Plan
                </span>
                <span className="text-xs text-accent font-semibold">Zero hassle booking</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPackageTier("all-inclusive")}
                  className={cn(
                    "flex flex-col justify-between rounded-lg border p-3 text-left transition-all",
                    packageTier === "all-inclusive"
                      ? "border-accent bg-gold-soft text-primary ring-2 ring-accent"
                      : "border-border bg-card text-foreground hover:border-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <UtensilsCrossed className="h-4 w-4 text-accent" />
                      All-Inclusive Package
                    </span>
                    <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {currentPkg.id === "full-day"
                      ? "Breakfast + Sri Lankan Rice & Curry lunch + Fruits + 1L Chilled Water"
                      : "Packed Safari Breakfast + Chilled Mineral Water bottle"}
                  </p>
                  <div className="mt-2 text-xs font-bold text-primary">
                    +{formatLkr(currentPkg.mealPricePerPerson)} / person
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageTier("jeep-only")}
                  className={cn(
                    "flex flex-col justify-between rounded-lg border p-3 text-left transition-all",
                    packageTier === "jeep-only"
                      ? "border-accent bg-gold-soft text-primary ring-2 ring-accent"
                      : "border-border bg-card text-foreground hover:border-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      Jeep Only Plan
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      Standard
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Private 4x4 Jeep + Driver/Tracker + Fuel + Park Patrol (bring your own food & drinks)
                  </p>
                  <div className="mt-2 text-xs font-bold text-muted-foreground">
                    Base Jeep Rate Only
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Shared Safari Payment Options */
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Shared Safari Plan
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSharedPayment("eur")}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    sharedPayment === "eur"
                      ? "border-accent bg-gold-soft text-primary ring-2 ring-accent"
                      : "border-border bg-card text-foreground hover:border-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">€45 All-Inclusive</span>
                    <span className="rounded bg-accent/20 px-1 py-0.5 text-[9px] font-bold text-accent-foreground">
                      Top Choice
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Includes Jeep Seat + Official Wildlife Park Entrance Ticket!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSharedPayment("lkr")}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    sharedPayment === "lkr"
                      ? "border-accent bg-gold-soft text-primary ring-2 ring-accent"
                      : "border-border bg-card text-foreground hover:border-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Rs. 8,000 Advance</span>
                    <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-bold text-muted-foreground">
                      Local
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Advance seat booking. Park ticket (15,000 LKR) paid at park entrance.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Date & Guests (Compact 2-columns) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bf-date" className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
              className={fieldClass}
            />
            {err("date")}
          </div>

          <div>
            <label htmlFor="bf-guests" className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-accent" />
              Number of Guests
            </label>
            <select
              id="bf-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={fieldClass}
            >
              {Array.from({ length: currentPkg.type === "Shared" ? 8 : JEEP_CAPACITY }, (_, i) => i + 1).map(
                (n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}{" "}
                    {currentPkg.type === "Private" && n === JEEP_CAPACITY ? "(Full Jeep)" : ""}
                  </option>
                ),
              )}
            </select>
            {err("guests")}
          </div>
        </div>

        {/* Step 4: Name & Pickup Hotel (Compact 2-columns) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="bf-name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your Name <span className="text-destructive">*</span>
            </label>
            <input
              id="bf-name"
              value={name}
              maxLength={80}
              placeholder="e.g. David Miller"
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "bf-name-err" : undefined}
              className={fieldClass}
            />
            {err("name")}
          </div>

          <div>
            <label htmlFor="bf-pickup" className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hotel / Pickup Location <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="bf-pickup"
              value={pickup}
              maxLength={120}
              placeholder="e.g. Hotel in Tissamaharama or Yala"
              onChange={(e) => setPickup(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        {/* Transparent Price Summary Card */}
        <div className="rounded-xl border border-accent/40 bg-gold-soft/40 p-3.5 sm:p-4" aria-live="polite">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {currentPkg.name}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {calculation.vehicleName} · {calculation.planName} · {guests} {guests === 1 ? "guest" : "guests"}
              </span>
            </div>
            <div className="text-right">
              {calculation.isShared && sharedPayment === "eur" ? (
                <div>
                  <span className="font-display text-2xl font-bold text-primary">
                    €{calculation.baseEur} EUR
                  </span>
                  <span className="block text-[10px] text-muted-foreground">Tickets Included</span>
                </div>
              ) : (
                <div>
                  <span className="font-display text-xl sm:text-2xl font-bold text-primary">
                    {formatLkr(calculation.totalLkr)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    ≈ ${approxUsd(calculation.totalLkr)} USD · €{approxEur(calculation.totalLkr)} EUR
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
            <span>
              {calculation.isShared && sharedPayment === "eur"
                ? "All-inclusive: Jeep seat & official wildlife national park entrance ticket are pre-arranged."
                : "Park entrance tickets (~Rs. 15,000 LKR / ~$45 per adult foreign guest) are paid at park counter on entry with driver assistance."}
            </span>
          </div>
        </div>

        {/* WhatsApp Submit Action */}
        <div className="space-y-1.5">
          <Button
            type="submit"
            variant="whatsapp"
            size="lg"
            className="h-12 w-full text-base font-bold shadow-md transition-transform hover:scale-[1.01]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Book Package via WhatsApp
          </Button>

          <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            Direct reservation with local team · Instant confirmation · No payment needed for inquiry
          </p>
        </div>
      </form>

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-primary">Your WhatsApp Booking Enquiry</DialogTitle>
          <DialogDescription>
            You can review or copy your complete package reservation details below.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3.5 text-xs font-mono text-foreground leading-relaxed border border-border">
          {message}
        </pre>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={async () => {
              if (message) await navigator.clipboard.writeText(message);
              setCopied(true);
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied to Clipboard" : "Copy Enquiry"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
