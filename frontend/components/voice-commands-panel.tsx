import { Mic, Volume2, Zap, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const voiceCommands = [
  {
    command: "Place bid on Vintage Guitar",
    description: "Place a bid on a specific item",
    icon: <Zap className="w-4 h-4" />,
    category: "Bidding",
  },
  {
    command: "Show all products",
    description: "Display all available auctions",
    icon: <MessageSquare className="w-4 h-4" />,
    category: "Navigation",
  },
  {
    command: "What's the highest bid?",
    description: "Get current highest bid information",
    icon: <Volume2 className="w-4 h-4" />,
    category: "Information",
  },
  {
    command: "Set alert for iPhone auction",
    description: "Set notifications for specific items",
    icon: <Mic className="w-4 h-4" />,
    category: "Alerts",
  },
]

export default function VoiceCommandsPanel() {
  return (
    <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 border border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span>Voice Commands</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Try these voice commands to interact with the auction platform</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {voiceCommands.map((cmd, index) => (
            <div
              key={index}
              className="group p-3 rounded-lg border bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:shadow-md"
            >
              <div className="flex items-start space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center text-white">
                  {cmd.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  {cmd.category}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium group-hover:text-blue-600 transition-colors">"{cmd.command}"</p>
                <p className="text-xs text-muted-foreground">{cmd.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center">
          <Button variant="outline" size="sm" className="text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
            <Volume2 className="w-3 h-3 mr-1" />
            Try Voice Command
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
