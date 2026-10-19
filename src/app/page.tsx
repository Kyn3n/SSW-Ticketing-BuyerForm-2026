import { BuyerTicketForm } from "@/components/buyer-ticket-form";
import { EventEndedPage } from "@/components/event-ended-page";

const BUYER_FORM_ENABLED = false;

export default function Home() {
  return BUYER_FORM_ENABLED ? <BuyerTicketForm /> : <EventEndedPage />;
}
