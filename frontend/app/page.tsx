"use client"

import { useState, useEffect, useCallback } from "react"
import { Moon, Sun, Mic, Package, Clock, DollarSign, History, Gavel, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import Image from "next/image"
import Footer from "@/components/footer"
import VoiceCommandsPanel from "@/components/voice-commands-panel"
import BiddingLeaderboard from "@/components/bidding-leaderboard"
import ConfettiAnimation from "@/components/confetti-animation"

interface Bid {
  id: string
  amount: number
  timestamp: string
  bidder: string
  avatar?: string
}

interface Product {
  id: string
  name: string
  description: string
  endTime: string
  currentHighestBid: number
  bidHistory: Bid[]
  image: string
  category: string
  previousHighestBid?: number
}

export default function VoiceAuctionPlatform() {
  const [products, setProducts] = useState<Product[]>([])
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({})
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com", avatar: "" })
  const [showConfetti, setShowConfetti] = useState<string | null>(null)
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set())
  const [userOutbidProducts, setUserOutbidProducts] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()

      // Check for outbid notifications
      if (products.length > 0 && isLoggedIn) {
        data.forEach((newProduct: Product) => {
          const oldProduct = products.find((p) => p.id === newProduct.id)
          if (oldProduct && oldProduct.currentHighestBid < newProduct.currentHighestBid) {
            // Check if user was the previous highest bidder
            const userWasPreviousHighest =
              oldProduct.bidHistory.length > 0 &&
              oldProduct.bidHistory[oldProduct.bidHistory.length - 1]?.bidder === user.name

            if (userWasPreviousHighest && newProduct.bidHistory.length > 0) {
              const newHighestBidder = newProduct.bidHistory[newProduct.bidHistory.length - 1]?.bidder
              if (newHighestBidder !== user.name) {
                toast({
                  title: "You've been outbid! 😱",
                  description: `Someone placed a higher bid of $${newProduct.currentHighestBid.toLocaleString()} on ${newProduct.name}`,
                  variant: "destructive",
                })
                setUserOutbidProducts((prev) => new Set([...prev, newProduct.id]))
              }
            }
          }
        })
      }

      setProducts(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast({
        title: "Error",
        description: "Failed to load auction items",
        variant: "destructive",
      })
    }
  }

  // Place a bid with animation
  const placeBid = async (productName: string, amount: number, productId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place a bid",
        variant: "destructive",
      })
      return
    }

    try {
      // Add card animation
      setAnimatingCards((prev) => new Set([...prev, productId]))

      const response = await fetch("/api/bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productName, amount, bidder: user.name }),
      })

      const result = await response.json()

      if (response.ok) {
        // Show confetti animation
        setShowConfetti(productId)
        setTimeout(() => setShowConfetti(null), 3000)

        toast({
          title: "Bid Placed Successfully! 🎉",
          description: `Your bid of $${amount.toLocaleString()} for ${productName} has been placed.`,
        })
        setBidAmounts((prev) => ({ ...prev, [productName]: "" }))

        // Remove from outbid list if user places new bid
        setUserOutbidProducts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })

        fetchProducts() // Refresh data
      } else {
        toast({
          title: "Bid Failed",
          description: result.error || "Failed to place bid",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while placing bid",
        variant: "destructive",
      })
    } finally {
      // Remove card animation after delay
      setTimeout(() => {
        setAnimatingCards((prev) => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      }, 1000)
    }
  }

  // Calculate time left with urgency levels
  const getTimeLeft = useCallback((endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const difference = end - now

    if (difference <= 0) {
      return { text: "Auction Ended", urgency: "ended", percentage: 0 }
    }

    const totalTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    const percentage = Math.max(0, (difference / totalTime) * 100)

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    let text = ""
    let urgency = "normal"

    if (days > 0) {
      text = `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m ${seconds}s`
      if (hours < 2) urgency = "warning"
    } else {
      text = `${minutes}m ${seconds}s`
      urgency = minutes < 10 ? "urgent" : "warning"
    }

    return { text, urgency, percentage }
  }, [])

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser({ name: "", email: "", avatar: "" })
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  // Initial load and polling setup
  useEffect(() => {
    fetchProducts()
    // Simulate user login for demo
    setIsLoggedIn(true)

    // Set up polling for live updates every 3 seconds
    const interval = setInterval(fetchProducts, 3000)

    return () => clearInterval(interval)
  }, [])

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setProducts((prev) => [...prev]) // Force re-render for countdown
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Load OmniDim voice widget
  useEffect(() => {
    const script = document.createElement("script")
    script.id = "omnidimension-web-widget"
    script.async = true
    script.src = "https://backend.omnidim.io/web_widget.js?secret_key=YOUR_SECRET_KEY"
    document.head.appendChild(script)

    return () => {
      const existingScript = document.getElementById("omnidimension-web-widget")
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <Gavel className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
          </div>
          <p className="text-muted-foreground text-lg">Loading auction items...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${darkMode ? "dark" : ""}`}
    >
      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gavel className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Voice Auction Platform
                </h1>
                <p className="text-sm text-muted-foreground">Live Bidding Experience</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Live Auctions
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Discover unique items, place your bids, and experience the thrill of live auctions with voice commands
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Voice Commands</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Real-time Bidding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Commands Panel */}
      <div className="container mx-auto px-4 mb-8">
        <VoiceCommandsPanel />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const timeLeft = getTimeLeft(product.endTime)
            const isAnimating = animatingCards.has(product.id)
            const isOutbid = userOutbidProducts.has(product.id)

            return (
              <Card
                key={product.id}
                className={`overflow-hidden transition-all duration-500 transform bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                  isAnimating ? "scale-105 shadow-2xl ring-4 ring-blue-500/50" : ""
                } ${isOutbid ? "ring-2 ring-red-500/50" : ""}`}
              >
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={timeLeft.urgency === "ended" ? "destructive" : "default"}
                      className={`font-medium ${
                        timeLeft.urgency === "urgent"
                          ? "bg-red-600 text-white animate-pulse"
                          : timeLeft.urgency === "warning"
                            ? "bg-yellow-600 text-white"
                            : "bg-black/80 text-white"
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {timeLeft.text}
                    </Badge>
                  </div>
                  {isOutbid && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-bounce">
                        OUTBID!
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>

                  {/* Enhanced Countdown Progress Bar */}
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Time Remaining</span>
                      <span
                        className={`font-medium ${
                          timeLeft.urgency === "urgent"
                            ? "text-red-600"
                            : timeLeft.urgency === "warning"
                              ? "text-yellow-600"
                              : "text-gray-600"
                        }`}
                      >
                        {timeLeft.text}
                      </span>
                    </div>
                    <Progress
                      value={timeLeft.percentage}
                      className={`h-2 ${timeLeft.urgency === "urgent" ? "progress-urgent" : ""}`}
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current Highest Bid */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Current Highest Bid</span>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          {product.currentHighestBid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bidding Leaderboard */}
                  <BiddingLeaderboard bidHistory={product.bidHistory} />

                  {/* Bid History Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4" />
                          <span>Full Bid History ({product.bidHistory.length})</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                      {product.bidHistory.length === 0 ? (
                        <DropdownMenuItem disabled>No bids yet</DropdownMenuItem>
                      ) : (
                        product.bidHistory.map((bid) => (
                          <DropdownMenuItem key={bid.id} className="flex-col items-start p-3">
                            <div className="flex justify-between w-full">
                              <span className="font-medium text-green-600">${bid.amount.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground font-medium">{bid.bidder}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatTimestamp(bid.timestamp)}</span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator />

                  {/* Place Bid Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Place Your Bid</label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          className="pl-9 border-2 focus:border-blue-500"
                          value={bidAmounts[product.name] || ""}
                          onChange={(e) =>
                            setBidAmounts((prev) => ({
                              ...prev,
                              [product.name]: e.target.value,
                            }))
                          }
                          min={product.currentHighestBid + 1}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          const amount = Number.parseFloat(bidAmounts[product.name] || "0")
                          if (amount > product.currentHighestBid) {
                            placeBid(product.name, amount, product.id)
                          } else {
                            toast({
                              title: "Invalid Bid",
                              description: `Bid must be higher than $${product.currentHighestBid.toLocaleString()}`,
                              variant: "destructive",
                            })
                          }
                        }}
                        disabled={
                          !bidAmounts[product.name] ||
                          Number.parseFloat(bidAmounts[product.name]) <= product.currentHighestBid ||
                          timeLeft.urgency === "ended"
                        }
                        className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Gavel className="w-4 h-4 mr-2" />
                        {isAnimating ? "Bidding..." : "Bid"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum bid: ${(product.currentHighestBid + 1).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No Active Auctions</h3>
            <p className="text-muted-foreground">Check back later for new auction items</p>
          </div>
        )}
      </main>

      {/* Floating Voice Assistant Button */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 pulse-glow"
        onClick={() => {
          toast({
            title: "Voice Assistant Activated 🎤",
            description: "Listening for your voice commands...",
          })
        }}
      >
        <Mic className="w-7 h-7" />
      </Button>

      <Footer />
      <Toaster />
    </div>
  )
}
