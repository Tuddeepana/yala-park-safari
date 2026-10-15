import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
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
  getSafari,
  calcTotal,
  basisLabel,
  exclusions,
  exclusionNote,
  JEEP_CAPACITY,
  type SafariId,
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

type Errors = Partial<Record<"date" | "guests" | "session" | "name", string>>;

export function BookingForm({
  selected,
  onSelect,
}: {
  selected: SafariId;
  onSelect: (id: SafariId) => void;
}) {
  const safari = getSafari(selected);
  const [minDate, setMinDate] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [session, setSession] = useState<"" | "Morning" | "Afternoon">("");
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMinDate(todayInColombo()), []);

  const { qty, rate, total } = calcTotal(safari, guests);

  const message = useMemo(
    () =>
      [
        "Hello Yala Park Safari,",
        "I would like to enquire about a safari.",
        "",
        `Safari: ${safari.name}`,
        `Preferred date: ${fmtDate(date)}`,
        `Preferred session: ${safari.needsSession ? session || "—" : "Full day"}`,
        `Guests: ${guests}`,
        `Guest name: ${name.trim()}`,
        `Pickup location: ${pickup.trim() || "Not specified"}`,
        `Price basis: USD ${rate} ${basisLabel(safari.basis)}${safari.basis === "per-person" ? ` × ${qty}` : ""}`,
        `Estimated total: USD ${total}${siteConfig.demoMode ? " (sample price)" : ""}`,
        `Excluded items: ${exclusions.join(", ")}`,
        `Additional requests: ${notes.trim() || "None"}`,
        "",
        "Please confirm availability, final inclusions, and the total price.",
      ].join("\n"),
    [safari, date, session, guests, name, pickup, notes, rate, qty, total],
  );

  function validate(): Errors {
    const e: Errors = {};
    const min = minDate || todayInColombo();
    if (!date) e.date = "Please choose a safari date.";
    else if (date < min) e.date = "Please choose today or a future date.";
    if (!(guests >= 1 && guests <= JEEP_CAPACITY)) e.guests = `Choose 1 to ${JEEP_CAPACITY} guests.`;
    if (safari.needsSession && !session) e.session = "Please choose morning or afternoon.";
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
    if (whatsappReady()) window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    else {
      setCopied(false);
      setPreview(message);
    }
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`bf-${k}-err`} className="mt-1 text-sm text-destructive">
        {errors[k]}
      </p>
    ) : null;
  const field =
    "w-full rounded-md border border-input bg-card px-3 h-11 text-base text-foreground focus-visible:outline-2";

  return (
    <div
      id="book"
      tabIndex={-1}
      className="rounded-xl bg-card p-5 text-card-foreground shadow-[var(--shadow-card)] sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-2xl">Book your safari</h2>
        {siteConfig.demoMode && <span className="demo-badge">Sample prices</span>}
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Safari category</legend>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {safaris.map((s) => {
              const on = s.id === selected;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "min-h-16 rounded-md border px-2 py-2 text-left text-sm transition-colors",
                    on
                      ? "border-accent bg-gold-soft ring-2 ring-accent"
                      : "border-input bg-card hover:border-accent",
                  )}
                >
                  <span className="block font-semibold text-primary">{s.short}</span>
                  <span className="block text-xs text-muted-foreground">
                    {s.type} · ${s.price} {basisLabel(s.basis)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bf-date" className="mb-1 block text-sm font-semibold">
              Preferred date
            </label>
            <input
              id="bf-date"
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "bf-date-err" : undefined}
              className={field}
            />
            {err("date")}
          </div>
          <div>
            <label htmlFor="bf-guests" className="mb-1 block text-sm font-semibold">
              Guests
            </label>
            <select
              id="bf-guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={field}
            >
              {Array.from({ length: JEEP_CAPACITY }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
            <a href="#contact" className="mt-1 inline-block text-xs text-primary underline">
              Larger group? Ask us for a quote
            </a>
            {err("guests")}
          </div>
        </div>

        {safari.needsSession && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Session</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["Morning", "Afternoon"] as const).map((s, i) => (
                <label
                  key={s}
                  className={cn(
                    "flex h-11 cursor-pointer items-center justify-center rounded-md border text-sm font-medium",
                    session === s ? "border-accent bg-gold-soft ring-2 ring-accent" : "border-input",
                  )}
                >
                  <input
                    id={i === 0 ? "bf-session" : undefined}
                    type="radio"
                    name="session"
                    value={s}
                    checked={session === s}
                    onChange={() => setSession(s)}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
            {err("session")}
          </fieldset>
        )}

        <div>
          <label htmlFor="bf-name" className="mb-1 block text-sm font-semibold">
            Your name
          </label>
          <input
            id="bf-name"
            value={name}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "bf-name-err" : undefined}
            className={field}
          />
          {err("name")}
        </div>
        <div>
          <label htmlFor="bf-pickup" className="mb-1 block text-sm font-semibold">
            Pickup hotel or location <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input id="bf-pickup" value={pickup} maxLength={120} onChange={(e) => setPickup(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="bf-notes" className="mb-1 block text-sm font-semibold">
            Message or special request <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="bf-notes"
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-base"
          />
        </div>

        <div className="rounded-md bg-muted p-4 text-sm" aria-live="polite">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Safari</dt>
            <dd className="text-right font-medium">{safari.name}</dd>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right">
              {fmtDate(date)}
              {safari.needsSession && session ? ` · ${session}` : ""}
            </dd>
            <dt className="text-muted-foreground">Guests</dt>
            <dd className="text-right">{guests}</dd>
            <dt className="text-muted-foreground">Price basis</dt>
            <dd className="text-right">
              {qty} × USD {rate} {basisLabel(safari.basis)}
            </dd>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-semibold">Estimated total</span>
            <span className="font-display text-2xl text-primary">USD {total}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{exclusionNote}</p>
        </div>

        <Button type="submit" variant="whatsapp" size="lg" className="h-12 w-full text-base">
          <WhatsAppIcon className="h-5 w-5" /> Book via WhatsApp
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Send your request to check availability. Your booking is confirmed after our team replies.
        </p>
      </form>

      <EnquiryPreview message={preview} onClose={() => setPreview(null)} copied={copied} setCopied={setCopied} />
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
          <DialogTitle className="font-display text-primary">Your enquiry is ready</DialogTitle>
          <DialogDescription>
            The WhatsApp number for this website hasn't been added yet, so we can't open WhatsApp. You
            can copy your enquiry below. Nothing has been sent.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">{message}</pre>
        <Button
          onClick={async () => {
            if (message) await navigator.clipboard.writeText(message);
            setCopied(true);
          }}
        >
          {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy enquiry"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
