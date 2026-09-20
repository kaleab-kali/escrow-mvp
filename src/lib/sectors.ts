import type { Sector, SectorId } from "./types";

export const SECTORS: Sector[] = [
  {
    id: "real_estate",
    label: "Real Estate",
    labelAm: "ሪል እስቴት",
    description:
      "Milestone construction releases aligned with Proclamation 1357/2024 spirit — funds held until verified progress.",
    icon: "Building2",
    feeBps: 100,
    defaultMilestones: [
      {
        title: "Foundation & structure",
        percent: 30,
        description: "Foundation poured; structural frame verified on site.",
      },
      {
        title: "Roofing & envelope",
        percent: 25,
        description: "Roof complete; exterior envelope weather-tight.",
      },
      {
        title: "MEP & finishes",
        percent: 25,
        description: "Mechanical, electrical, plumbing and interior finishes.",
      },
      {
        title: "Handover & title",
        percent: 20,
        description: "Final inspection, keys, and title documentation.",
      },
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    labelAm: "ኢ-ኮሜርስ",
    description: "Delivery plus buyer inspection period before release.",
    icon: "ShoppingBag",
    feeBps: 200,
    defaultMilestones: [
      {
        title: "Shipped",
        percent: 40,
        description: "Item dispatched with tracking / courier receipt.",
      },
      {
        title: "Delivered + inspection",
        percent: 60,
        description: "Buyer confirms receipt after inspection window.",
      },
    ],
  },
  {
    id: "scholarship",
    label: "Scholarship Agencies",
    labelAm: "ስኮለርሺፕ",
    description: "Tuition held until enrollment and visa milestones clear.",
    icon: "GraduationCap",
    feeBps: 150,
    defaultMilestones: [
      {
        title: "Offer letter verified",
        percent: 20,
        description: "University offer / acceptance letter authenticated.",
      },
      {
        title: "Visa / enrollment",
        percent: 50,
        description: "Student visa issued and enrollment confirmed.",
      },
      {
        title: "Tuition remittance",
        percent: 30,
        description: "Tuition paid to institution; remittance proof filed.",
      },
    ],
  },
  {
    id: "travel",
    label: "Travel Agencies",
    labelAm: "ጉዞ",
    description: "Package payments held until booking confirmation and departure.",
    icon: "Plane",
    feeBps: 175,
    defaultMilestones: [
      {
        title: "Booking confirmed",
        percent: 50,
        description: "Flights/hotels booked; vouchers issued.",
      },
      {
        title: "Departure / service start",
        percent: 50,
        description: "Traveler checked in or tour commenced.",
      },
    ],
  },
  {
    id: "freelancer",
    label: "Freelancers",
    labelAm: "ፍሪላንሰር",
    description: "Deliverable-based milestone releases for remote and local work.",
    icon: "Laptop",
    feeBps: 250,
    defaultMilestones: [
      {
        title: "Kickoff & scope",
        percent: 20,
        description: "Scope signed; initial assets delivered.",
      },
      {
        title: "Draft / mid delivery",
        percent: 40,
        description: "Draft work submitted for review.",
      },
      {
        title: "Final delivery",
        percent: 40,
        description: "Final deliverables accepted by client.",
      },
    ],
  },
];

export function getSector(id: SectorId): Sector {
  return SECTORS.find((s) => s.id === id) ?? SECTORS[0];
}
