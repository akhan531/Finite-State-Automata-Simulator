//#region DFA
class state {
  constructor(id, accepts, outs) {
    this.id = id
    this.accepts = accepts
    this.outs = outs
  }
}

let states = [new state(0, false, {})]
const inputs = new Set()
let currentStateCount = 1
let globalId = 1
let startId = null

//DFA functions
function findState(stateId) {
  for (let i = 0; i < currentStateCount; i++) {
    if (states[i].id == stateId) {
      return states[i]
    }
  }
  return null
}

function addLink(state1Id, state2Id, inputVal) {
  const state1 = findState(state1Id)
  const state2 = findState(state2Id)
  if (state1 && state2) {
    if (inputVal in state1.outs && state1.outs[inputVal] !== state2) {
      return false
    } else {
      state1.outs[inputVal] = state2
      return true
    }
  }
}

function removeLink(stateId, inputs) {
  const state = findState(stateId)
  if (inputs && state) {
    const arr = inputs.split(",")
    for (const inputVal of arr) {
      if (inputVal in state.outs) {
        delete state.outs[inputVal]
      }
    }
  }
}

function addState() {
  const newState = new state(globalId, false, {})
  states.push(newState)
  currentStateCount++
  globalId++
  return newState
}

function removeState(stateId) {
  const state = findState(stateId)
  if (!state) return

  for (const s in { ...state.outs }) {
    removeLink(stateId, s)
  }
  states = states.filter((item) => item.id !== stateId)
  if (startId === stateId) {
    startId = null
  }
  currentStateCount--
}

function addInput(inputVal) {
  if (inputVal.length !== 1) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Input value must be a single character.", "warning")
    }
    return false
  }
  inputs.add(inputVal)
  return true
}

function deleteInput(inputVal) {
  inputs.delete(inputVal)
  for (let i = 0; i < currentStateCount; i++) {
    const state = states[i]
    if (inputVal in state.outs) {
      removeLink(state.id, inputVal)
    }
  }
}

function renameInput(oldName, newName) {
  if (newName.length !== 1) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Input value must be a single character.", "warning")
    }
    return false
  }
  inputs.delete(oldName)
  inputs.add(newName)
  for (let i = 0; i < currentStateCount; i++) {
    const state = states[i]
    if (oldName in state.outs) {
      const end = state.outs[oldName]
      removeLink(state.id, oldName)
      addLink(state.id, end.id, newName)
    }
  }
  return true
}

function test(testString) {
  // Ensure we have a valid start state
  if (startId === null) {
    return null
  }

  const startState = findState(startId)
  if (!startState) {
    return null
  }

  let curr = startState
  const path = [curr]

  // Handle empty string case - just return the start state
  if (!testString || testString.length === 0) {
    return path
  }

  // Process each character in the string
  for (let i = 0; i < testString.length; i++) {
    const inputChar = testString[i]
    if (inputChar in curr.outs) {
      curr = curr.outs[inputChar]
      path.push(curr)
    } else {
      // No valid transition - string is rejected
      return path
    }
  }

  return path
}

//#endregion

//#region Network visualization
const vis = window.vis // Declare the vis variable
const container = document.getElementById("network")
const nodes = new vis.DataSet([
  { id: 0, label: "0", color: "#f0f0f0", x: container.offsetWidth / 2, y: container.offsetHeight / 2 },
])
const edges = new vis.DataSet([])
const data = { nodes, edges }
const options = {
  edges: {
    arrows: "to",
    font: { size: 14 },
    smooth: {
      type: "dynamic",
      roundness: 0.5,
    },
    color: {
      color: "#000000",
      highlight: "#848484",
      hover: "#848484",
      inherit: "none",
    },
  },
  nodes: {
    shape: "circle",
    font: { size: 16 },
    borderWidth: 2,
    color: {
      border: "#000000",
    },
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
  },
  physics: {
    enabled: false,
  },
}

const network = new vis.Network(container, data, options)

// Make nodes and network available globally for the React component
window.nodes = nodes
window.network = network

//#endregion

//#region Functions

// State management
let isAddingLink = false
let linkSourceNode = null
let isRemovingState = false
let isRenamingState = false
let isSettingStartState = false
let isSwitchingAccepting = false
let isRemovingLink = false
let linkDestNode = null

// Input alphabet management
const inputList = document.getElementById("input-list")
const addInputButton = document.getElementById("add-input")

function clearSelections() {
  isAddingLink = false
  linkSourceNode = null
  isRemovingState = false
  isRenamingState = false
  isSettingStartState = false
  isSwitchingAccepting = false
  isRemovingLink = false
  linkDestNode = null
}

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

async function animateNodes(testString) {
  try {
    // Ensure testString is a string (handle null/undefined)
    const inputString = testString || ""

    // Test the string and get the path
    const path = test(inputString)

    // Handle case where no start state is set or path is invalid
    if (!path || path.length === 0) {
      if (window.showInPageAlert) {
        window.showInPageAlert("Error: No valid start state or invalid DFA configuration.", "warning")
      }
      return
    }

    const timing = 0.15

    // Determine if string is accepted
    let accepted = false
    const finalState = path[path.length - 1]

    if (inputString.length === 0) {
      // Empty string: accepted if start state is accepting
      accepted = finalState.accepts
    } else {
      // Non-empty string: accepted if we processed all characters and ended in accepting state
      accepted = finalState.accepts && path.length - 1 === inputString.length
    }

    // Store the test sequence data with node labels
    const sequenceData = {
      path: path.map((state) => ({
        id: state.id,
        label: nodes.get(state.id)?.label || state.id.toString(),
        accepts: state.accepts,
      })),
      testString: inputString,
      accepted: accepted,
    }

    // Store globally so React component can access it
    window.lastTestSequenceData = sequenceData

    // Animation logic
    if (inputString.length === 0) {
      // Empty string animation - just highlight the start state
      const startState = path[0]
      nodes.update({ id: startState.id, color: "#f1ff75" })
      await sleep(timing)

      const finalColor = accepted ? "#b3ffab" : "#f07f7f"
      nodes.update({ id: startState.id, color: finalColor })
      await sleep(timing)

      // Show test result
      if (window.showTestResult) {
        window.showTestResult(accepted, inputString)
      }

      // Reset color
      nodes.update({ id: startState.id, color: "#f0f0f0" })
    } else {
      // Non-empty string animation - animate through all states in path
      for (let i = 0; i < path.length; i++) {
        const node = path[i]
        nodes.update({ id: node.id, color: "#f1ff75" })
        await sleep(timing)
        nodes.update({ id: node.id, color: "#f0f0f0" })
        await sleep(0.05)
      }

      // Highlight final state with result color
      const finalColor = accepted ? "#b3ffab" : "#f07f7f"
      nodes.update({ id: finalState.id, color: finalColor })
      await sleep(timing)

      // Show test result
      if (window.showTestResult) {
        window.showTestResult(accepted, inputString)
      }

      // Reset final state color
      nodes.update({ id: finalState.id, color: "#f0f0f0" })
    }
  } catch (error) {
    console.error("Error in animateNodes:", error)
    if (window.showInPageAlert) {
      window.showInPageAlert("Error occurred during string testing. Please check your DFA configuration.", "warning")
    }
  }
}

// Node counter
const nodeCounter = document.getElementById("node-counter")

// Function to update the node counter
function updateNodeCounter() {
  if (nodeCounter) {
    nodeCounter.textContent = `States: ${currentStateCount}`
  }
}

// Function to update the node positions
function updateNodePositions() {
  const spacing = 80
  const allNodes = nodes.get({
    filter: (node) => node.id !== -1,
  })
  const len = allNodes.length
  if (len < 2) return

  try {
    const saveNode = allNodes[len - 2]
    const lastNode = allNodes[len - 1]

    // Try to get position from network first
    const positions = network.getPositions([saveNode.id])
    let x, y

    if (
      positions &&
      positions[saveNode.id] &&
      positions[saveNode.id].x !== undefined &&
      positions[saveNode.id].y !== undefined
    ) {
      x = positions[saveNode.id].x
      y = positions[saveNode.id].y
    } else {
      // Fallback to node data
      const nodeData = nodes.get(saveNode.id)
      if (nodeData && nodeData.x !== undefined && nodeData.y !== undefined) {
        x = nodeData.x
        y = nodeData.y
      } else {
        // Final fallback
        x = container.offsetWidth / 2
        y = container.offsetHeight / 2
      }
    }

    nodes.update({ id: lastNode.id, x: x + spacing, y: y })
  } catch (error) {
    console.error("Error updating node positions:", error)
    // Don't update positions if there's an error
  }
}

// Function to update the input alphabet list
function updateInputList() {
  if (inputList) {
    inputList.innerHTML = Array.from(inputs)
      .map(
        (input) => `
            <div onclick="handleInputClick('${input}')">${input}</div>
        `,
      )
      .join("")
  }
}

// Function to handle input alphabet click (rename/delete) - made async
async function handleInputClick(input) {
  if (!window.showCustomChoice) return

  try {
    const action = await window.showCustomChoice("Input Action", `Choose action for "${input}":`, "Rename", "Delete")

    if (action === "1") {
      if (!window.showCustomPrompt) return

      const newName = await window.showCustomPrompt("Rename Input", `Enter new name for "${input}":`)

      if (newName && newName.length === 1) {
        if (renameInput(input, newName)) {
          updateInputList()
          for (const edge of edges.get()) {
            if (edge.label) {
              let arr = edge.label.split(",")
              if (arr.includes(input)) {
                for (let i = 0; i < arr.length; i++) {
                  if (arr[i] == input) {
                    arr[i] = newName
                  }
                }
              }
              arr = [...new Set(arr)]
              edges.update({ id: edge.id, label: arr.join() })
            }
          }
        }
      } else if (newName !== null && newName.length !== 1) {
        if (window.showInPageAlert) {
          window.showInPageAlert("Input value must be a single character.", "warning")
        }
      }
    } else if (action === "2") {
      deleteInput(input)
      updateInputList()
      for (const edge of edges.get()) {
        if (edge.label) {
          let arr = edge.label.split(",")
          if (arr.includes(input)) {
            if (arr.length === 1) {
              edges.remove(edge.id)
            } else {
              arr = arr.filter((item) => item !== input)
              arr = [...new Set(arr)]
              edges.update({ id: edge.id, label: arr.join() })
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in handleInputClick:", error)
  }
}

// Make handleInputClick available globally
window.handleInputClick = handleInputClick

// Initialize the node counter and input list
updateNodeCounter()
updateInputList()
updateNodePositions()

//#endregion

//#region Buttons
// Add State Button
document.getElementById("add-state").addEventListener("click", async () => {
  clearSelections()

  if (!window.showCustomPrompt) return

  try {
    const stateName = await window.showCustomPrompt("Add State", "Enter a name for the new state:")

    if (stateName) {
      const newState = addState()
      if (newState) {
        nodes.add({ id: newState.id, label: stateName, color: "#f0f0f0" })
        updateNodeCounter()
        updateNodePositions()
      }
    }
  } catch (error) {
    console.error("Error adding state:", error)
  }
})

// Remove State Button
document.getElementById("remove-state").addEventListener("click", () => {
  clearSelections()
  if (currentStateCount === 1) {
    if (window.showInPageAlert) {
      window.showInPageAlert("You must have at least one state.", "warning")
    }
  } else {
    isRemovingState = true
    if (window.showInPageAlert) {
      window.showInPageAlert("Click on a state in the diagram to remove it.", "info")
    }
  }
})

// Rename State Button
document.getElementById("rename-state").addEventListener("click", () => {
  clearSelections()
  isRenamingState = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram to rename it.", "info")
  }
})

// Setting Start State Button
document.getElementById("set-start-state").addEventListener("click", () => {
  clearSelections()
  isSettingStartState = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram to make it the starting state.", "info")
  }
})

// Switch Accepting Button
document.getElementById("switch-accepting").addEventListener("click", () => {
  clearSelections()
  isSwitchingAccepting = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram to toggle whether it is accepting or not.", "info")
  }
})

// Add Link Button
document.getElementById("add-link").addEventListener("click", () => {
  clearSelections()
  isAddingLink = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram as the source node.", "info")
  }
})

// Remove Link Button
document.getElementById("remove-link").addEventListener("click", () => {
  clearSelections()
  isRemovingLink = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a transition in the diagram to remove it.", "info")
  }
})

// Test Button - Enhanced for better empty string handling
document.getElementById("test").addEventListener("click", async () => {
  clearSelections()

  // Check if start state is set
  if (startId === null) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Set a starting state before testing.", "warning")
    }
    return
  }

  // Verify start state still exists
  if (!findState(startId)) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Start state no longer exists. Please set a new start state.", "warning")
    }
    startId = null
    return
  }

  if (!window.showCustomPrompt) return

  try {
    const testString = await window.showCustomPrompt(
      "Test String",
      "Enter a string to test:\n(Leave empty to test the empty string ε)",
    )

    // Handle user cancellation
    if (testString === null) {
      return
    }

    // Convert to empty string if needed and animate
    const actualTestString = testString === null ? "" : testString
    await animateNodes(actualTestString)
  } catch (error) {
    console.error("Error in test button handler:", error)
    if (window.showInPageAlert) {
      window.showInPageAlert("Error occurred during testing. Please try again.", "warning")
    }
  }
})

// Add Input Button
addInputButton.addEventListener("click", async () => {
  if (!window.showCustomPrompt) return

  try {
    const inputVal = await window.showCustomPrompt("Add Input", "Enter a new input value (1 character):")
    if (inputVal && inputVal !== " " && inputVal.length === 1) {
      if (addInput(inputVal)) {
        updateInputList()
      }
    } else if (inputVal !== null && inputVal.length !== 1) {
      if (window.showInPageAlert) {
        window.showInPageAlert("Input value must be a single character.", "warning")
      }
    }
  } catch (error) {
    console.error("Error adding input:", error)
  }
})





//#endregion

// Network event listeners
network.on("click", async (event) => {
  try {
    const { nodes: clickedNodes, edges: clickedEdges } = event

    if (isRemovingState && clickedNodes.length > 0) {
      const stateId = clickedNodes[0]
      if (stateId !== -1) {
        removeState(stateId)
        nodes.remove(stateId)
        updateNodeCounter()
        isRemovingState = false

        if (window.hideInPageAlert) {
          window.hideInPageAlert()
        }
      }
    }

    if (isRenamingState && clickedNodes.length > 0) {
      const stateId = clickedNodes[0]
      if (stateId !== -1) {
        if (!window.showCustomPrompt) return

        const newName = await window.showCustomPrompt("Rename State", "Enter a new name for the state:")
        if (newName) {
          nodes.update({ id: stateId, label: newName })
        }
        isRenamingState = false

        if (window.hideInPageAlert) {
          window.hideInPageAlert()
        }
      }
      
    }

    if (isSettingStartState && clickedNodes.length > 0) {
      const stateId = clickedNodes[0]
      if (stateId !== -1) {
        if (startId !== null) {
          edges.remove(network.getConnectedEdges(-1))
          nodes.remove(-1)
        }
        startId = stateId

        // Safely get node position with fallback
        try {
          const positions = network.getPositions([startId])
          let nodePosition = { x: 0, y: 0 } // Default position

          if (positions && positions[startId]) {
            nodePosition = positions[startId]
          } else {
            // Fallback: get position from nodes dataset
            const nodeData = nodes.get(startId)
            if (nodeData && nodeData.x !== undefined && nodeData.y !== undefined) {
              nodePosition = { x: nodeData.x, y: nodeData.y }
            } else {
              // Final fallback: use container center
              nodePosition = {
                x: container.offsetWidth / 2 - 100,
                y: container.offsetHeight / 2,
              }
            }
          }

          nodes.add({
            id: -1,
            color: "transparent",
            x: nodePosition.x - 100,
            y: nodePosition.y,
          })
          edges.add({
            from: -1,
            to: startId,
            arrows: "to",
            smooth: { enabled: false },
          })
        } catch (error) {
          console.error("Error setting start state position:", error)
          // Add start indicator without specific positioning
          nodes.add({ id: -1, color: "transparent" })
          edges.add({
            from: -1,
            to: startId,
            arrows: "to",
            smooth: { enabled: false },
          })
        }

        isSettingStartState = false

        if (window.hideInPageAlert) {
          window.hideInPageAlert()
        }
      }
    }

    if (isSwitchingAccepting && clickedNodes.length > 0) {
      const stateId = clickedNodes[0]
      if (stateId !== -1) {
        const state = findState(stateId)
        if (state) {
          state.accepts = !state.accepts
          if (state.accepts) {
            nodes.update({ id: stateId, borderWidth: 5 })
          } else {
            nodes.update({ id: stateId, borderWidth: 2 })
          }
        }
        isSwitchingAccepting = false

        if (window.hideInPageAlert) {
          window.hideInPageAlert()
        }
      }
    }

    if (isAddingLink && clickedNodes.length > 0) {
      if (linkSourceNode === null) {
        linkSourceNode = clickedNodes[0]
        if (linkSourceNode !== -1) {
          if (window.showInPageAlert) {
            window.showInPageAlert("Click on a state in the diagram as the destination node.", "info")
          }
        }
      } else {
        linkDestNode = clickedNodes[0]
        if (linkDestNode !== -1) {
          if (!window.showCustomPrompt) return

          try {
            const inputVal = await window.showCustomPrompt(
              "Add Transition",
              "Enter the input value for the transition (1 character):",
            )

            if (inputVal) {
              const addingNewInput = !inputs.has(inputVal) && inputs.size < 10
              const isValidInput = inputVal !== " " && inputVal.length === 1

              if (addingNewInput && isValidInput) {
                addInput(inputVal)
                updateInputList()
              }

              if (inputs.has(inputVal) || (addingNewInput && isValidInput)) {
                const isDFA = addLink(linkSourceNode, linkDestNode, inputVal)
                if (isDFA) {
                  let existingLinkId = null
                  for (const edge of edges.get()) {
                    if (edge.from === linkSourceNode && edge.to === linkDestNode) {
                      existingLinkId = edge.id
                    }
                  }
                  if (existingLinkId === null) {
                    edges.add({
                      from: linkSourceNode,
                      to: linkDestNode,
                      label: inputVal,
                    })
                  } else {
                    const edge = edges.get(existingLinkId)
                    const prevLabel = edge.label || ""
                    if (!prevLabel.includes(inputVal)) {
                      edges.update({ id: existingLinkId, label: prevLabel + (prevLabel ? "," : "") + inputVal })
                    }
                  }
                  if (window.hideInPageAlert) {
                    window.hideInPageAlert()
                  }
                } else if (!isValidInput) {
                  if (window.showInPageAlert) {
                    window.showInPageAlert("Input value must be a single character.", "warning")
                  }
                } else {
                  const sourceNodeLabel = nodes.get(linkSourceNode)?.label || linkSourceNode
                  if (window.showInPageAlert) {
                    window.showInPageAlert(
                      sourceNodeLabel + " already has a transition for the input " + inputVal + ".",
                      "warning",
                    )
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error in add link handler:", error)
            if (window.showInPageAlert) {
              window.showInPageAlert("Error occurred while adding transition. Please try again.", "warning")
            }
          }

          linkSourceNode = null
          isAddingLink = false
        }
      }
    }

    if (isRemovingLink && clickedEdges.length > 0) {
      const edge = edges.get(clickedEdges[0])
      if (edge && edge.label) {
        removeLink(edge.from, edge.label)
        edges.remove(clickedEdges[0])
      }
      isRemovingLink = false

      if (window.hideInPageAlert) {
        window.hideInPageAlert()
      }
    }
  } catch (error) {
    console.error("Error in network click handler:", error)
  }
})
