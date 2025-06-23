import { NextResponse } from "next/server"

// Mock data for auction products with images
const mockProducts = [
  {
    id: "1",
    name: "Vintage Guitar",
    description:
      "A beautiful 1960s acoustic guitar in excellent condition. Perfect for collectors and musicians alike. Features original hardware and stunning wood grain.",
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    currentHighestBid: 1250,
    image: "/placeholder.svg?height=250&width=400",
    category: "Musical Instruments",
    bidHistory: [
      {
        id: "bid1",
        amount: 1000,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        bidder: "MusicLover42",
      },
      {
        id: "bid2",
        amount: 1100,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        bidder: "GuitarCollector",
      },
      {
        id: "bid3",
        amount: 1250,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        bidder: "VintageSeeker",
      },
    ],
  },
  {
    id: "2",
    name: "Rare Art Print",
    description:
      "Limited edition art print by renowned artist. Only 50 copies were ever made. Comes with certificate of authenticity.",
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    currentHighestBid: 750,
    image: "/placeholder.svg?height=250&width=400",
    category: "Art & Collectibles",
    bidHistory: [
      {
        id: "bid4",
        amount: 500,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        bidder: "ArtEnthusiast",
      },
      {
        id: "bid5",
        amount: 750,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        bidder: "PrintCollector",
      },
    ],
  },
  {
    id: "3",
    name: "Antique Pocket Watch",
    description:
      "Swiss-made pocket watch from the early 1900s. Fully functional with original chain. A true collector's piece.",
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    currentHighestBid: 2100,
    image: "/placeholder.svg?height=250&width=400",
    category: "Antiques",
    bidHistory: [
      {
        id: "bid6",
        amount: 1500,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        bidder: "TimeKeeper",
      },
      {
        id: "bid7",
        amount: 1800,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        bidder: "AntiqueHunter",
      },
      {
        id: "bid8",
        amount: 2100,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        bidder: "WatchMaster",
      },
    ],
  },
  {
    id: "4",
    name: "Designer Handbag",
    description:
      "Authentic luxury handbag in pristine condition. Comes with original packaging, dust bag, and certificate of authenticity.",
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    currentHighestBid: 890,
    image: "/placeholder.svg?height=250&width=400",
    category: "Fashion",
    bidHistory: [
      {
        id: "bid9",
        amount: 650,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        bidder: "FashionLover",
      },
      {
        id: "bid10",
        amount: 890,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        bidder: "LuxurySeeker",
      },
    ],
  },
  {
    id: "5",
    name: "Gaming Console Bundle",
    description:
      "Complete gaming setup with latest console, wireless controllers, and 10 popular games. Perfect for gaming enthusiasts.",
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    currentHighestBid: 450,
    image: "/placeholder.svg?height=250&width=400",
    category: "Electronics",
    bidHistory: [
      {
        id: "bid11",
        amount: 300,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        bidder: "GameMaster",
      },
      {
        id: "bid12",
        amount: 400,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        bidder: "ConsoleKing",
      },
      {
        id: "bid13",
        amount: 450,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        bidder: "RetroGamer",
      },
    ],
  },
  {
    id: "6",
    name: "Professional Camera",
    description:
      "High-end DSLR camera with multiple lenses and accessories. Ideal for professional photography and videography.",
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    currentHighestBid: 1800,
    image: "/placeholder.svg?height=250&width=400",
    category: "Photography",
    bidHistory: [
      {
        id: "bid14",
        amount: 1200,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        bidder: "PhotoPro",
      },
      {
        id: "bid15",
        amount: 1500,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        bidder: "CameraExpert",
      },
      {
        id: "bid16",
        amount: 1800,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        bidder: "ShutterBug",
      },
    ],
  },
]

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(mockProducts)
}
 