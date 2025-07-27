"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Play, Trash2, Edit, Target, Link, Unlink, RotateCcw, Info, X, Eye, ArrowRight } from "lucide-react"

interface PromptState {
  isOpen: boolean
  title: string
  message: string
  defaultValue?: string
  resolve?: (value: string | null) => void
}

interface ChoiceState {
  isOpen: boolean
  title: string
  message: string
  option1: string
  option2: string
  resolve?: (choice: "1" | "2" | null) => void
}

interface StateSequenceData {
  path: Array<{ id: number; label?: string; accepts: boolean }>
  testString: string
  accepted: boolean
}

const STRING_DISPLAY_LIMIT = 25

export default function DFASimulator() {
  const scriptLoadedRef = useRef(false)
  const [alert, setAlert] = useState<{ message: string; type: "info" | "warning" | "success" } | null>(null)
  const [prompt, setPrompt] = useState<PromptState>({ isOpen: false, title: "", message: "" })
  const [choice, setChoice] = useState<ChoiceState>({
    isOpen: false,
    title: "",
    message: "",
    option1: "",
    option2: "",
  })
  const [promptInput, setPromptInput] = useState("")
  const [testResult, setTestResult] = useState<{
    isOpen: boolean
    accepted: boolean
    testString: string
  } | null>(null)
  const [showFullString, setShowFullString] = useState(false)
  const [sequenceView, setSequenceView] = useState<{
    isOpen: boolean
    data: StateSequenceData | null
  }>({ isOpen: false, data: null })

  // Function to show in-page alert
  const showInPageAlert = (message: string, type: "info" | "warning" | "success" = "info") => {
    setAlert({ message, type })
    // Auto-hide after 5 seconds
    setTimeout(() => setAlert(null), 5000)
  }

  // Function to hide in-page alert immediately
  const hideInPageAlert = () => {
    setAlert(null)
  }

  // Function to show custom prompt
  const showCustomPrompt = (title: string, message: string, defaultValue = ""): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptInput(defaultValue)
      setPrompt({
        isOpen: true,
        title,
        message,
        defaultValue,
        resolve,
      })
    })
  }

  // Function to show custom choice dialog
  const showCustomChoice = (
    title: string,
    message: string,
    option1: string,
    option2: string,
  ): Promise<"1" | "2" | null> => {
    return new Promise((resolve) => {
      setChoice({
        isOpen: true,
        title,
        message,
        option1,
        option2,
        resolve,
      })
    })
  }

  // Helper function to truncate long strings
  const truncateString = (str: string, limit: number) => {
    if (str.length <= limit) return str
    return str.substring(0, limit) + "..."
  }

  // Function to show test result popup
  const showTestResult = (accepted: boolean, testString: string) => {
    setTestResult({
      isOpen: true,
      accepted,
      testString,
    })
    setShowFullString(false) // Reset string display mode
    // Auto-hide after 4 seconds
    setTimeout(() => setTestResult(null), 4000)
  }

  // Function to show sequence view - this is triggered by the "View Sequence" button
  const showSequenceView = () => {
    // Access the globally stored test sequence data
    if (window.lastTestSequenceData) {
      console.log("Showing sequence view with data:", window.lastTestSequenceData)
      setSequenceView({
        isOpen: true,
        data: window.lastTestSequenceData,
      })
    } else {
      console.log("No test sequence data available")
      showInPageAlert("No test sequence data available. Please run a test first.", "warning")
    }
  }

  // Handle prompt OK
  const handlePromptOk = () => {
    if (prompt.resolve) {
      prompt.resolve(promptInput.trim() || null)
    }
    setPrompt({ isOpen: false, title: "", message: "" })
    setPromptInput("")
  }

  // Handle prompt Cancel
  const handlePromptCancel = () => {
    if (prompt.resolve) {
      prompt.resolve(null)
    }
    setPrompt({ isOpen: false, title: "", message: "" })
    setPromptInput("")
  }

  // Handle choice option 1
  const handleChoiceOption1 = () => {
    if (choice.resolve) {
      choice.resolve("1")
    }
    setChoice({ isOpen: false, title: "", message: "", option1: "", option2: "" })
  }

  // Handle choice option 2
  const handleChoiceOption2 = () => {
    if (choice.resolve) {
      choice.resolve("2")
    }
    setChoice({ isOpen: false, title: "", message: "", option1: "", option2: "" })
  }

  // Handle choice cancel
  const handleChoiceCancel = () => {
    if (choice.resolve) {
      choice.resolve(null)
    }
    setChoice({ isOpen: false, title: "", message: "", option1: "", option2: "" })
  }

  // Handle Enter key in prompt
  const handlePromptKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePromptOk()
    } else if (e.key === "Escape") {
      handlePromptCancel()
    }
  }

  // Handle Escape key in choice dialog
  const handleChoiceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleChoiceCancel()
    }
  }

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return

    // Expose the alert, prompt, choice, and test result functions globally so the script can use them
    window.showInPageAlert = showInPageAlert
    window.hideInPageAlert = hideInPageAlert
    window.showCustomPrompt = showCustomPrompt
    window.showCustomChoice = showCustomChoice
    window.showTestResult = showTestResult

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${src}"]`)
        if (existingScript) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = src
        script.async = false
        script.defer = false
        script.onload = () => {
          console.log(`Loaded: ${src}`)
          resolve()
        }
        script.onerror = (error) => {
          console.error(`Failed to load: ${src}`, error)
          reject(error)
        }
        document.head.appendChild(script)
      })
    }

    const loadCSS = (href: string) => {
      // Check if CSS already exists
      const existingLink = document.querySelector(`link[href="${href}"]`)
      if (existingLink) return

      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      document.head.appendChild(link)
    }

    const initializeApp = async () => {
      try {
        console.log("Starting app initialization...")

        // Load vis.js CSS first
        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css")

        // Load vis.js JS
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js")

        // Wait for vis.js to be available
        let attempts = 0
        while (!window.vis && attempts < 50) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.vis) {
          throw new Error("vis.js failed to load properly")
        }

        console.log("vis.js loaded successfully")

        // Ensure DOM elements exist before loading your script
        const networkElement = document.getElementById("network")
        const inputListElement = document.getElementById("input-list")
        const nodeCounterElement = document.getElementById("node-counter")

        if (!networkElement || !inputListElement || !nodeCounterElement) {
          console.error("Required DOM elements not found")
          return
        }

        // Load your script
        await loadScript("/script.js")

        scriptLoadedRef.current = true
        console.log("All scripts loaded successfully")
      } catch (error) {
        console.error("Failed to initialize app:", error)
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeApp, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
      <div className="max-w-full mx-auto space-y-4 px-2">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">DFA Simulator</h1>
          <p className="text-base text-gray-600">Design, visualize, and test Deterministic Finite Automata</p>
        </div>

        <Separator className="my-4" />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* Visualization Area */}
          <div className="lg:col-span-7 space-y-3">
            {/* In-page Alert */}
            {alert && (
              <Alert
                className={`border-l-4 ${
                  alert.type === "info"
                    ? "border-l-blue-500 bg-blue-50"
                    : alert.type === "warning"
                      ? "border-l-amber-500 bg-amber-50"
                      : "border-l-green-500 bg-green-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <AlertDescription
                    className={`${
                      alert.type === "info"
                        ? "text-blue-800"
                        : alert.type === "warning"
                          ? "text-amber-800"
                          : "text-green-800"
                    }`}
                  >
                    {alert.message}
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAlert(null)}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            )}

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    State Diagram
                  </div>
                  <Badge
                    id="node-counter"
                    variant="secondary"
                    className="px-3 py-1 text-sm font-semibold bg-gray-100 border border-gray-200"
                  >
                    States: 0
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  id="network"
                  className="w-full h-[420px] border-2 border-gray-200 rounded-lg bg-white shadow-inner"
                ></div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-3 space-y-3">
            {/* Input Alphabet */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  Input Alphabet
                  <Button id="add-input" size="sm" className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700">
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  id="input-list"
                  className="flex flex-wrap gap-1 min-h-[50px] p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                >
                  {/* Input alphabet items will be populated by your script */}
                </div>
              </CardContent>
            </Card>

            {/* Combined Controls */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Controls</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {/* State Controls Row 1 */}
                <div className="grid grid-cols-2 gap-2">
                  <Button id="add-state" className="justify-start gap-1 bg-blue-600 hover:bg-blue-700 py-1.5 text-sm">
                    <Plus className="h-3 w-3" />
                    Add State
                  </Button>
                  <Button
                    id="remove-state"
                    variant="outline"
                    className="justify-start gap-1 border-red-200 text-red-700 hover:bg-red-50 bg-transparent py-1.5 text-sm"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove State
                  </Button>
                </div>

                {/* State Controls Row 2 */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    id="rename-state"
                    variant="outline"
                    className="justify-start gap-1 bg-transparent py-1.5 text-sm"
                  >
                    <Edit className="h-3 w-3" />
                    Rename State
                  </Button>
                  <Button
                    id="set-start-state"
                    variant="outline"
                    className="justify-start gap-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent py-1.5 text-sm"
                  >
                    <Target className="h-3 w-3" />
                    Set Start State
                  </Button>
                </div>

                {/* Toggle Accepting - Full Width */}
                <Button
                  id="switch-accepting"
                  variant="outline"
                  className="w-full justify-start gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent py-1.5 text-sm"
                >
                  <RotateCcw className="h-3 w-3" />
                  Toggle Accepting
                </Button>

                {/* Transition Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    id="add-link"
                    className="justify-start gap-1 bg-indigo-600 hover:bg-indigo-700 py-1.5 text-sm"
                  >
                    <Link className="h-3 w-3" />
                    Add Transition
                  </Button>
                  <Button
                    id="remove-link"
                    variant="outline"
                    className="justify-start gap-1 border-red-200 text-red-700 hover:bg-red-50 bg-transparent py-1.5 text-sm"
                  >
                    <Unlink className="h-3 w-3" />
                    Remove Transition
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4">
                <Button
                  id="test"
                  className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-base py-2"
                >
                  <Play className="h-4 w-4" />
                  Run Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How to Use Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              How to Use the DFA Simulator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">Building Your DFA</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    • <strong>Add States:</strong> Click "Add State" and name your states
                  </li>
                  <li>
                    • <strong>Set Start State:</strong> Click "Set Start State" then click a state
                  </li>
                  <li>
                    • <strong>Mark Accepting:</strong> Use "Toggle Accepting" to mark final states
                  </li>
                  <li>
                    • <strong>Add Input Symbols:</strong> Click "+" to add alphabet symbols
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-indigo-700">Creating Transitions</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    • <strong>Add Transition:</strong> Click "Add Transition", select two states, enter symbol
                  </li>
                  <li>
                    • <strong>Remove Transition:</strong> Click "Remove Transition" then click an edge
                  </li>
                  <li>
                    • <strong>Multiple Symbols:</strong> Transitions can have multiple input symbols
                  </li>
                  <li>
                    • <strong>Drag States:</strong> Click and drag states to rearrange the diagram
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-emerald-700">Testing & Shortcuts</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    • <strong>Test Strings:</strong> Click "Run Test" and enter a string to test
                  </li>
                  <li>
                    • <strong>Visual Feedback:</strong> Watch states light up during string processing
                  </li>
                  <li>
                    • <strong>Edit Alphabet:</strong> Click input symbols to rename or delete them
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Prompt Modal */}
      {prompt.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{prompt.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-input">{prompt.message}</Label>
                <Input
                  id="prompt-input"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  placeholder="Enter value..."
                  autoFocus
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handlePromptCancel}>
                  Cancel
                </Button>
                <Button onClick={handlePromptOk} className="bg-blue-600 hover:bg-blue-700">
                  OK
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Choice Modal */}
      {choice.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onKeyDown={handleChoiceKeyDown}
        >
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{choice.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{choice.message}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleChoiceCancel}>
                  Cancel
                </Button>
                <Button onClick={handleChoiceOption1} className="bg-blue-600 hover:bg-blue-700">
                  {choice.option1}
                </Button>
                <Button onClick={handleChoiceOption2} className="bg-red-600 hover:bg-red-700">
                  {choice.option2}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Result Modal */}
      {testResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md mx-4 shadow-2xl rounded-lg overflow-hidden ${
              testResult.accepted
                ? "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200"
                : "bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200"
            }`}
          >
            <div className="p-6 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  testResult.accepted ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {testResult.accepted ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${testResult.accepted ? "text-green-800" : "text-red-800"}`}>
                String {testResult.accepted ? "Accepted" : "Rejected"}
              </h3>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">Test String:</p>
                <div className="bg-white/70 rounded-lg px-4 py-2 font-mono text-lg border relative group">
                  {testResult.testString ? (
                    <>
                      <span className="break-all">
                        {showFullString || testResult.testString.length <= STRING_DISPLAY_LIMIT
                          ? testResult.testString
                          : truncateString(testResult.testString, STRING_DISPLAY_LIMIT)}
                      </span>

                      {/* Tooltip for full string */}
                      {testResult.testString.length > STRING_DISPLAY_LIMIT && !showFullString && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs break-all">
                          {testResult.testString}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}

                      {/* Click to expand/collapse for very long strings */}
                      {testResult.testString.length > STRING_DISPLAY_LIMIT && (
                        <button
                          onClick={() => setShowFullString(!showFullString)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline focus:outline-none"
                        >
                          {showFullString ? "Show less" : "Show more"}
                        </button>
                      )}
                    </>
                  ) : (
                    "(empty string)"
                  )}
                </div>
              </div>

              <p className={`text-sm mb-4 ${testResult.accepted ? "text-green-700" : "text-red-700"}`}>
                {testResult.accepted
                  ? "The string was successfully accepted by the automaton."
                  : "The string was rejected by the automaton."}
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={showSequenceView}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Sequence
                </button>
                <button
                  onClick={() => setTestResult(null)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    testResult.accepted
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State Sequence Visualization Modal */}
      {sequenceView.isOpen && sequenceView.data && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">State Transition Sequence</h2>
                <button
                  onClick={() => setSequenceView({ isOpen: false, data: null })}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Test String:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {sequenceView.data.testString || "(empty)"}
                </span>
                <span
                  className={`ml-4 px-2 py-1 rounded text-white text-xs ${sequenceView.data.accepted ? "bg-green-500" : "bg-red-500"}`}
                >
                  {sequenceView.data.accepted ? "ACCEPTED" : "REJECTED"}
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Input character breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Input Processing</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sequenceView.data.testString.split("").map((char, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono text-sm">
                        <span className="text-xs text-blue-600">#{index + 1}</span> {char}
                      </div>
                    ))}
                    {sequenceView.data.testString === "" && (
                      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm italic">
                        Empty string (ε)
                      </div>
                    )}
                  </div>
                </div>

                {/* State sequence visualization */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">State Transitions</h3>
                  <div className="space-y-4">
                    {sequenceView.data.path.map((state, index) => (
                      <div key={index} className="flex items-center">
                        {/* State circle */}
                        <div
                          className={`relative flex items-center justify-center w-16 h-16 rounded-full border-2 font-semibold text-sm ${
                            index === 0
                              ? "bg-blue-100 border-blue-500 text-blue-800" // Start state
                              : index === sequenceView.data!.path.length - 1
                                ? sequenceView.data!.accepted
                                  ? "bg-green-100 border-green-500 text-green-800" // Final accepting
                                  : "bg-red-100 border-red-500 text-red-800" // Final rejecting
                                : "bg-gray-100 border-gray-400 text-gray-700" // Intermediate
                          }`}
                        >
                          {state.label || state.id}
                          {state.accepts && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Step information */}
                        <div className="ml-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {index === 0 ? "Start State" : `Step ${index}`}
                            </span>
                            {index > 0 && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                Input: {sequenceView.data!.testString[index - 1] || "ε"}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            State: {state.label || state.id}
                            {state.accepts && <span className="ml-2 text-green-600 font-medium">(Accepting)</span>}
                          </div>
                        </div>

                        {/* Arrow to next state */}
                        {index < sequenceView.data!.path.length - 1 && (
                          <div className="ml-4">
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result summary */}
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    sequenceView.data.accepted ? "bg-green-50 border-l-green-500" : "bg-red-50 border-l-red-500"
                  }`}
                >
                  <h4 className={`font-semibold ${sequenceView.data.accepted ? "text-green-800" : "text-red-800"}`}>
                    Result: {sequenceView.data.accepted ? "String Accepted" : "String Rejected"}
                  </h4>
                  <p className={`text-sm mt-1 ${sequenceView.data.accepted ? "text-green-700" : "text-red-700"}`}>
                    {sequenceView.data.accepted
                      ? `The string was fully processed and ended in an accepting state (${sequenceView.data.path[sequenceView.data.path.length - 1].label || sequenceView.data.path[sequenceView.data.path.length - 1].id}).`
                      : sequenceView.data.path.length - 1 === sequenceView.data.testString.length
                        ? `The string was fully processed but ended in a non-accepting state (${sequenceView.data.path[sequenceView.data.path.length - 1].label || sequenceView.data.path[sequenceView.data.path.length - 1].id}).`
                        : `The string processing stopped early at step ${sequenceView.data.path.length - 1} due to no valid transition.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
