import { Trophy, Medal, Award, Crown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Bid {
  id: string
  amount: number
  timestamp: string
  bidder: string
  avatar?: string
}

interface BiddingLeaderboardProps {
  bidHistory: Bid[]
}

export default function BiddingLeaderboard({ bidHistory }: BiddingLeaderboardProps) {
  // Get top 5 unique bidders sorted by highest bid
  const topBidders = bidHistory
    .reduce((acc, bid) => {
      const existingBidder = acc.find((b) => b.bidder === bid.bidder)
      if (!existingBidder || bid.amount > existingBidder.amount) {
        return [...acc.filter((b) => b.bidder !== bid.bidder), bid]
      }
      return acc
    }, [] as Bid[])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  if (topBidders.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No bids yet - be the first!</p>
        </CardContent>
      </Card>
    )
  }

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 1:
        return <Trophy className="w-4 h-4 text-gray-400" />
      case 2:
        return <Medal className="w-4 h-4 text-amber-600" />
      default:
        return <Award className="w-4 h-4 text-blue-500" />
    }
  }

  const getPositionColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-300 dark:border-yellow-700"
      case 1:
        return "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/20 dark:to-gray-700/10 border-gray-300 dark:border-gray-600"
      case 2:
        return "bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-300 dark:border-amber-700"
      default:
        return "bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-900/10 dark:to-blue-800/5 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-purple-600" />
          <span>Top Bidders</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topBidders.map((bid, index) => (
          <div
            key={`${bid.bidder}-${index}`}
            className={`flex items-center justify-between p-2 rounded-lg border ${getPositionColor(index)}`}
          >
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {getPositionIcon(index)}
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  #{index + 1}
                </Badge>
              </div>
              <Avatar className="w-6 h-6">
                <AvatarImage src={bid.avatar || "/placeholder.svg"} alt={bid.bidder} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {bid.bidder.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium truncate max-w-20">{bid.bidder}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(bid.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">${bid.amount.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
